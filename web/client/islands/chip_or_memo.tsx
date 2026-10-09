/**
 * Chapter 1's first moving picture: the chip is a computer, not a notepad.
 *
 * The same three requests go to two cards — one that only stores things (a memory card) and the
 * real IC chip, which computes and decides for itself. The notepad hands everything over, secret
 * key included; the chip refuses, checks the PIN, and stamps inside.
 */

import { clientEntry, css, type Handle, on } from "@remix-run/component";

import { buttonStyle } from "../ui/controls.tsx";
import { Icon, type IconName } from "../ui/icons.tsx";
import { art, color, radius } from "../tokens.ts";

interface Ask {
  id: string;
  icon: IconName;
  label: string;
  memo: { text: string; bad: boolean };
  chip: { text: string; bad: boolean };
}

const asks: Ask[] = [
  {
    id: "dump",
    icon: "book",
    label: "「中身をぜんぶ読ませて」",
    memo: {
      text: "はい、どうぞ！ 名前も住所も、ひみつのカギも、ぜんぶ見せるよ。",
      bad: true,
    },
    chip: {
      text:
        "お断り。どの部屋も、カギがないと開けないよ。ひみつのカギは、だれにも見せない。",
      bad: false,
    },
  },
  {
    id: "pin",
    icon: "keypad",
    label: "「暗証番号1234で、名前を見せて」",
    memo: {
      text: "暗証番号？ ぼくには確かめられないよ。読めばそのまま見えるよ。",
      bad: true,
    },
    chip: {
      text:
        "1234はちがうね。だから見せない。まちがえた回数は、ちゃんと数えておくよ。",
      bad: false,
    },
  },
  {
    id: "sign",
    icon: "sign",
    label: "「この問題に、電子署名をつけて」",
    memo: {
      text:
        "ぼくは計算ができないんだ…。ひみつのカギをわたすから、自分でつけてね。",
      bad: true,
    },
    chip: {
      text:
        "OK！ 中で電子署名をつけたよ。返すのは電子署名だけ。ひみつのカギはわたさないよ。",
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
        <p mix={promptStyle}>2まいのカードに、同じことをたのんでみよう。</p>
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
              <Icon name={a.icon} /> {a.label}
            </button>
          ))}
        </div>

        <div mix={pairStyle}>
          <Responder
            icon="notebook"
            name="ただのメモ帳カード"
            sub="しまうだけ。計算はできない"
            reply={asked?.memo ?? null}
            replyKey={`m-${round}`}
          />
          <Responder
            icon="chip"
            name="ICチップ"
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
    icon: IconName;
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
          <span mix={iconStyle}>
            <Icon name={icon} size={28} />
          </span>
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
                <span mix={replyIconStyle}>
                  <Icon name={reply.bad ? "alert" : "shieldCheck"} size={22} />
                </span>
                <span>{reply.text}</span>
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
  justifyContent: "flex-start",
  textAlign: "left",
  "& svg": { color: color.accent },
  '&[aria-pressed="true"] svg': { color: color.onAccent },
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
  padding: "0.9rem",
  borderRadius: radius.lg,
  background: color.card,
});

const headStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  "& > span:last-child": { display: "flex", flexDirection: "column" },
  "& small": { color: color.muted, fontSize: "0.8rem" },
});

const iconStyle = css({
  flex: "none",
  display: "grid",
  placeItems: "center",
  width: "3rem",
  height: "3rem",
  borderRadius: radius.md,
  background: art.softBlue,
  color: color.accent,
});

const replyIconStyle = css({ flex: "none", display: "inline-flex" });

const bubbleWrapStyle = css({ minHeight: "6.5rem", marginTop: "0.5rem" });

const bubbleStyle = css({
  display: "flex",
  alignItems: "flex-start",
  gap: "0.5rem",
  margin: 0,
  padding: "0.6rem 0.8rem",
  borderRadius: radius.md,
  fontSize: "0.98rem !important",
  lineHeight: "1.7 !important",
  animation: "pop-in 300ms ease-out",
});

const badStyle = css({
  background: art.softRed,
  "& > span:first-child": { color: art.ng },
});
const goodStyle = css({
  background: art.softGreen,
  "& > span:first-child": { color: art.ok },
});

const waitStyle = css({
  margin: 0,
  color: color.muted,
  fontSize: "0.9rem !important",
});
