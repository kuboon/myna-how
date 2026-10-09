import { css, type Handle } from "@remix-run/component";

import { chapterHref, chapters } from "../chapters.ts";
import { SITE_NAME } from "../layout.tsx";
import { CardFront } from "../ui/art.tsx";
import { art, color, radius } from "../tokens.ts";

export const title = `${SITE_NAME} — 動く図でわかるマイナカードのしくみ`;
export const description =
  "マイナンバーカードの中身、こわされにくさ、スマホ搭載、本人確認、名前を出さないログイン、デジタル認証アプリまで。動く図で、小学生にもわかるように説明します。";

/** The home page places no island: the card spins with CSS alone. */
export const hydrate = false;

export default function Home(_handle: Handle) {
  return () => (
    <>
      <section mix={heroStyle}>
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
        <div>
          <h1 mix={titleStyle}>
            マイナンバーカードの
            <span mix={accentStyle}>ひみつ</span>
          </h1>
          <p mix={leadStyle}>
            小さな金色のチップには、どんなしかけがあるんだろう？
            <br />
            動く図をさわりながら、いっしょにのぞいてみよう。
          </p>
        </div>
      </section>

      <h2 mix={sectionTitleStyle}>もくじ</h2>
      <ol mix={tocStyle}>
        {chapters.map((c, i) => (
          <li key={c.key}>
            <a href={chapterHref(c.key)} mix={tocCardStyle}>
              <span mix={tocIconStyle} aria-hidden="true">{c.icon}</span>
              <span mix={tocTextStyle}>
                <small>だい{i + 1}しょう</small>
                <strong>{c.title}</strong>
                <span>{c.lead}</span>
              </span>
            </a>
          </li>
        ))}
      </ol>

      <section mix={howStyle}>
        <h2>このサイトの読み方</h2>
        <ul>
          <li>
            <strong>▶ のついたわく</strong>
            は、さわって動かせる図だよ。ボタンをおしてみてね。
          </li>
          <li>
            <strong>💡 たとえるなら</strong>
            は、身近なものにたとえた説明。
          </li>
          <li>
            <strong>おとなの人向けメモ</strong>
            をひらくと、ほんとうの名前やくわしい説明が出てくるよ。
          </li>
        </ul>
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
        fill="#2f6fde"
        stroke="#1d4fa8"
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
        fill="#1d4fa8"
      />
    </svg>
  );
}

const heroStyle = css({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.1fr)",
  alignItems: "center",
  gap: "1.5rem",
  padding: "1.5rem",
  borderRadius: radius.lg,
  background: `linear-gradient(135deg, ${art.softBlue}, ${color.card})`,
  "@media (max-width: 560px)": {
    gridTemplateColumns: "1fr",
    textAlign: "center",
  },
});

const stageStyle = css({
  perspective: "900px",
  maxWidth: "18rem",
  width: "100%",
  justifySelf: "center",
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
  filter: "drop-shadow(0 10px 14px rgb(0 0 0 / 0.18))",
});

const backStyle = css({ transform: "rotateY(180deg)" });

const titleStyle = css({ fontSize: "2.1rem", marginBottom: "0.5rem" });

const accentStyle = css({ color: art.warm });

const leadStyle = css({ margin: 0, fontSize: "1.1rem" });

const sectionTitleStyle = css({ marginTop: "2.5rem" });

const tocStyle = css({
  display: "grid",
  gap: "0.75rem",
  padding: 0,
  listStyle: "none",
  "& li": { margin: 0 },
});

const tocCardStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  padding: "1rem 1.1rem",
  border: `2px solid ${color.border}`,
  borderRadius: radius.lg,
  background: color.bg,
  color: color.fg,
  textDecoration: "none",
  transition: "transform 150ms, border-color 150ms",
  "&:hover": { borderColor: color.accent, transform: "translateY(-2px)" },
});

const tocIconStyle = css({
  flex: "none",
  display: "grid",
  placeItems: "center",
  width: "3.2rem",
  height: "3.2rem",
  borderRadius: "999px",
  background: color.card,
  fontSize: "1.7rem",
});

const tocTextStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.1rem",
  "& small": { color: color.accent, fontWeight: 800 },
  "& strong": { fontSize: "1.1rem", lineHeight: 1.5 },
  "& span": { color: color.muted, fontSize: "0.95rem", lineHeight: 1.7 },
});

const howStyle = css({
  marginTop: "2.5rem",
  padding: "1rem 1.25rem",
  borderRadius: radius.lg,
  background: color.card,
  "& h2": { marginTop: 0, fontSize: "1.1rem" },
  "& ul": { paddingLeft: "1.2rem", marginBottom: 0 },
});
