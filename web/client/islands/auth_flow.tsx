/**
 * Chapter 4's moving picture: how a website knows the card's owner is there, told with a key and
 * a padlock.
 *
 * The chip's secret key has a matching padlock that anyone may hold (the public key, carried in
 * the certificate). The website puts a fresh random number in a box, locks it with that padlock and
 * sends it over. Only the chip's key opens the box, so a correct answer proves the key is there —
 * without the key ever leaving the chip. Two switches show why it is safe: a fake card's key does
 * not open the padlock, and an answer copied from last time is for a different number.
 *
 * Real JPKI login is a signature rather than an encrypted box; the page's grown-up note says so.
 * The idea is the same: ask for something only the secret key can do.
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

/** The first number, fixed so the server and the browser render the same thing. */
const FIRST_CHALLENGE = "4 8 1 5 2";
/** The number from "last time", for the replay demo. */
const OLD_CHALLENGE = "9 0 3 7 6";

function newChallenge(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 100000;
  return String(n).padStart(5, "0").split("").join(" ");
}

const captions = [
  "カードを作ったとき、チップの中で<🔑 カギ>と、<そのカギでしか開かない 🔒 南京錠>がセットで作られたよ。カギはチップの中にしまったまま。南京錠のほうは、たくさん作って配ってもだいじょうぶ。サイトも持っているよ。",
  "サイトに「マイナカードでログイン」とおすと、サイトは<毎回ちがう、なぞの数字>を決めて、📦 箱に入れるよ。",
  "サイトは、その箱に<あなたの 🔒 南京錠>をかけて送ってくる。南京錠は、パチンとかけるのはだれでもできるけど、<開けられるのは、ペアのカギだけ>なんだ。",
  "暗証番号が合ったら、チップは<中のカギで箱を開けて>、なぞの数字を読んで答えるよ。カギはチップの外に出さない。出ていくのは「答え」だけ。",
  "サイトは答えを確かめる。<自分が箱に入れた数字と同じ>なら、カギを持っている本物の持ち主だ！ さいごに<J-LIS（カードを発行しているところ）>に「この南京錠、まだ使える？ なくしたりしてない？」と聞いて、OK ならログインできる。",
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
      step = 1;
      challenge = newChallenge();
      handle.update();
    };

    return () => {
      const opened = who === "real";
      const answer = who === "real"
        ? challenge
        : who === "replay"
        ? OLD_CHALLENGE
        : "？？？";
      const ok = who === "real";

      return (
        <div>
          <div
            mix={chooserStyle}
            role="group"
            aria-label="だれがログインする？"
          >
            {(
              [
                ["real", "🙂 本物の持ち主"],
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

          <div mix={sceneStyle}>
            <div mix={partyStyle}>
              <span mix={partyIconStyle} aria-hidden="true">💻</span>
              <strong>サイト</strong>
              <div mix={boardStyle}>
                <small>もっているもの</small>
                <span mix={tokenStyle}>🔒 あなたの南京錠</span>
                {step >= 1
                  ? (
                    <>
                      <small>箱に入れた、なぞの数字</small>
                      <span mix={numberStyle}>{challenge}</span>
                    </>
                  )
                  : null}
                {step >= 4
                  ? (
                    <span
                      key={`v-${who}-${challenge}`}
                      mix={[verdictStyle, ok ? okStyle : ngStyle]}
                    >
                      {ok ? "✅ 答えが合った！" : "❌ 答えがちがう"}
                    </span>
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
              {step === 2
                ? (
                  <span
                    key={`box-${challenge}`}
                    mix={[packetStyle, toRightStyle]}
                  >
                    📦🔒 →
                  </span>
                )
                : step === 3 || step === 4
                ? (
                  <span key={`ans-${who}`} mix={[packetStyle, toLeftStyle]}>
                    ← 💬
                  </span>
                )
                : null}
            </div>

            <div mix={partyStyle}>
              <span mix={partyIconStyle} aria-hidden="true">
                {who === "fake" ? "🦹" : who === "replay" ? "🕵️" : "🪪"}
              </span>
              <strong>
                {who === "real" ? "カードのチップ" : "あやしい人"}
              </strong>
              <div mix={boardStyle}>
                <small>もっているもの</small>
                <span mix={tokenStyle}>
                  {who === "fake"
                    ? "🗝️ にせもののカギ"
                    : who === "replay"
                    ? "📝 まえの答えのメモ"
                    : "🔑 ひみつのカギ（中だけ）"}
                </span>
                {step >= 3
                  ? (
                    <>
                      <small>とどいた箱</small>
                      <span
                        key={`open-${who}-${challenge}`}
                        mix={[boxStyle, opened ? popStyle : shakeStyle]}
                      >
                        {opened
                          ? "📦🔓 開いた！"
                          : who === "fake"
                          ? "📦🔒 開かない…"
                          : "📦🔒 開けられない"}
                      </span>
                      <small>答え</small>
                      <span mix={numberStyle}>{answer}</span>
                    </>
                  )
                  : step === 2
                  ? (
                    <>
                      <small>とどいた箱</small>
                      <span mix={boxStyle}>📦🔒</span>
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
                    にせもののカギでは、あなたの南京錠は開かない。
                  </strong>
                  中の数字がわからないから、正しく答えられないよ。
                </>
              )
              : null}
            {step >= 3 && who === "replay"
              ? (
                <>
                  <br />
                  <strong>
                    まえにのぞき見た答え（{OLD_CHALLENGE}）を送っても、今回の箱の数字とはちがう。
                  </strong>
                  毎回ちがう数字にするのは、このためなんだ。
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
                  🔢 新しい数字でもう一回
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
  minHeight: "11rem",
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

const tokenStyle = css({
  padding: "0.1rem 0.5rem",
  borderRadius: "999px",
  background: art.goldLight,
  fontWeight: 700,
  fontSize: "0.8rem",
});

const numberStyle = css({
  fontFamily: "var(--font-mono)",
  fontWeight: 800,
  fontSize: "1.1rem",
  letterSpacing: "0.05em",
});

const boxStyle = css({ fontSize: "1.1rem", fontWeight: 800 });

const popStyle = css({ animation: "pop-in 400ms ease-out" });
const shakeStyle = css({ animation: "shake 400ms ease-in-out 2" });

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

const packetStyle = css({
  fontSize: "1.1rem",
  whiteSpace: "nowrap",
});

const toRightStyle = css({
  animation: "travel-right 1.2s ease-in-out infinite",
});
const toLeftStyle = css({ animation: "travel-left 1.2s ease-in-out infinite" });

const againStyle = css({ textAlign: "center" });
