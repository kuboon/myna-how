/**
 * Chapter 4's moving picture: how a website checks that the card's owner is there.
 *
 * Told with the real names and no metaphor or arithmetic: the website sends a fresh question, the
 * chip attaches an electronic signature made with its secret key, and the website checks that
 * signature with the public key in the certificate, then asks J-LIS whether the certificate is
 * still valid. Two switches show why it is safe: a fake card has no secret key, and a signature
 * copied from last time was made for a different question.
 *
 * The signature shown is a stand-in — a short code derived from the question and whose key made
 * it — so the same card and question always give the same code and anything else gives another.
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

/** A stand-in signature: looks like a jumble, depends on the question and on whose key made it. */
function signatureOf(question: string, key: string): string {
  let h = 2166136261;
  for (const ch of key + ":" + question) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  let out = "";
  for (let i = 0; i < 4; i++) {
    out += (h >>> (i * 8) & 0xff).toString(16).padStart(2, "0");
    h = Math.imul(h ^ (h >>> 13), 2246822507) >>> 0;
  }
  return `${out.slice(0, 4)}…${out.slice(4)}`;
}

const REAL_KEY = "card";
const FAKE_KEY = "fake";

/** The first question, fixed so the server and the browser render the same thing. */
const FIRST_QUESTION = "4 8 1 5 2";
/** The question from "last time", for the replay demo. */
const OLD_QUESTION = "9 0 3 7 6";

function newQuestion(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 100000;
  return String(n).padStart(5, "0").split("").join(" ");
}

const captions = [
  "サイトに「マイナカードでログイン」とおすと、サイトは<毎回ちがう「問題」>を作って、カードに送ってくるよ。",
  "暗証番号が合ったら、チップは中の<ひみつのカギ（秘密鍵）>を使って、問題に<電子署名>をつける。電子署名は、そのカードのひみつのカギでしか作れないしるしなんだ。",
  "チップは、<電子署名>と<電子証明書>をサイトに送る。ひみつのカギは送らない。チップの外には一度も出ないよ。",
  "サイトは、電子証明書にのっている<公開のカギ（公開鍵）>で、電子署名をたしかめる。公開のカギでは電子署名は作れないけれど、<本物かどうかはわかる>んだ。",
  "さいごに<J-LIS（カードを発行しているところ）>に「この電子証明書、まだ使える？ なくしたりしてない？」と聞く。OK なら、ログインできる！",
];

export const AuthFlow = clientEntry(
  import.meta.url,
  function AuthFlow(handle: Handle) {
    let step = 0;
    let who: Who = "real";
    let question = FIRST_QUESTION;

    const go = (next: number) => {
      step = Math.max(0, Math.min(captions.length - 1, next));
      handle.update();
    };

    const choose = (w: Who) => {
      who = w;
      step = 0;
      question = newQuestion();
      handle.update();
    };

    return () => {
      const signedQuestion = who === "replay" ? OLD_QUESTION : question;
      const key = who === "fake" ? FAKE_KEY : REAL_KEY;
      const signature = signatureOf(signedQuestion, key);
      const ok = signature === signatureOf(question, REAL_KEY);

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
                ["replay", "🕵️ まえの電子署名を使い回す"],
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

          <div mix={sceneStyle}>
            <div mix={partyStyle}>
              <span mix={partyIconStyle} aria-hidden="true">💻</span>
              <strong>サイト</strong>
              <div mix={boardStyle}>
                <small>今回の問題</small>
                <span mix={questionStyle}>{question}</span>
                {step >= 3
                  ? (
                    <>
                      <small>公開のカギでたしかめると…</small>
                      <span
                        key={`v-${who}-${question}`}
                        mix={[verdictStyle, ok ? okStyle : ngStyle]}
                      >
                        {ok ? "✅ 本物の電子署名" : "❌ 合わない"}
                      </span>
                    </>
                  )
                  : null}
                {step >= 4 && ok
                  ? (
                    <span key="jlis" mix={[verdictStyle, okStyle]}>
                      🏢 J-LIS「まだ使えるよ」
                    </span>
                  )
                  : null}
              </div>
            </div>

            <div mix={wireStyle} aria-hidden="true">
              {step === 0
                ? (
                  <span key={`q-${question}`} mix={[packetStyle, toRightStyle]}>
                    ❓ →
                  </span>
                )
                : step === 2
                ? (
                  <span key="s" mix={[packetStyle, toLeftStyle]}>
                    ← ✍️📜
                  </span>
                )
                : null}
            </div>

            <div mix={partyStyle}>
              <span mix={partyIconStyle} aria-hidden="true">
                {who === "fake" ? "🦹" : who === "replay" ? "🕵️" : "🪪"}
              </span>
              <strong>
                {who === "real"
                  ? "カードのチップ"
                  : who === "fake"
                  ? "にせものカード"
                  : "のぞき見した人"}
              </strong>
              <div mix={boardStyle}>
                <small>もっているもの</small>
                <span mix={tokenStyle}>
                  {who === "fake"
                    ? "ひみつのカギがない"
                    : who === "replay"
                    ? "まえの電子署名のメモ"
                    : "🔑 ひみつのカギ（中だけ）"}
                </span>
                {step >= 1
                  ? (
                    <>
                      <small>
                        {who === "replay"
                          ? `まえの問題（${OLD_QUESTION}）の電子署名`
                          : "つけた電子署名"}
                      </small>
                      <span
                        key={`sig-${who}-${question}`}
                        mix={signatureStyle}
                      >
                        ✍️ {signature}
                      </span>
                    </>
                  )
                  : null}
              </div>
            </div>
          </div>

          <p key={`c-${step}-${who}`} mix={captionStyle} aria-live="polite">
            {emphasize(captions[step])}
            {step >= 3 && who === "fake"
              ? (
                <>
                  <br />
                  <strong>
                    ひみつのカギがないと、本物の電子署名は作れない。
                  </strong>
                  だから、たしかめると合わないよ。
                </>
              )
              : null}
            {step >= 3 && who === "replay"
              ? (
                <>
                  <br />
                  <strong>
                    まえの電子署名は、まえの問題につけたもの。今回の問題とはちがうから合わない。
                  </strong>
                  毎回ちがう問題を出すのは、このためなんだ。
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
                  ❓ ちがう問題でもう一回
                </button>
              </p>
            )
            : null}
        </div>
      );
    };
  },
);

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

const sceneStyle = css({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 3.5rem minmax(0, 1fr)",
  alignItems: "start",
  gap: "0.25rem",
});

const partyStyle = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.2rem",
  textAlign: "center",
});

const partyIconStyle = css({ fontSize: "2.4rem" });

const boardStyle = css({
  width: "100%",
  minHeight: "10rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.25rem",
  padding: "0.6rem",
  borderRadius: radius.md,
  background: color.card,
  border: `1px solid ${color.border}`,
  "& small": { color: color.muted, fontSize: "0.75rem" },
});

const questionStyle = css({
  fontFamily: "var(--font-mono)",
  fontWeight: 800,
  fontSize: "1.1rem",
  letterSpacing: "0.05em",
});

const tokenStyle = css({
  padding: "0.1rem 0.5rem",
  borderRadius: "999px",
  background: art.goldLight,
  fontWeight: 700,
  fontSize: "0.8rem",
});

const signatureStyle = css({
  padding: "0.15rem 0.5rem",
  borderRadius: radius.sm,
  border: `2px solid ${color.accent}`,
  fontFamily: "var(--font-mono)",
  fontWeight: 800,
  fontSize: "0.95rem",
  animation: "pop-in 400ms ease-out",
});

const verdictStyle = css({
  padding: "0.1rem 0.5rem",
  borderRadius: radius.sm,
  fontWeight: 800,
  fontSize: "0.85rem",
  animation: "pop-in 350ms ease-out",
});

const okStyle = css({ background: art.softGreen, color: art.ok });
const ngStyle = css({ background: art.softRed, color: art.ng });

const wireStyle = css({
  alignSelf: "center",
  display: "flex",
  justifyContent: "center",
  height: "2rem",
  borderBottom: `3px dotted ${color.border}`,
});

const packetStyle = css({ fontSize: "1.1rem", whiteSpace: "nowrap" });

const toRightStyle = css({
  animation: "travel-right 1.2s ease-in-out infinite",
});
const toLeftStyle = css({ animation: "travel-left 1.2s ease-in-out infinite" });

const againStyle = css({ textAlign: "center" });
