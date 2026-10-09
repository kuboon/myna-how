/**
 * Chapter 5's moving picture: what each website learns about you, under three ways of logging in.
 *
 * 1. Showing the name-bearing certificate: every site sees your name and address.
 * 2. The login certificate as is: no name, but every site sees the same number, so sites that
 *    compare notes can tell it is the same person.
 * 3. A different number per site (pairwise pseudonymous IDs, as the Digital Agency's app hands
 *    out): each site still recognises you next time, but no two sites can match you up.
 */

import { clientEntry, css, type Handle, on } from "@remix-run/component";

import { buttonStyle, primaryStyle } from "../ui/controls.tsx";
import { Icon, type IconName } from "../ui/icons.tsx";
import { art, color, font, radius } from "../tokens.ts";

type Mode = "name" | "same" | "pairwise";

interface Shop {
  id: string;
  icon: IconName;
  name: string;
}

const shops: Shop[] = [
  { id: "game", icon: "gamepad", name: "ゲームのサイト" },
  { id: "shop", icon: "cart", name: "ネットのお店" },
  { id: "library", icon: "book", name: "図書館の予約" },
];

const modes: { id: Mode; label: string; lead: string }[] = [
  {
    id: "name",
    label: "① 名前入りの証明書を見せる",
    lead: "どのサイトにも、名前や住所がそのまま伝わる。",
  },
  {
    id: "same",
    label: "② 名前なし・同じ番号",
    lead: "名前は伝わらない。でも、どのサイトにも同じ番号が伝わる。",
  },
  {
    id: "pairwise",
    label: "③ 名前なし・サイトごとにちがう番号",
    lead: "名前は伝わらない。番号もサイトごとにちがう。",
  },
];

/** A stable, made-up ID for (person, site): the same pair always gives the same answer. */
function pseudonym(seed: string): string {
  let h = 5381;
  for (const ch of seed) h = (Math.imul(h, 33) ^ ch.charCodeAt(0)) >>> 0;
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += abc[h % abc.length];
    h = (Math.floor(h / abc.length) ^ Math.imul(i + 1, 2654435761)) >>> 0;
  }
  return `${out.slice(0, 3)}-${out.slice(3)}`;
}

function whatTheySee(mode: Mode, shop: Shop): string {
  switch (mode) {
    case "name":
      return "まいな はなこ／○○市△△町 1-2-3／2015年4月1日生まれ";
    case "same":
      return `番号 ${pseudonym("card-serial")}`;
    case "pairwise":
      return `番号 ${pseudonym(`hanako@${shop.id}`)}`;
  }
}

export const PairwiseDemo = clientEntry(
  import.meta.url,
  function PairwiseDemo(handle: Handle) {
    let mode: Mode = "pairwise";
    /** How many times each site has seen a login. */
    let visits: Record<string, number> = {};
    let compared = false;

    const setMode = (m: Mode) => {
      mode = m;
      visits = {};
      compared = false;
      handle.update();
    };

    const login = (shop: Shop) => {
      visits = { ...visits, [shop.id]: (visits[shop.id] ?? 0) + 1 };
      compared = false;
      handle.update();
    };

    return () => {
      const seen = shops.filter((s) => (visits[s.id] ?? 0) > 0);
      const linkable = mode !== "pairwise";
      return (
        <div>
          <div mix={modesStyle} role="group" aria-label="ログインのしかた">
            {modes.map((m) => (
              <button
                key={m.id}
                type="button"
                aria-pressed={mode === m.id ? "true" : "false"}
                mix={[
                  buttonStyle,
                  modeButtonStyle,
                  on("click", () => setMode(m.id)),
                ]}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p mix={leadStyle}>{modes.find((m) => m.id === mode)!.lead}</p>

          <div mix={personStyle}>
            <span aria-hidden="true" mix={personIconStyle}>
              <Icon name="user" size="1.8rem" />
            </span>
            <span>
              <strong>はなこさん</strong>が、3
              つのサイトにマイナカードでログインするよ。「ログイン」をおしてみよう（同じサイトに
              2 回目もためしてね）。
            </span>
          </div>

          <div mix={shopsStyle}>
            {shops.map((shop) => {
              const n = visits[shop.id] ?? 0;
              return (
                <div key={shop.id} mix={shopStyle}>
                  <div mix={shopHeadStyle}>
                    <span aria-hidden="true" mix={shopIconStyle}>
                      <Icon name={shop.icon} size="1.4rem" />
                    </span>
                    <strong>{shop.name}</strong>
                  </div>
                  <button
                    type="button"
                    mix={[
                      buttonStyle,
                      primaryStyle,
                      on("click", () => login(shop)),
                    ]}
                  >
                    ログイン
                  </button>
                  <div mix={seeStyle} aria-live="polite">
                    {n > 0
                      ? (
                        <div key={`${mode}-${n}`} mix={popStyle}>
                          <small>サイトにとどいたもの</small>
                          <p
                            mix={[
                              receivedStyle,
                              mode === "name" ? exposedStyle : undefined,
                            ]}
                          >
                            {whatTheySee(mode, shop)}
                          </p>
                          <small>
                            {n === 1
                              ? "「はじめまして！」"
                              : mode === "name"
                              ? `「まいなさん、${n} 回目だね」`
                              : `「この番号の人、${n} 回目だね」`}
                          </small>
                        </div>
                      )
                      : <small>まだログインしていない</small>}
                  </div>
                </div>
              );
            })}
          </div>

          <div mix={compareStyle}>
            <button
              type="button"
              mix={[
                buttonStyle,
                on("click", () => {
                  compared = true;
                  handle.update();
                }),
              ]}
              disabled={seen.length < 2}
            >
              <Icon name="peeker" />
              サイトどうしで、とどいたものを見せ合ったら？
            </button>
            {seen.length < 2
              ? <small>（2 つ以上のサイトにログインするとおせるよ）</small>
              : null}
            {compared
              ? (
                <p
                  key={`cmp-${mode}`}
                  mix={[verdictStyle, linkable ? badStyle : goodStyle]}
                >
                  <Icon
                    name={mode === "name"
                      ? "frown"
                      : mode === "same"
                      ? "meh"
                      : "smile"}
                    size="1.6rem"
                  />
                  <span>
                    {mode === "name"
                      ? "名前も住所もわかるし、ぜんぶ同じ人だとバレバレ。"
                      : mode === "same"
                      ? "名前はわからない。でも番号が同じだから「同じ人だ」とわかってしまう。"
                      : "番号がばらばらなので、同じ人かどうかわからない！ それぞれのサイトは「また来た人だ」とはわかるのにね。"}
                  </span>
                </p>
              )
              : null}
          </div>
        </div>
      );
    };
  },
);

const modesStyle = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "0.4rem",
});

const modeButtonStyle = css({
  minHeight: "2.5rem",
  padding: "0.3rem 0.9rem",
  fontSize: "0.9rem",
  borderRadius: "999px",
  border: `2px solid ${color.line}`,
  background: color.surface,
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

const leadStyle = css({
  margin: "0.6rem 0",
  fontWeight: 700,
});

const personStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
  padding: "0.6rem 0.8rem",
  borderRadius: radius.md,
  background: color.card,
  fontSize: "0.95rem",
  lineHeight: 1.7,
});

const personIconStyle = css({
  display: "grid",
  placeItems: "center",
  width: "3rem",
  height: "3rem",
  flex: "none",
  borderRadius: "999px",
  background: art.softBlue,
  color: color.accent,
});

const shopsStyle = css({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(11rem, 1fr))",
  gap: "0.6rem",
  marginTop: "0.8rem",
});

const shopStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  padding: "0.75rem",
  border: `2px solid ${color.border}`,
  borderRadius: radius.lg,
  background: color.surface,
});

const shopHeadStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  fontFamily: font.round,
});

const shopIconStyle = css({
  display: "grid",
  placeItems: "center",
  width: "2.4rem",
  height: "2.4rem",
  flex: "none",
  borderRadius: radius.md,
  background: art.softBlue,
  color: color.accent,
});

const seeStyle = css({
  minHeight: "6.5rem",
  padding: "0.5rem",
  borderRadius: radius.md,
  background: color.card,
  "& small": { color: color.muted, fontSize: "0.75rem" },
});

const popStyle = css({ animation: "pop-in 300ms ease-out" });

const receivedStyle = css({
  margin: "0.2rem 0",
  fontFamily: font.mono,
  fontWeight: 800,
  fontSize: "0.95rem !important",
  lineHeight: "1.5 !important",
  wordBreak: "break-all",
});

const exposedStyle = css({ color: art.ng, fontFamily: "inherit" });

const compareStyle = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.4rem",
  marginTop: "1rem",
  textAlign: "center",
  "& small": { color: color.muted },
});

const verdictStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
  margin: 0,
  padding: "0.6rem 0.9rem",
  borderRadius: radius.md,
  fontWeight: 700,
  textAlign: "left",
  animation: "pop-in 300ms ease-out",
});

const goodStyle = css({
  background: art.softGreen,
  "& > svg": { color: art.ok },
});
const badStyle = css({ background: art.softRed, "& > svg": { color: art.ng } });
