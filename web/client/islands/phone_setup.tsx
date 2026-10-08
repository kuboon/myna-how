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
import { art, color, radius } from "../tokens.ts";

interface Step {
  caption: string;
  /** What sits between the card and the phone. */
  middle: string;
  middleLabel: string;
  /** The animation the middle plays. */
  motion: "none" | "right" | "left" | "pop" | "waves";
  phoneScreen?: string;
  phoneVault: boolean;
  /** Shows the key inside the phone's vault. */
  phoneKey: boolean;
  cardDim?: boolean;
}

const steps: Step[] = [
  {
    caption:
      "「スマホにマイナカードを入れる」ときくと、カードを<コピー>するように思うよね。でも、じつはコピーはしないんだ。ひみつのカギは、カードの外に出られないから。",
    middle: "❌📄",
    middleLabel: "コピーはしない",
    motion: "pop",
    phoneVault: false,
    phoneKey: false,
  },
  {
    caption:
      "スマホの中にも、チップと同じような<とくべつな金庫>（セキュアエレメント）があるよ。ふつうのアプリでは中をのぞけない、かたい金庫なんだ。",
    middle: "🔍",
    middleLabel: "スマホの金庫",
    motion: "pop",
    phoneVault: true,
    phoneKey: false,
  },
  {
    caption:
      "その金庫の中で、<スマホ用の新しいひみつのカギ>を作るよ。このカギも、金庫の外には出ない。",
    middle: "✨",
    middleLabel: "新しいカギを作る",
    motion: "pop",
    phoneVault: true,
    phoneKey: true,
  },
  {
    caption:
      "つぎに、<本物のカードをスマホにかざして>、暗証番号を入れる。これで「このスマホを使っているのは、カードの持ち主本人です」と証明するんだ。",
    middle: "📶",
    middleLabel: "カードをかざす",
    motion: "waves",
    phoneScreen: "🔢",
    phoneVault: true,
    phoneKey: true,
  },
  {
    caption:
      "本人だとわかったので、カードを発行しているところ（J-LIS）から、<スマホ用の証明書>がとどく。スマホのカギとセットで使えるようになるよ。",
    middle: "📜",
    middleLabel: "スマホ用の証明書",
    motion: "left",
    phoneScreen: "📜",
    phoneVault: true,
    phoneKey: true,
  },
  {
    caption:
      "完成！ これからは、スマホだけで本人確認ができる。iPhone なら、暗証番号のかわりに<顔や指紋>で使えるよ。",
    middle: "🎉",
    middleLabel: "完成",
    motion: "pop",
    phoneScreen: "😀",
    phoneVault: true,
    phoneKey: true,
    cardDim: true,
  },
  {
    caption:
      "スマホをなくしたら？ <スマホのカギだけを止める>ことができるよ。カードのカギとは別ものだから、カードはそのまま使える。",
    middle: "⛔",
    middleLabel: "スマホのカギだけ止める",
    motion: "pop",
    phoneScreen: "⛔",
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
              <span mix={tagStyle}>🔑 カードのカギ</span>
            </figure>

            <div mix={middleStyle} aria-label={s.middleLabel}>
              <span
                key={`m-${step}`}
                mix={[middleIconStyle, motionStyle(s.motion)]}
              >
                {s.middle}
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
                      🗝️
                    </span>
                  )
                  : null}
              </div>
              <figcaption>スマホ</figcaption>
              {s.phoneKey ? <span mix={tagStyle}>🗝️ スマホのカギ</span> : null}
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
  fontSize: "1.6rem",
  animation: "pop-in 500ms ease-out",
});

const dimStyle = css({ opacity: 0.45 });

const tagStyle = css({
  padding: "0.1rem 0.5rem",
  borderRadius: "999px",
  background: art.goldLight,
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

const middleIconStyle = css({ fontSize: "2.4rem", display: "inline-block" });

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
