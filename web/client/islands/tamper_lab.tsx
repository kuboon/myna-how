/**
 * Chapter 2's moving picture: try to break into the chip, and watch it defend itself.
 *
 * Four "attacks", each a simplified version of a real one: prising the chip open, tampering with
 * its power, asking it to hand over its secret key, and guessing the PIN. The PIN pad is a real
 * little game — three wrong guesses and the chip locks, as the real 利用者証明用 PIN does.
 */

import { clientEntry, css, type Handle, on } from "@remix-run/component";

import {
  buttonStyle,
  captionStyle,
  dangerStyle,
  primaryStyle,
} from "../ui/controls.tsx";
import { art, color, radius } from "../tokens.ts";

type Mood = "calm" | "alert" | "locked" | "refuse" | "open";

interface Attack {
  id: string;
  icon: string;
  label: string;
  mood: Mood;
  reaction: string;
}

const attacks: Attack[] = [
  {
    id: "pry",
    icon: "🔨",
    label: "チップをけずって、中を直接のぞく",
    mood: "alert",
    reaction:
      "チップは、自分がこわされそうになったのを感じとるセンサーを持っているよ。むりに開けようとすると、ひみつのカギを使えなくして中身を守るんだ。",
  },
  {
    id: "power",
    icon: "⚡",
    label: "電気や光で、計算をくるわせる",
    mood: "alert",
    reaction:
      "電気がおかしくなったり、強い光が当たったりすると、チップは「何か変だぞ」と気づいて計算をやめるよ。まちがった答えから、ひみつをさぐられないようにするためなんだ。",
  },
  {
    id: "copy",
    icon: "📤",
    label: "「ひみつのカギを外に出して」とたのむ",
    mood: "refuse",
    reaction:
      "そんな命令は、はじめから用意されていないよ。チップができるのは、中のカギを使ってつけた「電子署名」を返すことだけ。カギそのものは、一度も外に出ないんだ。",
  },
];

/** The PIN the picture "knows". Never shown; a lucky guess gets its own message. */
const SECRET = "7392";
const MAX_TRIES = 3;

export const TamperLab = clientEntry(
  import.meta.url,
  function TamperLab(handle: Handle) {
    let mood: Mood = "calm";
    let message =
      "下のボタンで、チップにいたずらをしてみよう。チップはどうするかな？";
    let attackKey = 0;
    let pinOpen = false;
    let entry = "";
    let misses = 0;

    const reset = () => {
      mood = "calm";
      message = "チップはもとどおり。ほかのいたずらもためしてみよう。";
      pinOpen = false;
      entry = "";
      misses = 0;
      attackKey++;
      handle.update();
    };

    const attack = (a: Attack) => {
      mood = a.mood;
      message = a.reaction;
      pinOpen = false;
      attackKey++;
      handle.update();
    };

    const press = (digit: string) => {
      if (mood === "locked" || entry.length >= 4) return;
      entry += digit;
      if (entry.length === 4) {
        if (entry === SECRET) {
          mood = "open";
          message =
            "わっ、当たった！でも 1 万とおりの中から当てるのは、ふつうはとてもむずかしいよ。";
        } else {
          misses++;
          if (misses >= MAX_TRIES) {
            mood = "locked";
            message =
              "3 回まちがえたので、チップはロックされたよ！もう何回ためしても開かない。本物の持ち主でも、市役所などの窓口で手続きしないと使えないんだ。";
          } else {
            mood = "alert";
            message = `ちがう番号だよ。あと ${
              MAX_TRIES - misses
            } 回まちがえるとロックされる。`;
          }
        }
        attackKey++;
        entry = "";
      }
      handle.update();
    };

    return () => (
      <div>
        <div mix={sceneStyle}>
          <div key={`chip-${attackKey}`} mix={[chipStyle, moodStyle(mood)]}>
            <ChipFace mood={mood} />
          </div>
          <div mix={statusStyle} data-mood={mood}>
            {mood === "calm"
              ? "😊 へいき"
              : mood === "alert"
              ? "🚨 けいかい！"
              : mood === "refuse"
              ? "🙅 おことわり"
              : mood === "locked"
              ? "🔒 ロック中"
              : "😲 当たった"}
          </div>
        </div>

        <p key={`msg-${attackKey}`} mix={captionStyle} aria-live="polite">
          {message}
        </p>

        <div mix={buttonsStyle}>
          {attacks.map((a) => (
            <button
              key={a.id}
              type="button"
              mix={[buttonStyle, dangerStyle, on("click", () => attack(a))]}
              disabled={mood === "locked"}
            >
              <span aria-hidden="true">{a.icon}</span> {a.label}
            </button>
          ))}
          <button
            type="button"
            mix={[
              buttonStyle,
              dangerStyle,
              on("click", () => {
                pinOpen = true;
                handle.update();
              }),
            ]}
            disabled={mood === "locked"}
          >
            <span aria-hidden="true">🔢</span> 暗証番号を当てずっぽうで入れる
          </button>
        </div>

        {pinOpen && mood !== "locked"
          ? (
            <div mix={pinPadStyle}>
              <p mix={pinScreenStyle} aria-label="入力した数">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} mix={pinDotStyle}>
                    {i < entry.length ? "●" : "○"}
                  </span>
                ))}
              </p>
              <p mix={missStyle}>
                まちがい：{misses} / {MAX_TRIES}
              </p>
              <div mix={keysStyle}>
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((
                  d,
                ) => (
                  <button
                    key={d}
                    type="button"
                    mix={[buttonStyle, keyStyle, on("click", () => press(d))]}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )
          : null}

        {mood !== "calm"
          ? (
            <p mix={resetRowStyle}>
              <button
                type="button"
                mix={[buttonStyle, primaryStyle, on("click", reset)]}
              >
                ↺ チップをもとにもどす
              </button>
            </p>
          )
          : null}
      </div>
    );
  },
);

/** The chip, as a vault with a face. */
function ChipFace(handle: Handle<{ mood: Mood }>) {
  return () => {
    const mood = handle.props.mood;
    const eyes = mood === "calm"
      ? "M44 52a4 4 0 1 0 0.1 0M76 52a4 4 0 1 0 0.1 0"
      : "M38 48l12 6M82 48l-12 6";
    const mouth = mood === "calm" || mood === "open"
      ? "M46 70q14 12 28 0"
      : "M46 76q14 -10 28 0";
    return (
      <svg
        viewBox="0 0 120 110"
        role="img"
        aria-label="IC チップ"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <rect
          x="6"
          y="6"
          width="108"
          height="98"
          rx="16"
          fill={art.goldLight}
          stroke={art.gold}
          stroke-width="5"
        />
        <path
          d="M6 30h18M6 80h18M96 30h18M96 80h18M40 6v14M80 6v14M40 90v14M80 90v14"
          stroke={art.gold}
          stroke-width="4"
        />
        <path
          d={eyes}
          stroke={art.ink}
          stroke-width="5"
          stroke-linecap="round"
          fill={art.ink}
        />
        <path
          d={mouth}
          stroke={art.ink}
          stroke-width="5"
          stroke-linecap="round"
          fill="none"
        />
        {mood === "locked"
          ? (
            <g transform="translate(74 58)">
              <rect width="34" height="28" rx="5" fill={art.ng} />
              <path
                d="M8 0v-6a9 9 0 0 1 18 0v6"
                stroke={art.ng}
                stroke-width="5"
                fill="none"
              />
            </g>
          )
          : null}
      </svg>
    );
  };
}

function moodStyle(mood: Mood) {
  return mood === "alert"
    ? alertStyle
    : mood === "locked"
    ? lockedStyle
    : mood === "refuse"
    ? refuseStyle
    : calmStyle;
}

const sceneStyle = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.5rem",
});

const chipStyle = css({ width: "min(11rem, 50vw)" });

const calmStyle = css({ animation: "float 2.2s ease-in-out infinite" });
const alertStyle = css({ animation: "shake 400ms ease-in-out 2" });
const refuseStyle = css({ animation: "shake 300ms ease-in-out 1" });
const lockedStyle = css({ filter: "grayscale(0.6)" });

const statusStyle = css({
  padding: "0.2rem 0.9rem",
  borderRadius: "999px",
  fontWeight: 800,
  background: art.softGreen,
  '&[data-mood="alert"], &[data-mood="locked"]': {
    background: art.softRed,
    color: art.ng,
  },
  '&[data-mood="refuse"]': { background: art.softBlue },
});

const buttonsStyle = css({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(15rem, 1fr))",
  gap: "0.5rem",
  "& button": { textAlign: "left" },
});

const pinPadStyle = css({
  marginTop: "1rem",
  marginInline: "auto",
  maxWidth: "16rem",
  padding: "1rem",
  borderRadius: radius.lg,
  background: color.card,
  animation: "pop-in 250ms ease-out",
});

const pinScreenStyle = css({
  display: "flex",
  justifyContent: "center",
  gap: "0.6rem",
  margin: "0 0 0.25rem",
  fontSize: "1.5rem",
});

const pinDotStyle = css({ color: color.accent });

const missStyle = css({
  margin: "0 0 0.5rem",
  textAlign: "center",
  fontSize: "0.9rem !important",
  color: color.muted,
});

const keysStyle = css({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "0.4rem",
  "& button:last-child": { gridColumn: "2" },
});

const keyStyle = css({ fontSize: "1.2rem", padding: "0.4rem" });

const resetRowStyle = css({ textAlign: "center", marginTop: "1rem" });
