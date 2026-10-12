/**
 * Chapter 7's moving picture: what a driver carries, and how a police officer checks it, in three
 * eras — the plastic licence, the My Number Card with the licence on its chip (マイナ免許証, from
 * 24 March 2025), and the mobile licence the government plans but has not yet designed.
 *
 * The third is drawn as an ISO/IEC 18013-5 mDL would work, and says so: how Japan will do it has
 * not been decided.
 */

import { clientEntry, css, type Handle, on } from "@remix-run/component";

import { buttonStyle, captionStyle, emphasize } from "../ui/controls.tsx";
import { Icon, type IconName } from "../ui/icons.tsx";
import { art, color, font, radius } from "../tokens.ts";

type Era = "card" | "myna" | "mobile";

interface Scene {
  label: string;
  icon: IconName;
  /** What the driver has to carry. */
  carry: string;
  carryIcon: IconName;
  /** How the officer checks it. */
  check: string;
  checkIcon: IconName;
  /** Whether a phone alone is enough. */
  phoneOnly: boolean;
  phoneOnlyText: string;
  caption: string;
  /** Not decided yet. */
  future?: boolean;
}

const scenes: Record<Era, Scene> = {
  card: {
    label: "今：免許証",
    icon: "card",
    carry: "運転免許証のカード",
    carryIcon: "card",
    check: "表に書いてある名前・免許の種類・有効期間・顔写真を、目で見る",
    checkIcon: "eye",
    phoneOnly: false,
    phoneOnlyText: "スマホだけでは、免許証を持っていないことになる",
    caption:
      "今までの免許証は、<表に全部書いてある>。警察官は、カードを見て確かめるよ。ICチップも入っているけれど、運転するときは<カードを持っていないといけない>。",
  },
  myna: {
    label: "今：マイナ免許証",
    icon: "chip",
    carry: "免許の情報が入ったマイナンバーカード",
    carryIcon: "card",
    check:
      "表には免許のことが書いていないので、機械やアプリでICチップを読み取る",
    checkIcon: "wave",
    phoneOnly: false,
    phoneOnlyText: "スマホのマイナンバーカードには、免許の情報は入らない",
    caption:
      "2025年3月から、マイナンバーカードを免許証にできるようになった。免許の情報は<ICチップの中だけ>にあって、表には書いていない。でも、運転するときは<カードを持っていないといけない>のは同じだよ。",
  },
  mobile: {
    label: "これから：スマホ免許証",
    icon: "phone",
    carry: "スマホだけ",
    carryIcon: "phone",
    check:
      "スマホを機械にかざすと、免許の情報が、発行した所の電子署名つきでとどく",
    checkIcon: "sign",
    phoneOnly: true,
    phoneOnlyText: "カードを持たなくても運転できるようにする方向",
    caption:
      "国は、免許の情報をスマホに入れて、<カードを持たなくても運転できる>ようにする道を考えているよ。いつから、どんなしくみになるかは<まだ決まっていない>。この図は、世界の決まり（国際標準）どおりに作ったときの例なんだ。",
    future: true,
  },
};

const order: Era[] = ["card", "myna", "mobile"];

export const LicenseCheck = clientEntry(
  import.meta.url,
  function LicenseCheck(handle: Handle) {
    let era: Era = "card";
    const choose = (next: Era) => {
      era = next;
      handle.update();
    };

    return () => {
      const s = scenes[era];
      return (
        <div>
          <div mix={erasStyle} role="group" aria-label="いつの免許証？">
            {order.map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={era === id ? "true" : "false"}
                mix={[
                  buttonStyle,
                  eraButtonStyle,
                  on("click", () => choose(id)),
                ]}
              >
                <Icon name={scenes[id].icon} />
                {scenes[id].label}
              </button>
            ))}
          </div>

          {s.future
            ? (
              <p mix={futureStyle}>
                <Icon name="alert" />
                まだ決まっていないことの例
              </p>
            )
            : null}

          <div key={era} mix={sceneStyle}>
            <section mix={panelStyle}>
              <p mix={panelHeadStyle}>
                <Icon name="car" />
                運転する人が持つもの
              </p>
              <p mix={panelBodyStyle}>
                <span mix={bigIconStyle}>
                  <Icon name={s.carryIcon} size="1.8rem" />
                </span>
                {s.carry}
              </p>
            </section>

            <section mix={panelStyle}>
              <p mix={panelHeadStyle}>
                <Icon name="shieldCheck" />
                警察官の確かめ方
              </p>
              <p mix={panelBodyStyle}>
                <span mix={bigIconStyle}>
                  <Icon name={s.checkIcon} size="1.8rem" />
                </span>
                {s.check}
              </p>
            </section>

            <section mix={panelStyle}>
              <p mix={panelHeadStyle}>
                <Icon name="phone" />
                スマホだけで運転したら？
              </p>
              <p
                mix={[
                  verdictStyle,
                  s.phoneOnly ? okStyle : ngStyle,
                ]}
              >
                <Icon name={s.phoneOnly ? "check" : "x"} />
                {s.phoneOnlyText}
              </p>
            </section>
          </div>

          <p key={`c-${era}`} mix={captionStyle} aria-live="polite">
            {emphasize(s.caption)}
          </p>
        </div>
      );
    };
  },
);

const erasStyle = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "0.4rem",
  marginBottom: "0.8rem",
});

const eraButtonStyle = css({
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

const futureStyle = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.4rem",
  margin: "0 0 0.6rem",
  padding: "0.25rem 0.8rem",
  borderRadius: "999px",
  background: art.goldSoft,
  color: art.ink,
  fontWeight: 700,
  fontSize: "0.85rem !important",
});

const sceneStyle = css({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))",
  gap: "0.6rem",
  animation: "pop-in 300ms ease-out",
});

const panelStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  padding: "0.8rem",
  borderRadius: radius.lg,
  background: color.card,
});

const panelHeadStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  margin: 0,
  fontFamily: font.round,
  fontWeight: 800,
  fontSize: "0.9rem !important",
  color: color.muted,
});

const panelBodyStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
  margin: 0,
  fontWeight: 700,
  fontSize: "0.95rem !important",
  lineHeight: "1.7 !important",
});

const bigIconStyle = css({
  display: "grid",
  placeItems: "center",
  flex: "none",
  width: "3rem",
  height: "3rem",
  borderRadius: radius.md,
  background: art.softBlue,
  color: color.accent,
});

const verdictStyle = css({
  display: "flex",
  alignItems: "flex-start",
  gap: "0.4rem",
  margin: 0,
  padding: "0.5rem 0.7rem",
  borderRadius: radius.md,
  fontWeight: 700,
  fontSize: "0.95rem !important",
  lineHeight: "1.7 !important",
});

const okStyle = css({ background: art.softGreen, color: art.ok });
const ngStyle = css({ background: art.softRed, color: art.ng });
