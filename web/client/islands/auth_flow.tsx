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
function newQuestion(not?: string): string {
  for (;;) {
    const n = crypto.getRandomValues(new Uint32Array(1))[0] % 100000;
    const q = String(n).padStart(5, "0").split("").join(" ");
    if (q !== not) return q;
  }
}

const captions = [
  "サイトに「マイナカードでログイン」とおすと、サイトは<毎回ちがう「問題」>を作って、カードに送ってくるよ。",
  "暗証番号が合ったら、チップは中の<ひみつのカギ（秘密鍵）>を使って、問題に<電子署名>をつける。電子署名は、そのカードのひみつのカギでしか作れないしるしなんだ。",
  "チップは、<電子署名>と<電子証明書>をサイトに送る。ひみつのカギは送らない。チップの外には一度も出ないよ。",
  "サイトは、電子証明書にのっている<公開のカギ（公開鍵）>で、電子署名をたしかめる。公開のカギでは電子署名は作れないけれど、<その電子証明書とペアのひみつのカギで作られたかどうか>はわかるんだ。",
  "さいごに<J-LIS（カードを発行しているところ）>に「この電子証明書、<本当に J-LIS が出したもの？ まだ使える？>」と聞く。OK なら、ログインできる！",
];

/** The eavesdropper's story: watch the first login, replay its signature on the second. */
const replayCaptions = [
  "<1 回目>：本物のカードの持ち主がログインする。サイトは問題 <{A}> を送る。でも、とちゅうで<のぞき見している人>がいる……！",
  "チップは問題 {A} に電子署名をつけて返す。サイトがたしかめて OK、ログインできた。でも、のぞき見した人は、その電子署名を<こっそりメモ>してしまった。",
  "<2 回目>：こんどは、のぞき見した人が、持ち主のふりをしてログインしようとする。サイトは<新しい問題 {B}> を出すよ。",
  "のぞき見した人は、ひみつのカギを持っていない。だから、メモしておいた<問題 {A} の電子署名>を、そのまま返す。",
  "サイトがたしかめると……<合わない！> この電子署名は問題 {A} につけたもので、問題 {B} につけたものじゃないから。<毎回ちがう問題を出す>のは、このためなんだ。",
];

export const AuthFlow = clientEntry(
  import.meta.url,
  function AuthFlow(handle: Handle) {
    let step = 0;
    let who: Who = "real";
    let question = FIRST_QUESTION;
    /** The replay story's first-login question; `question` is the second login's. */
    let firstQuestion = FIRST_QUESTION;

    const total = () =>
      who === "replay" ? replayCaptions.length : captions.length;

    const go = (next: number) => {
      step = Math.max(0, Math.min(total() - 1, next));
      handle.update();
    };

    const choose = (w: Who) => {
      who = w;
      step = 0;
      firstQuestion = newQuestion();
      question = newQuestion(firstQuestion);
      handle.update();
    };

    return () => {
      // A fake card can make its own key pair and certificate, so its signature matches the
      // public key in that certificate. What it cannot get is J-LIS vouching for the certificate.
      const key = who === "fake" ? FAKE_KEY : REAL_KEY;
      const signature = signatureOf(question, key);
      const registered = who === "real";

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
                ["replay", "🕵️ のぞき見して使い回す"],
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

          {who === "replay"
            ? (
              <ReplayScene
                step={step}
                first={firstQuestion}
                second={question}
              />
            )
            : (
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
                            mix={[verdictStyle, okStyle]}
                          >
                            ✅ 電子署名は合う
                          </span>
                        </>
                      )
                      : null}
                    {step >= 4
                      ? (
                        <span
                          key={`jlis-${who}`}
                          mix={[verdictStyle, registered ? okStyle : ngStyle]}
                        >
                          {registered
                            ? "🏢 J-LIS「まだ使えるよ」→ ログインOK"
                            : "🏢 J-LIS「そんな電子証明書は出していない」→ ❌ ログインできない"}
                        </span>
                      )
                      : null}
                  </div>
                </div>

                <div mix={wireStyle} aria-hidden="true">
                  {step === 0
                    ? (
                      <span
                        key={`q-${question}`}
                        mix={[packetStyle, toRightStyle]}
                      >
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
                    {who === "fake" ? "🦹" : "🪪"}
                  </span>
                  <strong>
                    {who === "real" ? "カードのチップ" : "にせものカード"}
                  </strong>
                  <div mix={boardStyle}>
                    <small>もっているもの</small>
                    <span mix={tokenStyle}>
                      {who === "fake"
                        ? "🔑 自分で作ったひみつのカギ"
                        : "🔑 ひみつのカギ（中だけ）"}
                    </span>
                    <span mix={tokenStyle}>
                      {who === "fake"
                        ? "📜 自分で作ったにせの電子証明書"
                        : "📜 J-LIS が出した電子証明書"}
                    </span>
                    {step >= 1
                      ? (
                        <>
                          <small>つけた電子署名</small>
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
            )}

          <p key={`c-${step}-${who}`} mix={captionStyle} aria-live="polite">
            {emphasize(
              who === "replay"
                ? replayCaptions[step]
                  .replaceAll("{A}", firstQuestion)
                  .replaceAll("{B}", question)
                : captions[step],
            )}
            {step === 3 && who === "fake"
              ? (
                <>
                  <br />
                  <strong>
                    にせものカードも、ひみつのカギと公開のカギのペアや、それらしい電子証明書は自分で作れる。
                  </strong>
                  だから、電子署名のたしかめだけなら通ってしまうんだ。
                </>
              )
              : null}
            {step >= 4 && who === "fake"
              ? (
                <>
                  <br />
                  <strong>
                    でも、その電子証明書は J-LIS が出したものじゃない。
                  </strong>
                  J-LIS
                  に聞くと「知らない」と言われるので、ログインできないよ。だから最後のたしかめが大事なんだ。
                </>
              )
              : null}
          </p>
          <StepBar step={step} total={total()} onGo={go} />
          {step === total() - 1
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

/**
 * The replay story: the eavesdropper stands between the website and the card, copies the first
 * login's signature, and hands it back when the website asks a new question.
 */
function ReplayScene(
  handle: Handle<{ step: number; first: string; second: string }>,
) {
  return () => {
    const { step, first, second } = handle.props;
    const stolen = signatureOf(first, REAL_KEY);
    const secondRound = step >= 2;
    return (
      <div mix={replaySceneStyle}>
        <div mix={partyStyle}>
          <span mix={partyIconStyle} aria-hidden="true">💻</span>
          <strong>サイト</strong>
          <div mix={boardStyle}>
            <small>{secondRound ? "2 回目の問題" : "1 回目の問題"}</small>
            <span
              key={`q-${secondRound}`}
              mix={[questionStyle, compactQuestionStyle, popStyle]}
            >
              {secondRound ? second : first}
            </span>
            {step === 1
              ? <span mix={[verdictStyle, okStyle]}>✅ 本物。ログインOK</span>
              : null}
            {step >= 4
              ? (
                <>
                  <small>公開のカギでたしかめると…</small>
                  <span mix={[verdictStyle, ngStyle]}>❌ 合わない</span>
                </>
              )
              : null}
          </div>
        </div>

        <div mix={[partyStyle, eveStyle]}>
          <span mix={partyIconStyle} aria-hidden="true">🕵️</span>
          <strong>のぞき見した人</strong>
          <div mix={wireRowStyle} aria-hidden="true">
            {step === 0
              ? <span key="a" mix={[packetStyle, toRightStyle]}>❓→</span>
              : step === 1
              ? <span key="b" mix={[packetStyle, toLeftStyle]}>←✍️</span>
              : step === 2
              ? <span key="c" mix={[packetStyle, toRightStyle]}>❓→</span>
              : step === 3
              ? <span key="d" mix={[packetStyle, toLeftStyle]}>←✍️</span>
              : null}
          </div>
          <div mix={[boardStyle, eveBoardStyle]}>
            <small>{step === 0 ? "👀 見ている…" : "📝 こっそりメモ"}</small>
            {step >= 1
              ? (
                <>
                  <small>問題 {first} の電子署名</small>
                  <span key="memo" mix={signatureStyle}>✍️ {stolen}</span>
                </>
              )
              : null}
            {step >= 3
              ? <span mix={[verdictStyle, ngStyle]}>これをそのまま返す</span>
              : null}
          </div>
        </div>

        <div mix={[partyStyle, secondRound ? awayStyle : undefined]}>
          <span mix={partyIconStyle} aria-hidden="true">🪪</span>
          <strong>カードのチップ</strong>
          <div mix={boardStyle}>
            {secondRound ? <small>2 回目は、ここにいない</small> : (
              <>
                <span mix={tokenStyle}>🔑 ひみつのカギ（中だけ）</span>
                {step >= 1
                  ? (
                    <>
                      <small>つけた電子署名</small>
                      <span mix={signatureStyle}>✍️ {stolen}</span>
                    </>
                  )
                  : null}
              </>
            )}
          </div>
        </div>
      </div>
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

const replaySceneStyle = css({
  display: "grid",
  "& > div > div": { paddingInline: "0.35rem" },
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  alignItems: "start",
  gap: "0.3rem",
});

const eveStyle = css({
  "& > strong": { color: art.ng },
});

const eveBoardStyle = css({
  background: art.softRed,
  borderStyle: "dashed",
});

const wireRowStyle = css({
  display: "flex",
  justifyContent: "center",
  width: "100%",
  height: "1.6rem",
  borderBottom: `3px dotted ${color.border}`,
});

const compactQuestionStyle = css({
  fontSize: "0.95rem",
  letterSpacing: 0,
  whiteSpace: "nowrap",
});

const awayStyle = css({ opacity: 0.4 });

const popStyle = css({ animation: "pop-in 350ms ease-out" });

const againStyle = css({ textAlign: "center" });
