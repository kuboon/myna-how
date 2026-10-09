/**
 * The JSX runtime the site compiles against: Remix's, plus readings above every kanji.
 *
 * `deno.json` points `jsxImportSource` here, so every `<p>本人</p>` in a page or an island comes
 * through `jsx()` below on the server and in the browser alike, and the string children of a host
 * element are split by `rubify` into text and `<ruby>` elements before Remix sees them. Doing it
 * here, rather than in each page, is what keeps an island's first render the same on both sides —
 * and keeps a page author from having to think about it at all.
 *
 * Elements whose text is not prose — `<title>`, SVG `<text>`, code, `<ruby>` itself — are left
 * alone. Attributes (`aria-label`, `alt`) are never touched; only children are.
 */

import { Fragment, jsx as remixJsx } from "@remix-run/component/jsx-runtime";

import { hasKanji, rubify } from "./ruby/rubify.ts";

export * from "@remix-run/component/jsx-runtime";

/** Host elements whose text children are not set with readings. */
const PLAIN = new Set([
  "title",
  "script",
  "style",
  "option",
  "textarea",
  "ruby",
  "rt",
  "rp",
  "code",
  "pre",
  "kbd",
  "samp",
  // SVG text cannot hold <ruby>.
  "text",
  "tspan",
  "desc",
]);

/** A string child, as text and `<ruby>` elements. */
function withReadings(text: string): unknown {
  if (!hasKanji(text)) return text;
  const tokens = rubify(text);
  if (tokens.length === 1 && typeof tokens[0] === "string") return text;
  // One <span> around the lot: in a flex row (a button, a nav pill) every child is an item of its
  // own, and a sentence cut into text and <ruby> pieces would come apart at each kanji.
  return remixJsx("span", {
    children: tokens.map((token) =>
      typeof token === "string" ? token : remixJsx("ruby", {
        children: [token.base, remixJsx("rt", { children: token.reading })],
      })
    ),
  });
}

/** Every string in a children value — a string, or arrays of them nested any deep. */
function mapChildren(children: unknown): unknown {
  if (typeof children === "string") return withReadings(children);
  if (!Array.isArray(children)) return children;
  // `第{n}章` arrives as three children; joined first, it is one word with one <span> around it
  // rather than three flex items.
  const joined: unknown[] = [];
  for (const child of children) {
    const last = joined[joined.length - 1];
    const text = typeof child === "string" || typeof child === "number";
    if (text && typeof last === "string") {
      joined[joined.length - 1] = last + String(child);
    } else {
      joined.push(text ? String(child) : child);
    }
  }
  return joined.map(mapChildren);
}

// deno-lint-ignore no-explicit-any
export function jsx(type: any, props: any, key?: any) {
  if (
    props && "children" in props &&
    (type === Fragment || (typeof type === "string" && !PLAIN.has(type)))
  ) {
    props = { ...props, children: mapChildren(props.children) };
  }
  return remixJsx(type, props, key);
}

export { jsx as jsxDEV, jsx as jsxs };
