/**
 * Chapter 1's first moving picture: the chip is a computer, not a notepad.
 *
 * The same three requests go to two cards — one that only stores things (a memory card) and the
 * real IC chip, which computes and decides for itself. The notepad hands everything over, secret
 * key included; the chip refuses, checks the PIN, and stamps inside.
 */

import { clientEntry, css, type Handle, on } from "@remix-run/component";

import { buttonStyle } from "../ui/controls.tsx";
import { art, color, radius } from "../tokens.ts";

interface Ask {
  id: string;
  icon: string;
  label: string;
  memo: { text: string; bad: boolean };
  chip: { text: string; bad: boolean };
}

const asks: Ask[] = [
  {
    id: "dump",
    icon: "📖",
    label: "「中身をぜんぶ読ませて」",
    memo: {
      text: "はい、どうぞ！ 名前も住所も、🔑 ひみつのカギも、ぜんぶ見せるよ。",
      bad: true,
    },
    chip: {
      text:
        "おことわり。どの部屋も、かぎがないと開けないよ。ひみつのカギは、だれにも見せない。",
      bad: false,
    },
  },
  {
    id: "pin",
    icon: "🔢",
    label: "「暗証番号 1234 で、名前を見せて」",
    memo: {
      text: "暗証番号？ ぼくには確かめられないよ。読めばそのまま見えるよ。",
      bad: true,
    },
    chip: {
      text:
        "1234 はちがうね。だから見せない。まちがえた回数は、ちゃんと数えておくよ。",
      bad: false,
    },
  },
  {
    id: "sign",
    icon: "📦",
    label: "「カギのかかったこの箱を開けて、中の数字を教えて」",
    memo: {
      text: "ぼくは計算ができないんだ…。🔑 カギをわたすから、自分で開けてね。",
      bad: true,
    },
    chip: {
      text:
        "OK！ 中のカギで開けたよ。数字は 48152。教えるのは答えだけ。カギはわたさないよ。",
      bad: false,
    },
  },
];

export const ChipOrMemo = clientEntry(
  import.meta.url,
  function ChipOrMemo(handle: Handle) {
    let asked: Ask | null = null;
    let round = 0;

    return () => (
      <div>
        <p mix={promptStyle}>2 まいのカードに、同じことをたのんでみよう。</p>
        <div mix={asksStyle}>
          {asks.map((a) => (
            <button
              key={a.id}
              type="button"
              aria-pressed={asked?.id === a.id ? "true" : "false"}
              mix={[
                buttonStyle,
                askStyle,
                on("click", () => {
                  asked = a;
                  round++;
                  handle.update();
                }),
              ]}
            >
              <span aria-hidden="true">{a.icon}</span> {a.label}
            </button>
          ))}
        </div>

        <div mix={pairStyle}>
          <Responder
            icon="📒"
            name="ただのメモ帳カード"
            sub="しまうだけ。計算はできない"
            reply={asked?.memo ?? null}
            replyKey={`m-${round}`}
          />
          <Responder
            icon="🧠"
            name="IC チップ"
            sub="小さなコンピューター。自分で考えて計算する"
            reply={asked?.chip ?? null}
            replyKey={`c-${round}`}
          />
        </div>
      </div>
    );
  },
);

function Responder(
  handle: Handle<{
    icon: string;
    name: string;
    sub: string;
    reply: { text: string; bad: boolean } | null;
    replyKey: string;
  }>,
) {
  return () => {
    const { icon, name, sub, reply, replyKey } = handle.props;
    return (
      <div mix={responderStyle}>
        <div mix={headStyle}>
          <span aria-hidden="true" mix={iconStyle}>{icon}</span>
          <span>
            <strong>{name}</strong>
            <small>{sub}</small>
          </span>
        </div>
        <div mix={bubbleWrapStyle} aria-live="polite">
          {reply
            ? (
              <p
                key={replyKey}
                mix={[bubbleStyle, reply.bad ? badStyle : goodStyle]}
              >
                {reply.bad ? "😱 " : "🛡️ "}
                {reply.text}
              </p>
            )
            : <p mix={waitStyle}>（たのみごとを待っているよ）</p>}
        </div>
      </div>
    );
  };
}

const promptStyle = css({ margin: "0 0 0.5rem", fontWeight: 700 });

const asksStyle = css({
  display: "grid",
  gap: "0.4rem",
});

const askStyle = css({
  textAlign: "left",
  '&[aria-pressed="true"]': {
    background: color.accent,
    borderColor: color.accent,
    color: color.onAccent,
  },
});

const pairStyle = css({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))",
  gap: "0.6rem",
  marginTop: "0.9rem",
});

const responderStyle = css({
  padding: "0.75rem",
  border: `2px solid ${color.border}`,
  borderRadius: radius.lg,
  background: color.card,
});

const headStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  "& span:last-child": { display: "flex", flexDirection: "column" },
  "& small": { color: color.muted, fontSize: "0.8rem" },
});

const iconStyle = css({ fontSize: "2rem" });

const bubbleWrapStyle = css({ minHeight: "6.5rem", marginTop: "0.5rem" });

const bubbleStyle = css({
  margin: 0,
  padding: "0.6rem 0.8rem",
  borderRadius: radius.md,
  fontSize: "0.98rem !important",
  lineHeight: "1.7 !important",
  animation: "pop-in 300ms ease-out",
});

const badStyle = css({ background: art.softRed });
const goodStyle = css({ background: art.softGreen });

const waitStyle = css({
  margin: 0,
  color: color.muted,
  fontSize: "0.9rem !important",
});
