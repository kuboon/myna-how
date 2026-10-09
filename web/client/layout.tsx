/**
 * The document shell — the header with the table of contents, the page, and the footer.
 *
 * Written the way every Remix component is: a setup function that returns a render function,
 * placed as `<Layout title={…}>…</Layout>`. Its CSS is right here as `css(...)` mixins; the renderer
 * collects the mixins a page rendered and writes them into `<head>`.
 *
 * What turns this tree into a response is `context.render`, from the `render({ assets })`
 * middleware in `router.tsx` — `renderToStream`, whose end-of-document marker the runtime needs to
 * swap pages on a soft navigation.
 *
 * The one stylesheet it links is `static/app.css`: the site's tokens, its document-level defaults,
 * its animations, and the `@layer base, rmx, app` statement the whole cascade hangs off. Layers
 * rank by where they are first named and Remix appends its collected styles just before `</head>`,
 * so the link has to come first.
 */

import { css, type Handle, type RemixNode } from "@remix-run/component";

import { base, BASE_META_NAME } from "./base.ts";
import { chapterHref, chapters } from "./chapters.ts";
import { routes } from "./routes.ts";
import { color, contentWidth, radius } from "./tokens.ts";

/** What every page hands the shell. */
export interface LayoutProps {
  title: string;
  description?: string;
  /**
   * The page's social card — the URL of the PNG `server/og/` draws for it. Absolute when the
   * deploy URL is known, because `og:image` is fetched by someone else's server.
   */
  image: string | null;
  /**
   * The client runtime, for a page that places an island; `null` for a page with none. Required
   * rather than optional because a forgotten runtime looks exactly like a page that needs none —
   * it renders fine, and nothing on it moves.
   */
  script: ClientRuntime | null;
  children: RemixNode;
}

/** Where the client runtime lives, and what it pulls in behind it. */
export interface ClientRuntime {
  src: string;
  /** The chunks it imports, for `<link rel="modulepreload">`. */
  preloads: readonly string[];
}

/**
 * What every page module exports: a component, plus what the shell needs to frame it.
 *
 * `hydrate` is required rather than optional: an omitted flag is indistinguishable from a page
 * that genuinely ships nothing, and the page still renders.
 */
export interface PageModule<Props = Record<string, never>> {
  default: (handle: Handle<Props>) => () => RemixNode;
  title: string;
  description?: string;
  /** Whether the page places a client entry, so the shell boots the runtime for it. */
  hydrate: boolean;
}

/** The site's name, in the header and on every social card. */
export const SITE_NAME = "マイナンバーカードのひみつ";

/**
 * Renders a page inside the document shell.
 *
 * @param handle The page's title, body, and whether it hydrates
 * @returns The document
 */
export function Layout(handle: Handle<LayoutProps>) {
  return () => {
    const props = handle.props;

    return (
      <html lang="ja">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{props.title}</title>
          {props.description
            ? <meta name="description" content={props.description} />
            : null}
          <meta property="og:type" content="website" />
          <meta property="og:title" content={props.title} />
          {props.description
            ? <meta property="og:description" content={props.description} />
            : null}
          {props.image
            ? (
              <>
                <meta property="og:image" content={props.image} />
                <meta name="twitter:card" content="summary_large_image" />
              </>
            )
            : null}
          {/* The deploy prefix, for the browser — see `client/base.ts`. */}
          <meta name={BASE_META_NAME} content={base} />
          <link rel="stylesheet" href={`${base}/static/app.css`} />
          <link
            rel="icon"
            type="image/svg+xml"
            href={`${base}/static/favicon.svg`}
          />
          {(props.script?.preloads ?? []).map((href) => (
            <link key={href} rel="modulepreload" href={href} />
          ))}
        </head>
        <body>
          <header mix={headerStyle}>
            <div mix={[bandStyle, headerInnerStyle]}>
              <a mix={brandStyle} href={routes.home.href()}>
                <span aria-hidden="true" mix={brandMarkStyle}>🪪</span>
                {SITE_NAME}
              </a>
              <nav aria-label="もくじ" mix={navStyle}>
                {chapters.map((c, i) => (
                  <a key={c.key} href={chapterHref(c.key)} mix={navLinkStyle}>
                    <span mix={navNumStyle}>{i + 1}</span>
                    {c.short}
                  </a>
                ))}
              </nav>
            </div>
          </header>
          <main mix={[bandStyle, mainStyle]}>{props.children}</main>
          <footer mix={[bandStyle, footerStyle]}>
            <p>
              このサイトは、マイナンバーカードのしくみを、わかりやすく説明するために作った
              <strong>非公式</strong>
              の解説サイトです。たとえ話を使っているので、こまかいところは本物とちがう部分があります。正しい情報は
              {" "}
              <a href="https://www.digital.go.jp/policies/mynumber">
                デジタル庁
              </a>{" "}
              や{" "}
              <a href="https://www.jpki.go.jp/">
                公的個人認証サービス（J-LIS）
              </a>{" "}
              のページを見てね。
            </p>
          </footer>
          {props.script
            ? <script type="module" src={props.script.src}></script>
            : null}
        </body>
      </html>
    );
  };
}

// --- styles -----------------------------------------------------------------

/** The measure the header, the main column and the footer all share. */
const bandStyle = css({
  width: "100%",
  maxWidth: contentWidth,
  marginInline: "auto",
  paddingInline: "1rem",
});

const headerStyle = css({
  background: color.card,
  borderBottom: `1px solid ${color.border}`,
});

const headerInnerStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.6rem",
  paddingBlock: "0.9rem",
});

const brandStyle = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  fontWeight: 800,
  fontSize: "1.25rem",
  textDecoration: "none",
  color: color.fg,
});

const brandMarkStyle = css({ fontSize: "1.5rem" });

const navStyle = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "0.4rem",
});

const navLinkStyle = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.35rem",
  padding: "0.25rem 0.7rem 0.25rem 0.3rem",
  borderRadius: "999px",
  border: `1px solid ${color.border}`,
  background: color.bg,
  color: color.fg,
  fontSize: "0.85rem",
  textDecoration: "none",
  "&:hover": { borderColor: color.accent, color: color.accent },
});

const navNumStyle = css({
  display: "inline-grid",
  placeItems: "center",
  width: "1.4rem",
  height: "1.4rem",
  borderRadius: "999px",
  background: color.accent,
  color: color.onAccent,
  fontSize: "0.75rem",
  fontWeight: 700,
});

const mainStyle = css({ paddingBlock: "2rem 3rem" });

const footerStyle = css({
  paddingBlock: "1.5rem 2.5rem",
  borderTop: `1px solid ${color.border}`,
  color: color.muted,
  fontSize: "0.85rem",
  "& p": {
    margin: 0,
    padding: "0.9rem 1rem",
    background: color.card,
    borderRadius: radius.md,
  },
});
