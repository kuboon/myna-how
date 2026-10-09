/**
 * Chapter 6's moving picture: logging in to a website with the Digital Agency's app.
 *
 * Three actors — the website, the app on your phone, the Digital Agency's server — and the step
 * highlights who is acting and which way the message travels.
 */

import { clientEntry, css, type Handle } from "@remix-run/component";

import { captionStyle, emphasize, StepBar } from "../ui/controls.tsx";
import { Icon, type IconName } from "../ui/icons.tsx";
import { art, color, font, radius } from "../tokens.ts";

type Actor = "site" | "app" | "agency";

/** What one actor's screen shows: a row of icons, each with words beside it or alone. */
type Screen = { icon: IconName; text?: string }[];

interface Step {
  active: Actor[];
  /** Which way the message goes, if one is on the move. */
  arrow: { from: Actor; to: Actor; label: string } | null;
  screens: Record<Actor, Screen>;
  caption: string;
}

const steps: Step[] = [
  {
    active: ["site"],
    arrow: null,
    screens: {
      site: [{ icon: "card", text: "マイナンバーカードでログイン" }],
      app: [],
      agency: [],
    },
    caption:
      "お店や役所のサイトに、<「マイナンバーカードでログイン」ボタン>がある。おしてみよう。",
  },
  {
    active: ["site", "app"],
    arrow: { from: "site", to: "app", label: "ログインしたいです" },
    screens: {
      site: [{ icon: "hourglass", text: "アプリで確かめてね" }],
      app: [{ icon: "clipboard", text: "このサイトにログインしますか？" }],
      agency: [],
    },
    caption:
      "スマホの<デジタル認証アプリ>がひらく。どのサイトが、何を知りたがっているかが表示されるよ。名前などを教える場合は、ここで自分で決められる。",
  },
  {
    active: ["app"],
    arrow: null,
    screens: {
      site: [{ icon: "hourglass" }],
      app: [
        { icon: "keypad", text: "暗証番号" },
        { icon: "arrowRight" },
        { icon: "card", text: "カードをかざす" },
      ],
      agency: [],
    },
    caption:
      "<暗証番号を入れて、カードをスマホにかざす>。チップの中で、ひみつのカギを使って電子署名がつけられるよ。",
  },
  {
    active: ["app", "agency"],
    arrow: { from: "app", to: "agency", label: "電子署名＋証明書" },
    screens: {
      site: [{ icon: "hourglass" }],
      app: [{ icon: "wave", text: "確認中…" }],
      agency: [{ icon: "search", text: "本物？ まだ使える？" }],
    },
    caption:
      "アプリは<デジタル庁のサーバー>に電子署名と証明書を送る。サーバーは「本物の電子署名か」「証明書はまだ使えるか（J-LISに確認）」を調べるよ。",
  },
  {
    active: ["agency", "site"],
    arrow: { from: "agency", to: "site", label: "OK！＋このサイト用の番号" },
    screens: {
      site: [{ icon: "sparkle", text: "ログインできました" }],
      app: [{ icon: "check", text: "おわり" }],
      agency: [{ icon: "check", text: "OK" }],
    },
    caption:
      "サイトには「本人だと確かめたよ」という返事と、<このサイト用の番号>がとどく。ログインできた！ サイトは、むずかしい電子署名の確認を自分でしなくていいんだ。",
  },
];

const actors: { id: Actor; icon: IconName; name: string }[] = [
  { id: "site", icon: "monitor", name: "お店・役所のサイト" },
  { id: "app", icon: "phone", name: "デジタル認証アプリ" },
  { id: "agency", icon: "landmark", name: "デジタル庁のサーバー" },
];

const iconOf = (id: Actor) => actors.find((a) => a.id === id)!.icon;

export const AppFlow = clientEntry(
  import.meta.url,
  function AppFlow(handle: Handle) {
    let step = 0;
    const go = (next: number) => {
      step = Math.max(0, Math.min(steps.length - 1, next));
      handle.update();
    };

    return () => {
      const s = steps[step];
      return (
        <div>
          <div mix={rowStyle}>
            {actors.map((a) => (
              <div
                key={a.id}
                mix={[
                  actorStyle,
                  s.active.includes(a.id) ? activeStyle : undefined,
                ]}
              >
                <span aria-hidden="true" mix={iconStyle}>
                  <Icon name={a.icon} size="1.9rem" />
                </span>
                <strong mix={nameStyle}>{a.name}</strong>
                <div mix={screenStyle}>
                  {s.screens[a.id].length > 0
                    ? (
                      <span key={`${a.id}-${step}`} mix={popStyle}>
                        {s.screens[a.id].map((part, i) => (
                          <span key={i} mix={screenPartStyle}>
                            <Icon name={part.icon} />
                            {part.text}
                          </span>
                        ))}
                      </span>
                    )
                    : null}
                </div>
              </div>
            ))}
          </div>

          <div mix={arrowRowStyle} aria-live="polite">
            {s.arrow
              ? (
                <span key={`arrow-${step}`} mix={arrowStyle}>
                  <Icon name={iconOf(s.arrow.from)} />
                  {s.arrow.label}
                  <Icon name="arrowRight" />
                  <Icon name={iconOf(s.arrow.to)} />
                </span>
              )
              : <span mix={quietStyle}></span>}
          </div>

          <p key={`c-${step}`} mix={captionStyle}>
            {emphasize(s.caption)}
          </p>
          <StepBar step={step} total={steps.length} onGo={go} />
        </div>
      );
    };
  },
);

const rowStyle = css({
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "0.5rem",
});

const actorStyle = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.25rem",
  padding: "0.6rem 0.4rem",
  border: `2px solid ${color.border}`,
  borderRadius: radius.lg,
  background: color.surface,
  textAlign: "center",
  opacity: 0.55,
  transition: "opacity 250ms, border-color 250ms, transform 250ms",
});

const activeStyle = css({
  opacity: 1,
  borderColor: color.accent,
  background: art.softBlue,
  transform: "translateY(-3px)",
});

const iconStyle = css({
  display: "grid",
  placeItems: "center",
  width: "3rem",
  height: "3rem",
  borderRadius: radius.md,
  background: art.softBlue,
  color: color.accent,
});

const nameStyle = css({
  fontFamily: font.round,
  fontSize: "0.8rem",
  lineHeight: 1.4,
});

const screenStyle = css({
  width: "100%",
  minHeight: "4rem",
  display: "grid",
  placeItems: "center",
  padding: "0.3rem",
  borderRadius: radius.md,
  background: color.surface,
  border: `1px solid ${color.border}`,
  fontSize: "0.8rem",
  fontWeight: 700,
  lineHeight: 1.5,
});

const popStyle = css({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  alignItems: "center",
  gap: "0.2rem 0.4rem",
  animation: "pop-in 350ms ease-out",
});

const screenPartStyle = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
  "& svg": { color: color.accent },
});

const arrowRowStyle = css({
  display: "flex",
  justifyContent: "center",
  minHeight: "2.4rem",
  marginTop: "0.6rem",
});

const arrowStyle = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.4rem",
  padding: "0.3rem 0.9rem",
  color: art.ink,
  borderRadius: "999px",
  background: art.goldLight,
  fontWeight: 800,
  fontSize: "0.9rem",
  animation: "pop-in 400ms ease-out",
});

const quietStyle = css({ visibility: "hidden" });
