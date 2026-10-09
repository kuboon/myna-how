import { css, type Handle } from "@remix-run/component";

import { chapterHref, chapters } from "../chapters.ts";
import { SITE_NAME } from "../layout.tsx";
import { CardFront } from "../ui/art.tsx";
import { Icon } from "../ui/icons.tsx";
import { art, color, font, radius, wideWidth } from "../tokens.ts";

export const title = `${SITE_NAME} — 動く図でわかるマイナカードのしくみ`;
export const description =
  "マイナンバーカードの中身、こわされにくさ、スマホ搭載、本人確認、名前を出さないログイン、デジタル認証アプリまで。動く図で、小学生にもわかるように説明します。";

/** The home page places no island: the card spins with CSS alone. */
export const hydrate = false;

export default function Home(_handle: Handle) {
  return () => (
    <>
      <section mix={heroStyle}>
        <div mix={heroInnerStyle}>
          <div mix={heroTextStyle}>
            <p mix={heroEyebrowStyle}>動く図で、しくみがわかる</p>
            <h1 mix={titleStyle}>
              マイナンバーカードの<span mix={accentStyle}>ひみつ</span>
            </h1>
            <p mix={leadStyle}>
              金色の小さなチップには、どんなしかけがあるんだろう？
              図をさわりながら、いっしょにのぞいてみよう。
            </p>
            <a href={chapterHref(chapters[0].key)} mix={ctaStyle}>
              だい1しょうから読む <Icon name="arrowRight" />
            </a>
          </div>
          <div mix={stageStyle} aria-hidden="true">
            <div mix={spinnerStyle}>
              <div mix={[faceStyle]}>
                <CardFront label="" />
              </div>
              <div mix={[faceStyle, backStyle]}>
                <CardBack />
              </div>
            </div>
          </div>
        </div>
      </section>

      <h2 mix={sectionTitleStyle}>{chapters.length} つの章</h2>
      <ol mix={tocStyle}>
        {chapters.map((c, i) => (
          <li key={c.key}>
            <a href={chapterHref(c.key)} mix={tocCardStyle}>
              <span mix={tocTopStyle}>
                <span mix={tocIconStyle} aria-hidden="true">
                  <Icon name={c.icon} size="1.9rem" />
                </span>
                <span mix={tocNumberStyle}>
                  <span mix={visuallyHiddenStyle}>だい</span>
                  {i + 1}
                  <span mix={visuallyHiddenStyle}>しょう</span>
                </span>
              </span>
              <strong>{c.title}</strong>
              <span mix={tocLeadStyle}>{c.lead}</span>
            </a>
          </li>
        ))}
      </ol>

      <section mix={howStyle} aria-labelledby="how">
        <h2 id="how" mix={visuallyHiddenStyle}>このサイトの読み方</h2>
        <p>
          <span mix={[howMarkStyle, howPlayStyle]} aria-hidden="true">
            <Icon name="play" size="1.1rem" />
          </span>
          <span>
            <strong>青いわく</strong>の図は、さわって動かせるよ。
          </span>
        </p>
        <p>
          <span mix={[howMarkStyle, howBulbStyle]} aria-hidden="true">
            <Icon name="bulb" size="1.1rem" />
          </span>
          <span>
            <strong>たとえるなら</strong>は、身近なものにたとえた説明。
          </span>
        </p>
        <p>
          <span mix={[howMarkStyle, howSummaryStyle]} aria-hidden="true">
            ！
          </span>
          <span>
            <strong>ひとことでいうと</strong>で、章のまとめ。
          </span>
        </p>
        <p>
          <span mix={[howMarkStyle, howBulbStyle]} aria-hidden="true">大</span>
          <span>
            <strong>おとなの人向けメモ</strong>に、ほんとうの名前と数字。
          </span>
        </p>
      </section>
    </>
  );
}

/** The back of the card: the number side, with the number hidden. */
function CardBack(_handle: Handle) {
  return () => (
    <svg
      viewBox="0 0 340 214"
      role="img"
      aria-label="マイナンバーカードのうら"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <rect
        x="2"
        y="2"
        width="336"
        height="210"
        rx="16"
        fill="#1f5bd8"
        stroke="#163f99"
        stroke-width="3"
      />
      <text x="24" y="44" fill="#fff" font-size="16" font-weight="700">
        個人番号
      </text>
      <text
        x="24"
        y="88"
        fill="#fff"
        font-size="30"
        font-weight="700"
        letter-spacing="4"
      >
        ●●●● ●●●● ●●●●
      </text>
      <rect x="24" y="118" width="190" height="10" rx="5" fill="#ffffff66" />
      <rect x="24" y="138" width="140" height="10" rx="5" fill="#ffffff66" />
      <rect x="240" y="120" width="76" height="76" rx="6" fill="#ffffff" />
      <path
        d="M250 130h20v20h-20zM286 130h20v20h-20zM250 166h20v20h-20zM280 162h8v8h-8zM294 176h12v10h-12z"
        fill="#163f99"
      />
    </svg>
  );
}

/** The blue band runs edge to edge, out of the column it is placed in. */
const heroStyle = css({
  marginInline: "calc(50% - 50vw)",
  marginTop: "-3rem",
  background: color.accent,
  color: color.onAccent,
});

const heroInnerStyle = css({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "3rem",
  maxWidth: wideWidth,
  marginInline: "auto",
  padding: "4.5rem 1rem 5rem",
  "@media (max-width: 560px)": { padding: "3rem 1rem 3.5rem", gap: "2rem" },
});

const heroTextStyle = css({
  flex: "999 1 26rem",
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "1.25rem",
});

const heroEyebrowStyle = css({
  margin: 0,
  fontWeight: 700,
  color: art.goldLight,
});

const titleStyle = css({
  margin: 0,
  fontSize: "clamp(2.3rem, 5vw, 3.6rem)",
  lineHeight: 1.2,
});

const accentStyle = css({ color: art.goldLight });

const leadStyle = css({
  margin: 0,
  fontSize: "1.15rem",
  opacity: 0.92,
});

const ctaStyle = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  minHeight: "3.25rem",
  marginTop: "0.5rem",
  padding: "0 1.6rem",
  borderRadius: "999px",
  background: color.surface,
  color: color.accent,
  fontFamily: font.round,
  fontWeight: 800,
  fontSize: "1.05rem",
  textDecoration: "none",
  "&:hover": { color: color.accentStrong, transform: "translateY(-1px)" },
});

const stageStyle = css({
  flex: "1 1 18rem",
  maxWidth: "21rem",
  marginInline: "auto",
  perspective: "900px",
  transform: "rotate(-5deg)",
});

const spinnerStyle = css({
  position: "relative",
  transformStyle: "preserve-3d",
  animation: "spin-card 7s ease-in-out infinite",
  aspectRatio: "340 / 214",
});

const faceStyle = css({
  position: "absolute",
  inset: 0,
  backfaceVisibility: "hidden",
  filter: "drop-shadow(0 22px 30px rgb(10 20 50 / 0.3))",
});

const backStyle = css({ transform: "rotateY(180deg)" });

const sectionTitleStyle = css({ marginTop: "4rem", fontSize: "1.9rem" });

const tocStyle = css({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(min(20rem, 100%), 1fr))",
  gap: "1.25rem",
  padding: 0,
  listStyle: "none",
  "& li": { margin: 0, display: "flex" },
});

const tocCardStyle = css({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "0.8rem",
  padding: "1.6rem",
  border: "2px solid transparent",
  borderRadius: radius.lg,
  background: color.surface,
  color: color.fg,
  textDecoration: "none",
  transition: "transform 150ms, border-color 150ms",
  "& strong": {
    fontFamily: font.round,
    fontWeight: 800,
    fontSize: "1.3rem",
    lineHeight: 1.45,
  },
  "&:hover": {
    borderColor: color.accent,
    color: color.fg,
    transform: "translateY(-2px)",
  },
});

const tocTopStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

const tocIconStyle = css({
  display: "grid",
  placeItems: "center",
  width: "3.5rem",
  height: "3.5rem",
  borderRadius: "1rem",
  background: art.softBlue,
  color: color.accent,
});

const tocNumberStyle = css({
  fontFamily: font.round,
  fontWeight: 800,
  fontSize: "2.5rem",
  lineHeight: 1,
  color: color.border,
});

const tocLeadStyle = css({
  color: color.muted,
  fontSize: "0.95rem",
  lineHeight: 1.8,
});

const howStyle = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "1.25rem",
  marginTop: "2rem",
  padding: "1.6rem",
  borderRadius: radius.lg,
  background: color.surface,
  "& p": {
    flex: "1 1 14rem",
    display: "flex",
    alignItems: "flex-start",
    gap: "0.75rem",
    margin: 0,
    fontSize: "0.95rem",
    lineHeight: 1.8,
  },
});

const howMarkStyle = css({
  flex: "none",
  display: "grid",
  placeItems: "center",
  width: "2.25rem",
  height: "2.25rem",
  borderRadius: "0.6rem",
  fontFamily: font.round,
  fontWeight: 800,
});

const howPlayStyle = css({ background: color.accent, color: color.onAccent });
const howBulbStyle = css({ background: art.softBlue, color: color.accent });
const howSummaryStyle = css({ background: art.goldLight, color: art.ink });

/** Read out, not shown: "だい" and "しょう" around a tile's big number. */
const visuallyHiddenStyle = css({
  position: "absolute",
  width: "1px",
  height: "1px",
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
});
