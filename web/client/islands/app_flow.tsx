/**
 * Chapter 6's moving picture: logging in to a website with the Digital Agency's app.
 *
 * Three actors — the website, the app on your phone, the Digital Agency's server — and the step
 * highlights who is acting and which way the message travels.
 */

import { clientEntry, css, type Handle } from "@remix-run/component";

import { captionStyle, emphasize, StepBar } from "../ui/controls.tsx";
import { art, color, radius } from "../tokens.ts";

type Actor = "site" | "app" | "agency";

interface Step {
  active: Actor[];
  /** Which way the message goes, if one is on the move. */
  arrow: { from: Actor; to: Actor; label: string } | null;
  screens: Record<Actor, string>;
  caption: string;
}

const steps: Step[] = [
  {
    active: ["site"],
    arrow: null,
    screens: {
      site: "🔘 マイナンバーカードでログイン",
      app: "",
      agency: "",
    },
    caption:
      "お店や役所のサイトに、<「マイナンバーカードでログイン」ボタン>がある。おしてみよう。",
  },
  {
    active: ["site", "app"],
    arrow: { from: "site", to: "app", label: "ログインしたいです" },
    screens: {
      site: "⏳ アプリで確かめてね",
      app: "📋 このサイトにログインしますか？",
      agency: "",
    },
    caption:
      "スマホの<デジタル認証アプリ>がひらく。どのサイトが、何を知りたがっているかが表示されるよ。名前などを教える場合は、ここで自分で決められる。",
  },
  {
    active: ["app"],
    arrow: null,
    screens: {
      site: "⏳",
      app: "🔢 暗証番号 → 🪪 カードをかざす",
      agency: "",
    },
    caption:
      "<暗証番号を入れて、カードをスマホにかざす>。チップの中で、ひみつのカギを使った答えが作られるよ。",
  },
  {
    active: ["app", "agency"],
    arrow: { from: "app", to: "agency", label: "答え＋証明書" },
    screens: {
      site: "⏳",
      app: "📡 確認中…",
      agency: "🔎 本物？ まだ使える？",
    },
    caption:
      "アプリは<デジタル庁のサーバー>に答えと証明書を送る。サーバーは「本物のカギで作った答えか」「証明書はまだ使えるか（J-LIS に確認）」を調べるよ。",
  },
  {
    active: ["agency", "site"],
    arrow: { from: "agency", to: "site", label: "OK！＋このサイト用の番号" },
    screens: {
      site: "🎉 ログインできました",
      app: "✅ 完了",
      agency: "✅ OK",
    },
    caption:
      "サイトには「本人だと確かめたよ」という返事と、<このサイト用の番号>がとどく。ログイン完了！ サイトは、むずかしいカギの確認を自分でしなくていいんだ。",
  },
];

const actors: { id: Actor; icon: string; name: string }[] = [
  { id: "site", icon: "💻", name: "お店・役所のサイト" },
  { id: "app", icon: "📱", name: "デジタル認証アプリ" },
  { id: "agency", icon: "🏛️", name: "デジタル庁のサーバー" },
];

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
                <span aria-hidden="true" mix={iconStyle}>{a.icon}</span>
                <strong mix={nameStyle}>{a.name}</strong>
                <div mix={screenStyle}>
                  {s.screens[a.id]
                    ? (
                      <span key={`${a.id}-${step}`} mix={popStyle}>
                        {s.screens[a.id]}
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
                  {actors.find((a) => a.id === s.arrow!.from)!.icon} 〜
                  {s.arrow.label}〜▶{" "}
                  {actors.find((a) => a.id === s.arrow!.to)!.icon}
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

const iconStyle = css({ fontSize: "2.2rem" });

const nameStyle = css({ fontSize: "0.8rem", lineHeight: 1.4 });

const screenStyle = css({
  width: "100%",
  minHeight: "4rem",
  display: "grid",
  placeItems: "center",
  padding: "0.3rem",
  borderRadius: radius.md,
  background: color.bg,
  fontSize: "0.8rem",
  fontWeight: 700,
  lineHeight: 1.5,
});

const popStyle = css({ animation: "pop-in 350ms ease-out" });

const arrowRowStyle = css({
  display: "flex",
  justifyContent: "center",
  minHeight: "2.4rem",
  marginTop: "0.6rem",
});

const arrowStyle = css({
  padding: "0.3rem 0.8rem",
  borderRadius: "999px",
  background: art.goldLight,
  fontWeight: 800,
  fontSize: "0.9rem",
  animation: "pop-in 400ms ease-out",
});

const quietStyle = css({ visibility: "hidden" });
