/**
 * Chapter 3's second moving picture: showing a shop only what it asked for.
 *
 * With the plastic card, whoever looks at it sees the whole face — name, address, birthday — even
 * when all they wanted to know was "20 or over?". The phone's card (the カード代替電磁的記録, an
 * ISO/IEC 18013-5 mdoc) can send just that one line, and the shop can still tell it is genuine:
 * J-LIS signed a list that has a fingerprint of every line, and the line that arrives has to match
 * its fingerprint. Lines that are not sent never reach the shop at all.
 */

import { clientEntry, css, type Handle, on } from "@remix-run/component";

import {
  buttonStyle,
  captionStyle,
  emphasize,
  StepBar,
} from "../ui/controls.tsx";
import { Icon, type IconName } from "../ui/icons.tsx";
import { art, color, font, radius } from "../tokens.ts";

type Mode = "card" | "phone";

interface Item {
  id: string;
  icon: IconName;
  label: string;
  value: string;
}

/** What the card holds about さくらさん. Made up, of course. */
const items: Item[] = [
  { id: "name", icon: "user", label: "名前", value: "まいな さくら" },
  { id: "address", icon: "pin", label: "住所", value: "○○市△△町1-2-3" },
  {
    id: "birth",
    icon: "notebook",
    label: "生年月日",
    value: "1995年4月1日",
  },
  { id: "photo", icon: "image", label: "顔写真", value: "（顔写真）" },
  { id: "age", icon: "cup", label: "20さい以上", value: "はい" },
];

/** The one line the shop needs. */
const ASKED = "age";

interface PhoneStep {
  caption: string;
  /** Which lines have reached the shop by this step. */
  sent: boolean;
  /** Whether the shop's app has checked J-LIS's mark yet. */
  checked: boolean;
}

const phoneSteps: PhoneStep[] = [
  {
    caption:
      "お店で、お酒を買うよ。お店のアプリが、さくらさんのスマホに<「20さい以上ですか？」>とだけ聞いてくる。",
    sent: false,
    checked: false,
  },
  {
    caption:
      "スマホに「<20さい以上：はい>だけを、このお店に見せますか？」と出る。さくらさんが顔でOKすると、送るものが決まるよ。",
    sent: false,
    checked: false,
  },
  {
    caption:
      "スマホは、<その1行だけ>を、J-LISがつけた<しるし>といっしょに送る。名前や住所は、スマホから出ていかない。",
    sent: true,
    checked: false,
  },
  {
    caption:
      "お店のアプリは、とどいた1行が<J-LISのしるしと合う>か確かめる。合えば本物。お店にわかるのは「20さい以上」ということだけなんだ。",
    sent: true,
    checked: true,
  },
];

export const ShowOnly = clientEntry(
  import.meta.url,
  function ShowOnly(handle: Handle) {
    let mode: Mode = "phone";
    let step = 0;

    const setMode = (m: Mode) => {
      mode = m;
      step = 0;
      handle.update();
    };
    const go = (next: number) => {
      step = Math.max(0, Math.min(phoneSteps.length - 1, next));
      handle.update();
    };

    return () => {
      const s = phoneSteps[step];
      /** Whether the shop can see this line. */
      const reaches = (item: Item) =>
        mode === "card" || (s.sent && item.id === ASKED);

      return (
        <div>
          <div mix={modesStyle} role="group" aria-label="見せるもの">
            {(
              [
                ["card", "カードを見せる", "card"],
                ["phone", "スマホで見せる", "phone"],
              ] as const
            ).map(([id, label, icon]) => (
              <button
                key={id}
                type="button"
                aria-pressed={mode === id ? "true" : "false"}
                mix={[
                  buttonStyle,
                  modeButtonStyle,
                  on("click", () => setMode(id)),
                ]}
              >
                <Icon name={icon} />
                {label}
              </button>
            ))}
          </div>

          <div mix={sceneStyle}>
            <section mix={sideStyle} aria-label="さくらさんのカードの中身">
              <p mix={sideHeadStyle}>
                <Icon name={mode === "card" ? "card" : "phone"} />
                {mode === "card" ? "カードの表" : "スマホの中"}
              </p>
              <ul mix={listStyle}>
                {items.map((item) => {
                  const chosen = mode === "phone" && step >= 1 &&
                    item.id === ASKED;
                  return (
                    <li
                      key={item.id}
                      mix={[rowStyle, chosen ? chosenStyle : undefined]}
                    >
                      <Icon name={item.icon} />
                      <span mix={labelStyle}>{item.label}</span>
                      <span mix={valueStyle}>{item.value}</span>
                    </li>
                  );
                })}
              </ul>
            </section>

            <div mix={arrowStyle} aria-hidden="true">
              <Icon name="arrowRight" size="1.6rem" />
            </div>

            <section mix={sideStyle} aria-label="お店にとどいたもの">
              <p mix={sideHeadStyle}>
                <Icon name="cart" />
                お店にとどいたもの
              </p>
              <ul mix={listStyle}>
                {items.map((item) =>
                  reaches(item)
                    ? (
                      <li
                        key={`${mode}-${item.id}`}
                        mix={[
                          rowStyle,
                          popStyle,
                          mode === "card" && item.id !== ASKED
                            ? exposedStyle
                            : undefined,
                        ]}
                      >
                        <Icon name={item.icon} />
                        <span mix={labelStyle}>{item.label}</span>
                        <span mix={valueStyle}>{item.value}</span>
                      </li>
                    )
                    : (
                      <li
                        key={`${mode}-${item.id}`}
                        mix={[rowStyle, hiddenStyle]}
                      >
                        <Icon name="lock" />
                        <span mix={labelStyle}>{item.label}</span>
                        <span mix={valueStyle}>とどいていない</span>
                      </li>
                    )
                )}
              </ul>
              {mode === "phone" && s.checked
                ? (
                  <p mix={[verdictStyle, okStyle]}>
                    <Icon name="check" />
                    J-LISのしるしと合う：本物
                  </p>
                )
                : null}
              {mode === "card"
                ? (
                  <p mix={[verdictStyle, ngStyle]}>
                    <Icon name="eye" />
                    聞いていないことまで見えた
                  </p>
                )
                : null}
            </section>
          </div>

          {mode === "card"
            ? (
              <p key="card" mix={captionStyle} aria-live="polite">
                {emphasize(
                  "カードを見せると、お店の人には<表に書いてあることが全部>見えてしまう。知りたかったのは「20さい以上か」だけなのに、名前や住所まで見せることになるよ。",
                )}
              </p>
            )
            : (
              <>
                <p key={`c-${step}`} mix={captionStyle} aria-live="polite">
                  {emphasize(s.caption)}
                </p>
                <StepBar step={step} total={phoneSteps.length} onGo={go} />
              </>
            )}
        </div>
      );
    };
  },
);

const modesStyle = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "0.4rem",
  marginBottom: "0.8rem",
});

const modeButtonStyle = css({
  minHeight: "2.5rem",
  padding: "0.3rem 0.9rem",
  fontSize: "0.9rem",
  '&[aria-pressed="true"]': {
    background: color.accent,
    borderColor: color.accent,
    color: color.onAccent,
  },
  '&[aria-pressed="true"]:hover:not(:disabled)': {
    color: color.onAccent,
    borderColor: color.accentStrong,
  },
});

const sceneStyle = css({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
  alignItems: "start",
  gap: "0.5rem",
  "@media (max-width: 560px)": { gridTemplateColumns: "1fr" },
});

const sideStyle = css({
  padding: "0.75rem",
  borderRadius: radius.lg,
  background: color.card,
});

const sideHeadStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  margin: "0 0 0.5rem",
  fontFamily: font.round,
  fontWeight: 800,
});

const listStyle = css({
  display: "grid",
  gap: "0.35rem",
  margin: 0,
  padding: 0,
  listStyle: "none",
});

const rowStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.45rem",
  margin: 0,
  padding: "0.4rem 0.6rem",
  border: `2px solid transparent`,
  borderRadius: radius.md,
  background: color.surface,
  fontSize: "0.9rem !important",
  lineHeight: "1.6 !important",
  color: color.accent,
});

const labelStyle = css({ color: color.fg, fontWeight: 700 });

const valueStyle = css({
  marginLeft: "auto",
  color: color.fg,
  fontFamily: font.mono,
  textAlign: "right",
});

const chosenStyle = css({ borderColor: color.accent });

const exposedStyle = css({
  background: art.softRed,
  color: art.ng,
});

const hiddenStyle = css({
  color: color.muted,
  background: "transparent",
  border: `2px dashed ${color.line}`,
  "& span": { color: color.muted, fontWeight: 400 },
});

const popStyle = css({ animation: "pop-in 300ms ease-out" });

const arrowStyle = css({
  alignSelf: "center",
  color: color.accent,
  "@media (max-width: 560px)": {
    justifySelf: "center",
    transform: "rotate(90deg)",
  },
});

const verdictStyle = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.35rem",
  margin: "0.6rem 0 0",
  padding: "0.3rem 0.8rem",
  borderRadius: "999px",
  fontWeight: 700,
  fontSize: "0.9rem !important",
  animation: "pop-in 300ms ease-out",
});

const okStyle = css({ background: art.softGreen, color: art.ok });
const ngStyle = css({ background: art.softRed, color: art.ng });
