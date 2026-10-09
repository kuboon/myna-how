/**
 * The building blocks every chapter page is made of.
 *
 * A chapter reads the same way each time — its question, a "たとえるなら" box, the moving picture,
 * "ひとことで", the words worth knowing, sources, then まえ / つぎ — and these are those pieces.
 * They render on the server only; the moving pictures are the islands under `islands/`.
 */

import { css, type Handle, type RemixNode } from "@remix-run/component";

import {
  chapterHref,
  type ChapterKey,
  chapterNumber,
  chapters,
  neighbours,
} from "./chapters.ts";
import { routes } from "./routes.ts";
import { art, color, radius } from "./tokens.ts";

/** The chapter's number, its question and the lead line under it. */
export function ChapterHead(
  handle: Handle<{ chapter: ChapterKey; children?: RemixNode }>,
) {
  return () => {
    const key = handle.props.chapter;
    const chapter = chapters.find((c) => c.key === key)!;
    return (
      <header mix={chapterHeadStyle}>
        <p mix={eyebrowStyle}>
          <span aria-hidden="true">{chapter.icon}</span> だい
          {chapterNumber(key)}しょう
        </p>
        <h1>{chapter.title}</h1>
        {handle.props.children
          ? <div mix={leadStyle}>{handle.props.children}</div>
          : null}
      </header>
    );
  };
}

/** A "たとえるなら" box: the everyday thing the idea is like. */
export function Analogy(handle: Handle<{ children: RemixNode }>) {
  return () => (
    <aside mix={[boxStyle, analogyStyle]}>
      <p mix={boxLabelStyle}>
        <span aria-hidden="true">💡</span> たとえるなら
      </p>
      {handle.props.children}
    </aside>
  );
}

/** The chapter in one line or two. */
export function Summary(handle: Handle<{ children: RemixNode }>) {
  return () => (
    <aside mix={[boxStyle, summaryStyle]}>
      <p mix={boxLabelStyle}>
        <span aria-hidden="true">📝</span> ひとことでいうと
      </p>
      {handle.props.children}
    </aside>
  );
}

/** "おとな向けメモ": the real names and numbers, for whoever is reading along with a child. */
export function GrownUpNote(handle: Handle<{ children: RemixNode }>) {
  return () => (
    <details mix={noteStyle}>
      <summary>おとなの人向けメモ（ほんとうの名前と、くわしいこと）</summary>
      <div mix={noteBodyStyle}>{handle.props.children}</div>
    </details>
  );
}

/** A frame around an island, so the moving picture reads as the thing to play with. */
export function Stage(
  handle: Handle<{ label: string; children: RemixNode }>,
) {
  return () => (
    <section mix={stageStyle} aria-label={handle.props.label}>
      <p mix={stageLabelStyle}>
        <span aria-hidden="true">▶</span> {handle.props.label}
      </p>
      {handle.props.children}
    </section>
  );
}

/** One link to a source, for the "もっとくわしく" list. */
export interface Source {
  href: string;
  label: string;
}

/** Where the facts on the page come from. */
export function Sources(handle: Handle<{ items: Source[] }>) {
  return () => (
    <section mix={sourcesStyle}>
      <h2>もっとくわしく</h2>
      <ul>
        {handle.props.items.map((s) => (
          <li key={s.href}>
            <a href={s.href}>{s.label}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** まえ / つぎ, at the foot of a chapter. */
export function ChapterNav(handle: Handle<{ chapter: ChapterKey }>) {
  return () => {
    const { prev, next } = neighbours(handle.props.chapter);
    return (
      <nav aria-label="まえ・つぎの章" mix={chapterNavStyle}>
        {prev
          ? (
            <a href={chapterHref(prev.key)} mix={[pagerStyle, prevStyle]}>
              <small>← まえ</small>
              <span>{prev.title}</span>
            </a>
          )
          : (
            <a href={routes.home.href()} mix={[pagerStyle, prevStyle]}>
              <small>← もどる</small>
              <span>はじめのページ</span>
            </a>
          )}
        {next
          ? (
            <a href={chapterHref(next.key)} mix={[pagerStyle, nextStyle]}>
              <small>つぎ →</small>
              <span>{next.title}</span>
            </a>
          )
          : (
            <a href={routes.home.href()} mix={[pagerStyle, nextStyle]}>
              <small>おしまい →</small>
              <span>はじめのページへ</span>
            </a>
          )}
      </nav>
    );
  };
}

// --- styles -----------------------------------------------------------------

const chapterHeadStyle = css({ marginBottom: "1.5rem" });

const eyebrowStyle = css({
  display: "inline-block",
  margin: "0 0 0.5rem",
  padding: "0.15rem 0.8rem",
  borderRadius: "999px",
  background: color.accent,
  color: color.onAccent,
  fontWeight: 700,
  fontSize: "0.9rem",
});

const leadStyle = css({
  fontSize: "1.1rem",
  color: color.muted,
  "& p": { marginBlock: "0.5rem" },
});

const boxStyle = css({
  marginBlock: "1.75rem",
  padding: "1rem 1.25rem",
  borderRadius: radius.lg,
  "& > :last-child": { marginBottom: 0 },
});

const boxLabelStyle = css({
  margin: "0 0 0.4rem",
  fontWeight: 800,
  fontSize: "0.95rem",
});

const analogyStyle = css({
  background: color.card,
  border: `2px dashed ${art.warm}`,
});

const summaryStyle = css({
  background: art.softGreen,
  borderInlineStart: `6px solid ${art.ok}`,
  "& p": { fontWeight: 600 },
});

const noteStyle = css({
  marginBlock: "1.75rem",
  padding: "0.75rem 1rem",
  border: `1px solid ${color.border}`,
  borderRadius: radius.md,
  fontSize: "0.95rem",
  "& summary": { cursor: "pointer", fontWeight: 700, color: color.muted },
});

const noteBodyStyle = css({
  "& p, & li": { fontSize: "0.95rem", lineHeight: 1.8 },
  "& ul": { paddingLeft: "1.2rem" },
});

const stageStyle = css({
  marginBlock: "2rem",
  padding: "1rem",
  border: `2px solid ${color.accent}`,
  borderRadius: radius.lg,
  background: color.bg,
  boxShadow: `0 6px 0 ${art.softBlue}`,
});

const stageLabelStyle = css({
  margin: "0 0 0.75rem",
  fontWeight: 800,
  color: color.accent,
  fontSize: "0.95rem",
});

const sourcesStyle = css({
  marginTop: "3rem",
  "& h2": { fontSize: "1.05rem", color: color.muted },
  "& ul": { paddingLeft: "1.2rem" },
  "& li": { fontSize: "0.9rem", lineHeight: 1.7 },
});

const chapterNavStyle = css({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0.75rem",
  marginTop: "2.5rem",
});

const pagerStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.2rem",
  padding: "0.8rem 1rem",
  border: `1px solid ${color.border}`,
  borderRadius: radius.lg,
  background: color.card,
  color: color.fg,
  textDecoration: "none",
  "& small": { color: color.accent, fontWeight: 700 },
  "& span": { fontSize: "0.95rem", lineHeight: 1.5 },
  "&:hover": { borderColor: color.accent },
});

const prevStyle = css({ textAlign: "left" });
const nextStyle = css({ textAlign: "right" });
