/**
 * Chapter 3's moving picture: what "putting the card in the phone" really does, step by step.
 *
 * The point to land is that nothing is copied. The phone's own vault (the secure element) makes a
 * new key pair, the card proves who is asking, and a phone-only certificate is issued. The two
 * keys live side by side and can be stopped separately.
 */

import { clientEntry, css, type Handle } from "@remix-run/component";

import { CardFront, Phone } from "../ui/art.tsx";
import { captionStyle, emphasize, StepBar } from "../ui/controls.tsx";
import { Icon, type IconName } from "../ui/icons.tsx";
import { art, color, font, radius } from "../tokens.ts";

interface Step {
  caption: string;
  /** What sits between the card and the phone. */
  middle: IconName;
  middleLabel: string;
  /** The animation the middle plays. */
  motion: "none" | "right" | "left" | "pop" | "waves";
  phoneScreen?: IconName;
  phoneVault: boolean;
  /** Shows the key inside the phone's vault. */
  phoneKey: boolean;
  cardDim?: boolean;
}

const steps: Step[] = [
  {
    caption:
      "「スマホにマイナンバーカードを入れる」と聞くと、カードを<コピー>するように思うよね。でも、じつはコピーはしないんだ。ひみつのカギは、カードの外に出られないから。",
    middle: "x",
    middleLabel: "コピーはしない",
    motion: "pop",
    phoneVault: false,
    phoneKey: false,
  },
  {
    caption:
      "スマホの中にも、チップと同じような<特別な金庫>（セキュアエレメント）があるよ。ふつうのアプリでは中をのぞけない、固い金庫なんだ。",
    middle: "search",
    middleLabel: "スマホの金庫",
    motion: "pop",
    phoneVault: true,
    phoneKey: false,
  },
  {
    caption:
      "その金庫の中で、<スマホ用の新しいひみつのカギ>を作るよ。このカギも、金庫の外には出ない。",
    middle: "sparkle",
    middleLabel: "新しいカギを作る",
    motion: "pop",
    phoneVault: true,
    phoneKey: true,
  },
  {
    caption:
      "次に、<本物のカードをスマホにかざして>、暗証番号を入れる。これで「このスマホを使っているのは、カードの持ち主本人です」と証明するんだ。",
    middle: "wave",
    middleLabel: "カードをかざす",
    motion: "waves",
    phoneScreen: "keypad",
    phoneVault: true,
    phoneKey: true,
  },
  {
    caption:
      "本人だとわかったので、カードを発行しているところ（J-LIS）から、<スマホ用の電子証明書>が届く。スマホのカギとセットで使えるようになるよ。",
    middle: "certificate",
    middleLabel: "スマホ用の電子証明書",
    motion: "left",
    phoneScreen: "certificate",
    phoneVault: true,
    phoneKey: true,
  },
  {
    caption:
      "完成！これからは、スマホだけで本人確認ができる。iPhoneなら、暗証番号の代わりに<顔や指のもよう（指紋）>で使えるよ。",
    middle: "sparkle",
    middleLabel: "完成",
    motion: "pop",
    phoneScreen: "smile",
    phoneVault: true,
    phoneKey: true,
    cardDim: true,
  },
  {
    caption:
      "スマホをなくしたら？<スマホのカギだけを止める>ことができるよ。カードのカギとは別ものだから、カードはそのまま使える。",
    middle: "ban",
    middleLabel: "スマホのカギだけ止める",
    motion: "pop",
    phoneScreen: "ban",
    phoneVault: true,
    phoneKey: false,
  },
];

export const PhoneSetup = clientEntry(
  import.meta.url,
  function PhoneSetup(handle: Handle) {
    let step = 0;
    const go = (next: number) => {
      step = Math.max(0, Math.min(steps.length - 1, next));
      handle.update();
    };

    return () => {
      const s = steps[step];
      return (
        <div>
          <div mix={sceneStyle}>
            <figure mix={[sideStyle, s.cardDim ? dimStyle : undefined]}>
              <CardFront label="マイナンバーカード" />
              <figcaption>カード</figcaption>
              <span mix={tagStyle}>
                <Icon name="key" /> カードのカギ
              </span>
            </figure>

            <div mix={middleStyle} aria-label={s.middleLabel}>
              <span
                key={`m-${step}`}
                mix={[
                  middleIconStyle,
                  s.middle === "x" || s.middle === "ban"
                    ? middleNgStyle
                    : undefined,
                  motionStyle(s.motion),
                ]}
              >
                <Icon name={s.middle} size="2.2rem" />
              </span>
              <span mix={middleLabelStyle}>{s.middleLabel}</span>
            </div>

            <figure mix={[sideStyle, phoneSideStyle]}>
              <div mix={phoneWrapStyle}>
                <Phone
                  label="スマートフォン"
                  screen={s.phoneScreen}
                  vault={s.phoneVault}
                />
                {s.phoneKey
                  ? (
                    <span key={`k-${step}`} mix={phoneKeyStyle}>
                      <Icon name="key" size="1.3rem" />
                    </span>
                  )
                  : null}
              </div>
              <figcaption>スマホ</figcaption>
              {s.phoneKey
                ? (
                  <span mix={tagStyle}>
                    <Icon name="key" /> スマホのカギ
                  </span>
                )
                : null}
            </figure>
          </div>

          <p key={`c-${step}`} mix={captionStyle} aria-live="polite">
            {emphasize(s.caption)}
          </p>
          <StepBar step={step} total={steps.length} onGo={go} />
        </div>
      );
    };
  },
);

function motionStyle(motion: Step["motion"]) {
  return motion === "right"
    ? rightStyle
    : motion === "left"
    ? leftStyle
    : motion === "waves"
    ? wavesStyle
    : motion === "pop"
    ? popStyle
    : undefined;
}

const sceneStyle = css({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 0.9fr) minmax(0, 0.8fr)",
  alignItems: "center",
  gap: "0.5rem",
  minHeight: "12rem",
});

const sideStyle = css({
  margin: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.3rem",
  transition: "opacity 300ms",
  "& figcaption": { fontWeight: 700, fontSize: "0.9rem" },
});

const phoneSideStyle = css({ maxWidth: "7.5rem", justifySelf: "center" });

const phoneWrapStyle = css({ position: "relative", width: "100%" });

const phoneKeyStyle = css({
  position: "absolute",
  left: "50%",
  top: "62%",
  translate: "-50% -50%",
  display: "grid",
  placeItems: "center",
  padding: "0.3rem",
  borderRadius: "999px",
  border: `2px solid ${art.gold}`,
  background: color.surface,
  color: art.gold,
  animation: "pop-in 500ms ease-out",
});

const dimStyle = css({ opacity: 0.45 });

const tagStyle = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
  padding: "0.15rem 0.6rem",
  borderRadius: "999px",
  background: art.goldSoft,
  border: `1px solid ${art.gold}`,
  fontFamily: font.round,
  fontSize: "0.75rem",
  fontWeight: 700,
  whiteSpace: "nowrap",
});

const middleStyle = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.25rem",
  textAlign: "center",
});

const middleIconStyle = css({
  display: "grid",
  placeItems: "center",
  width: "3.6rem",
  height: "3.6rem",
  borderRadius: radius.md,
  background: art.softBlue,
  color: color.accent,
});

const middleNgStyle = css({ background: art.softRed, color: art.ng });

const middleLabelStyle = css({
  fontSize: "0.8rem",
  fontWeight: 700,
  color: color.muted,
  padding: "0.1rem 0.4rem",
  borderRadius: radius.sm,
  background: color.card,
});

const popStyle = css({ animation: "pop-in 450ms ease-out" });
const rightStyle = css({ animation: "travel-right 1.2s ease-in-out both" });
const leftStyle = css({ animation: "travel-left 1.2s ease-in-out both" });
const wavesStyle = css({ animation: "waves 1.1s ease-out infinite" });
