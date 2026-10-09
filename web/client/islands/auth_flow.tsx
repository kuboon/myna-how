/**
 * Chapter 4's moving picture: the real mechanism, with small numbers.
 *
 * This is RSA, the kind of public-key cryptography a My Number Card uses, shrunk until a child can
 * follow it: the "big number" is 33 (= 3 × 11), the secret number (private key) is 7 and the shown
 * number (public key) is 3. Raising to the 7th power and then to the 3rd, each time keeping only
 * the remainder after dividing by 33, brings any number back to itself. The chip does the first
 * half with its secret; the website does the second half with the public number and checks that
 * it got its own number back.
 *
 * Every multiplication is shown, one per beat, because "multiply, then keep the remainder" is the
 * whole of it — no metaphor needed. Two switches show why it is safe: a fake card does not know 7,
 * and an answer copied from last time was for a different number.
 */

import { clientEntry, css, type Handle, on } from "@remix-run/component";

import {
  buttonStyle,
  captionStyle,
  emphasize,
  primaryStyle,
  StepBar,
} from "../ui/controls.tsx";
import { art, color, radius } from "../tokens.ts";

type Who = "real" | "fake" | "replay";

/** The toy key pair: 33 = 3 × 11, and 3 × 7 = 21 leaves 1 when divided by 20 = (3 − 1) × (11 − 1). */
const N = 33;
const SECRET = 7;
const PUBLIC = 3;
/** What a fake card guesses for the secret. */
const FAKE_SECRET = 9;

/** The first number, fixed so the server and the browser render the same thing. */
const FIRST_CHALLENGE = 5;
/** The number from "last time", for the replay demo. */
const OLD_CHALLENGE = 8;

/**
 * Numbers that make a good demo: the secret calculation changes them, and a fake card's answer
 * does not come back to them by luck.
 */
const CHALLENGES = Array.from({ length: N - 3 }, (_, i) => i + 2).filter((m) =>
  power(m, SECRET).at(-1) !== m &&
  power(power(m, FAKE_SECRET).at(-1)!, PUBLIC).at(-1) !== m
);

/**
 * Multiplies `base` by itself `times` times, keeping the remainder after dividing by 33 at every
 * step. Returns each intermediate result, starting from `base` itself.
 */
function power(base: number, times: number): number[] {
  const out = [base];
  let x = base;
  for (let i = 1; i < times; i++) {
    x = (x * base) % N;
    out.push(x);
  }
  return out;
}

function newChallenge(previous: number): number {
  const pool = CHALLENGES.filter((m) => m !== previous && m !== OLD_CHALLENGE);
  return pool[crypto.getRandomValues(new Uint32Array(1))[0] % pool.length];
}

const captions = [
  "サイトに「マイナカードでログイン」とおすと、サイトは<毎回ちがう数>を決めて、カードに送るよ。今回は <{m}> だ。",
  "チップは、暗証番号が合ったら、中にしまってある<ひみつの数 7> を使って計算する。「{m} を <7 回かけて>、33 でわったあまり」を出すんだ。",
  "チップは<答えだけ>をサイトに送る。ひみつの数 7 は、チップの外に出ないよ。",
  "サイトは、証明書にのっている<みんなに見せる数 3> を使って、とどいた答えを「<3 回かけて>、33 でわったあまり」にする。<はじめの数 {m} にもどったら>、ひみつの数を持っている本物のカードだ！",
  "さいごに<J-LIS（カードを発行しているところ）>に「この証明書、まだ使える？ なくしたりしてない？」と聞いて、OK ならログインできる。",
];

export const AuthFlow = clientEntry(
  import.meta.url,
  function AuthFlow(handle: Handle) {
    let step = 0;
    let who: Who = "real";
    let challenge = FIRST_CHALLENGE;

    const go = (next: number) => {
      step = Math.max(0, Math.min(captions.length - 1, next));
      handle.update();
    };

    const choose = (w: Who) => {
      who = w;
      step = 0;
      challenge = newChallenge(challenge);
      handle.update();
    };

    return () => {
      // What the card side sends back.
      const signChain = who === "real"
        ? power(challenge, SECRET)
        : who === "fake"
        ? power(challenge, FAKE_SECRET)
        : power(OLD_CHALLENGE, SECRET);
      const answer = signChain.at(-1)!;
      // What the website gets when it checks that answer.
      const checkChain = power(answer, PUBLIC);
      const back = checkChain.at(-1)!;
      const ok = back === challenge;
      const fill = (text: string) => text.replaceAll("{m}", String(challenge));

      return (
        <div>
          <div
            mix={chooserStyle}
            role="group"
            aria-label="だれがログインする？"
          >
            {(
              [
                ["real", "🙂 本物のカード"],
                ["fake", "🦹 にせものカード"],
                ["replay", "🕵️ まえの答えを使い回す"],
              ] as const
            ).map(([w, label]) => (
              <button
                key={w}
                type="button"
                aria-pressed={who === w ? "true" : "false"}
                mix={[
                  buttonStyle,
                  chooserButtonStyle,
                  on("click", () => choose(w)),
                ]}
              >
                {label}
              </button>
            ))}
          </div>

          <div mix={holdersStyle}>
            <div mix={holderStyle}>
              <span aria-hidden="true">💻</span>
              <strong>サイト</strong>
              <small>
                みんなに見せる数 <b mix={pubStyle}>3</b> と <b>33</b>
              </small>
            </div>
            <div mix={holderStyle}>
              <span aria-hidden="true">
                {who === "fake" ? "🦹" : who === "replay" ? "🕵️" : "🪪"}
              </span>
              <strong>
                {who === "real"
                  ? "カードのチップ"
                  : who === "fake"
                  ? "にせものカード"
                  : "のぞき見した人"}
              </strong>
              <small>
                {who === "real"
                  ? (
                    <>
                      ひみつの数 <b mix={secretStyle}>7</b>（中だけ）
                    </>
                  )
                  : who === "fake"
                  ? (
                    <>
                      7 を知らないので <b mix={secretStyle}>9</b> でためす
                    </>
                  )
                  : <>まえの答え（数 {OLD_CHALLENGE} のときのもの）</>}
              </small>
            </div>
          </div>

          <div mix={boardStyle} aria-live="polite">
            <p mix={challengeStyle}>
              今回の数：<b mix={bigNumberStyle}>{challenge}</b>
            </p>

            {step >= 1
              ? (
                <p mix={ruleStyle}>
                  計算のきまり：かけ算をするたびに、<b>
                    33 でわったあまり
                  </b>だけをのこす（例：25 × 5 = 125 → 125 ÷ 33 = 3 あまり{" "}
                  <b>26</b>）
                </p>
              )
              : null}

            {step >= 1
              ? (
                <div key={`sign-${who}-${challenge}`}>
                  <p mix={rowTitleStyle}>
                    {who === "real"
                      ? "チップの計算（ひみつの数 7 を使う）"
                      : who === "fake"
                      ? "にせものカードの計算（9 でためす）"
                      : `計算しないで、まえの答えをそのまま送る（数 ${OLD_CHALLENGE} の答え）`}
                  </p>
                  {who === "replay"
                    ? <Chain chain={[answer]} base={null} />
                    : <Chain chain={signChain} base={challenge} />}
                </div>
              )
              : null}

            {step >= 2
              ? (
                <p key={`send-${who}-${challenge}`} mix={sendStyle}>
                  📨 サイトへ送るもの：答え <b mix={bigNumberStyle}>{answer}</b>
                  {"　"}
                  <small>（ひみつの数は送らない）</small>
                </p>
              )
              : null}

            {step >= 3
              ? (
                <div key={`check-${who}-${challenge}`}>
                  <p mix={rowTitleStyle}>
                    サイトのたしかめ（みんなに見せる数 3 を使う）
                  </p>
                  <Chain chain={checkChain} base={answer} />
                  <p
                    mix={[verdictStyle, ok ? okStyle : ngStyle]}
                    style={{ animationDelay: `${checkChain.length * 0.45}s` }}
                  >
                    {ok
                      ? `✅ ${back} にもどった！ 今回の数 ${challenge} と同じ → 本物のカード`
                      : `❌ ${back} になった。今回の数 ${challenge} とちがう → ログインできない`}
                  </p>
                </div>
              )
              : null}

            {step >= 4 && ok
              ? (
                <p mix={[verdictStyle, okStyle]}>
                  🏢 J-LIS「この証明書は、まだ使えるよ」→ ログインできた！
                </p>
              )
              : null}
          </div>

          <p key={`c-${step}-${who}`} mix={captionStyle}>
            {emphasize(fill(captions[step]))}
            {step >= 3 && who === "fake"
              ? (
                <>
                  <br />
                  <strong>
                    ひみつの数を知らないと、もとの数にもどる答えは作れない。
                  </strong>
                  だから、にせものカードはログインできないよ。
                </>
              )
              : null}
            {step >= 3 && who === "replay"
              ? (
                <>
                  <br />
                  <strong>
                    まえの答えは、まえの数（{OLD_CHALLENGE}）にもどる答え。今回の数とはちがうね。
                  </strong>
                  毎回ちがう数を使うのは、このためなんだ。
                </>
              )
              : null}
          </p>
          <StepBar step={step} total={captions.length} onGo={go} />
          {step === captions.length - 1
            ? (
              <p mix={againStyle}>
                <button
                  type="button"
                  mix={[
                    buttonStyle,
                    primaryStyle,
                    on("click", () => choose(who)),
                  ]}
                >
                  🔢 ちがう数でもう一回
                </button>
              </p>
            )
            : null}
        </div>
      );
    };
  },
);

/**
 * One calculation, a multiplication per beat: `base`, then "× base → remainder" until the end.
 * With `base` null the chain is a single number that was not calculated at all.
 */
function Chain(handle: Handle<{ chain: number[]; base: number | null }>) {
  return () => {
    const { chain, base } = handle.props;
    return (
      <ol mix={chainStyle}>
        {chain.map((value, i) => (
          <li
            key={i}
            mix={chainItemStyle}
            style={{ animationDelay: `${i * 0.45}s` }}
          >
            {i === 0 ? <b>{value}</b> : (
              <>
                <small>×{base}→</small>
                <b>{value}</b>
              </>
            )}
          </li>
        ))}
      </ol>
    );
  };
}

const chooserStyle = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "0.4rem",
  marginBottom: "0.75rem",
});

const chooserButtonStyle = css({
  minHeight: "2.25rem",
  padding: "0.3rem 0.8rem",
  fontSize: "0.85rem",
  borderRadius: "999px",
  '&[aria-pressed="true"]': {
    background: color.accent,
    borderColor: color.accent,
    color: color.onAccent,
  },
});

const holdersStyle = css({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0.5rem",
});

const holderStyle = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.1rem",
  padding: "0.5rem",
  borderRadius: radius.md,
  background: color.card,
  textAlign: "center",
  "& > span": { fontSize: "2rem" },
  "& small": { fontSize: "0.8rem", lineHeight: 1.5 },
});

const pubStyle = css({ color: color.accent, fontSize: "1.1rem" });
const secretStyle = css({ color: art.warm, fontSize: "1.1rem" });

const boardStyle = css({
  marginTop: "0.6rem",
  padding: "0.75rem",
  minHeight: "8rem",
  border: `1px solid ${color.border}`,
  borderRadius: radius.md,
  background: color.bg,
  "& p": { margin: "0.3rem 0" },
});

const ruleStyle = css({
  padding: "0.3rem 0.6rem",
  borderRadius: radius.sm,
  background: color.card,
  fontSize: "0.85rem !important",
  lineHeight: "1.6 !important",
});

const challengeStyle = css({ fontWeight: 700, textAlign: "center" });

const bigNumberStyle = css({
  fontFamily: "var(--font-mono)",
  fontSize: "1.4rem",
  padding: "0 0.3rem",
});

const rowTitleStyle = css({
  marginTop: "0.6rem !important",
  fontWeight: 700,
  fontSize: "0.9rem !important",
  color: color.muted,
});

const chainStyle = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "0.3rem",
  margin: 0,
  padding: 0,
  listStyle: "none",
});

const chainItemStyle = css({
  display: "inline-flex",
  alignItems: "baseline",
  gap: "0.15rem",
  margin: 0,
  padding: "0.15rem 0.45rem",
  borderRadius: "999px",
  background: art.softBlue,
  fontFamily: "var(--font-mono)",
  fontSize: "1rem !important",
  lineHeight: "1.6 !important",
  animation: "pop-in 300ms ease-out both",
  "& small": { color: color.muted, fontSize: "0.75rem" },
});

const sendStyle = css({
  marginTop: "0.6rem !important",
  fontWeight: 700,
  animation: "pop-in 350ms ease-out",
  "& small": { color: color.muted, fontWeight: 400 },
});

const verdictStyle = css({
  padding: "0.4rem 0.6rem",
  borderRadius: radius.sm,
  fontWeight: 800,
  fontSize: "0.95rem !important",
  animation: "pop-in 350ms ease-out both",
});

const okStyle = css({ background: art.softGreen, color: art.ok });
const ngStyle = css({ background: art.softRed, color: art.ng });

const againStyle = css({ textAlign: "center" });
