/**
 * Chapter 4's moving picture: challenge and response.
 *
 * A website sends a fresh random number; the chip stamps it with its secret key; the website checks
 * the stamp against the sample (the public key in the certificate) and asks J-LIS whether the
 * certificate is still good. Two switches show why it is safe: a fake card's stamp does not match,
 * and a stamp copied from last time is useless because the number has changed.
 *
 * The "stamp" is a toy: a short code computed from the number and a pretend key, so the same
 * number and card always give the same stamp and a different card gives a different one. It is
 * not real cryptography and says so on the page.
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

/** A pretend stamp: a few letters that depend on the number and on whose key made them. */
function stampOf(challenge: string, key: string): string {
  let h = 2166136261;
  for (const ch of key + ":" + challenge) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  const marks = "あいうえおかきくけこさしすせそたちつてとなにぬねの";
  let out = "";
  for (let i = 0; i < 4; i++) {
    out += marks[h % marks.length];
    h = Math.floor(h / marks.length) + i * 7919;
  }
  return out;
}

const REAL_KEY = "持ち主のカギ";
const FAKE_KEY = "にせものカギ";

/** The first number, fixed so the server and the browser render the same thing. */
const FIRST_CHALLENGE = "4 8 1 5 2";
/** A number from "last time", for the replay demo. */
const OLD_CHALLENGE = "9 0 3 7 6";

function newChallenge(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 100000;
  return String(n).padStart(5, "0").split("").join(" ");
}

const captions = [
  "サイトに「マイナカードでログイン」とおすと、サイトは<毎回ちがう、なぞの数字>を送ってくるよ。",
  "チップは、その数字に<ひみつのカギでハンコ>をおす。カギは外に出さず、チップの中でおすんだ。",
  "ハンコと、カードの<証明書>（ハンコの見本がのっている）をサイトに送るよ。",
  "サイトは<見本と見くらべて>、ハンコが本物か確かめる。見本ではハンコをおせないけど、本物かどうかはわかるんだ。",
  "さいごに、<J-LIS（カードを発行しているところ）>に「この証明書、まだ使える？なくしたりしてない？」と聞く。OK なら、ログインできる！",
];

export const AuthFlow = clientEntry(
  import.meta.url,
  function AuthFlow(handle: Handle) {
    let step = 0;
    let who: Who = "real";
    let challenge = FIRST_CHALLENGE;

    const go = (next: number) => {
      step = Math.max(0, Math.min(captions.length - 1, next));
      if (next === 0 && step === 0) challenge = newChallenge();
      handle.update();
    };

    const choose = (w: Who) => {
      who = w;
      step = 0;
      challenge = newChallenge();
      handle.update();
    };

    return () => {
      const stamped = who === "replay" ? OLD_CHALLENGE : challenge;
      const key = who === "fake" ? FAKE_KEY : REAL_KEY;
      const stamp = stampOf(stamped, key);
      const expected = stampOf(challenge, REAL_KEY);
      const matches = stamp === expected;
      const ok = matches;

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
                ["replay", "🕵️ まえのハンコを使い回す"],
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
              <div mix={[boardStyle, step >= 3 ? checkBoardStyle : undefined]}>
                <small>なぞの数字</small>
                <span mix={numberStyle}>{challenge}</span>
                {step >= 3
                  ? (
                    <>
                      <small>見本で確かめると…</small>
                      <span
                        key={`v-${who}-${challenge}`}
                        mix={[verdictStyle, ok ? okStyle : ngStyle]}
                      >
                        {ok ? "✅ 本物のハンコ" : "❌ ハンコが合わない"}
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
                  <span
                    key={`a-${challenge}`}
                    mix={[packetStyle, toRightStyle]}
                  >
                    🔢 →
                  </span>
                )
                : step === 2
                ? (
                  <span key="b" mix={[packetStyle, toLeftStyle]}>
                    ← 🔏📜
                  </span>
                )
                : step === 4 && ok
                ? <span key="c" mix={packetStyle}>🏢 ?</span>
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
                <small>ハンコをおした数字</small>
                <span mix={numberStyle}>{step >= 1 ? stamped : "…"}</span>
                {step >= 1
                  ? (
                    <span key={`s-${who}-${challenge}`} mix={stampStyle}>
                      {stamp}
                    </span>
                  )
                  : null}
                <small>使ったカギ：{key}</small>
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
                    にせもののカギでおしたハンコは、見本と合わない。
                  </strong>
                  だからログインできないよ。
                </>
              )
              : null}
            {step >= 3 && who === "replay"
              ? (
                <>
                  <br />
                  <strong>
                    まえの数字（{OLD_CHALLENGE}）のハンコを使い回しても、今回の数字とちがうから合わない。
                  </strong>
                  毎回ちがう数字を使うのは、このためなんだ。
                </>
              )
              : null}
          </p>
          <StepBar step={step} total={captions.length} onGo={go} />
          <p mix={toyNoteStyle}>
            ※ここで出てくる「ハンコ」は、しくみを見せるためのおもちゃです。本物は「電子署名」という、ずっと長くて計算のむずかしい数字です。
          </p>
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
  minHeight: "9.5rem",
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

const checkBoardStyle = css({ background: art.softBlue });

const numberStyle = css({
  fontFamily: "var(--font-mono)",
  fontWeight: 800,
  fontSize: "1.15rem",
  letterSpacing: "0.05em",
});

const stampStyle = css({
  display: "inline-block",
  padding: "0.15rem 0.5rem",
  border: `3px solid ${art.ng}`,
  borderRadius: radius.sm,
  color: art.ng,
  fontWeight: 900,
  fontSize: "1.1rem",
  animation: "stamp 450ms ease-out both",
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

const packetStyle = css({
  fontSize: "1.1rem",
  whiteSpace: "nowrap",
  animation: "pop-in 300ms ease-out",
});

const toRightStyle = css({
  animation: "travel-right 1.2s ease-in-out infinite",
});
const toLeftStyle = css({ animation: "travel-left 1.2s ease-in-out infinite" });

const toyNoteStyle = css({
  marginTop: "0.75rem",
  fontSize: "0.8rem !important",
  color: color.muted,
  lineHeight: 1.6,
});

const againStyle = css({ textAlign: "center" });
