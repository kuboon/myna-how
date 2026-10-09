/**
 * The site's line icons: 24 × 24, drawn with a 2px round stroke in `currentColor`.
 *
 * Every icon is a list of SVG path strings — circles and rounded rectangles included — so the
 * same data draws the `<Icon>` here and the social cards `server/og/card.ts` paints with Skia.
 */

import type { Handle } from "@remix-run/component";

/** A circle, as a path. */
function circle(cx: number, cy: number, r: number): string {
  return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${
    -2 * r
  } 0z`;
}

/** A rounded rectangle, as a path. */
function rect(x: number, y: number, w: number, h: number, r = 0): string {
  if (r === 0) return `M${x} ${y}h${w}v${h}h${-w}z`;
  return `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${
    h - 2 * r
  }a${r} ${r} 0 0 1 ${-r} ${r}h${-(w -
    2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h -
      2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z`;
}

/** A dot: a zero-length stroke, which the round cap draws as a circle. */
function dot(x: number, y: number): string {
  return `M${x} ${y}h.01`;
}

const user = [circle(12, 8, 4), "M4 21c1-4 4-6 8-6s7 2 8 6"];
const face = circle(12, 12, 9);
const eyes = `${dot(9, 9.5)}${dot(15, 9.5)}`;

/** Each icon's strokes. An icon whose name ends up in `filled` is filled instead. */
export const iconPaths = {
  chip: [
    rect(5, 5, 14, 14, 2),
    rect(9, 9, 6, 6, 1),
    "M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3",
  ],
  shield: ["M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z"],
  shieldCheck: ["M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z", "m9 12 2 2 4-4"],
  phone: [rect(7, 2, 10, 20, 2.5), "M11 18h2"],
  key: [circle(8, 15, 4), "M10.8 12.2 20 3M17 6l3 3M15 8l2 2"],
  publicKey: [circle(8, 15, 4), "M10.8 12.2 20 3", circle(18, 18, 3)],
  userOff: [...user, "M3 3l18 18"],
  landmark: ["M3 10 12 4l9 6", "M5 10v9M9.5 10v9M14.5 10v9M19 10v9M3 21h18"],
  search: [circle(11, 11, 7), "m20 20-4-4"],
  monitor: [rect(3, 4, 18, 12, 2), "M8 20h8M12 16v4"],
  card: [rect(3, 5, 18, 14, 3), rect(6, 9, 5, 4, 1), "M14 10h4M14 13h3"],
  user,
  userX: [...user, "m16 3 5 5M21 3l-5 5"],
  peeker: [...user, "M7 8h10"],
  eye: ["M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z", circle(12, 12, 3)],
  eyeOff: [
    "M3 3l18 18",
    "M10.6 5.1A10 10 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 3.8",
    "M6.6 6.6C3.8 8.4 2 12 2 12s4 7 10 7a9.7 9.7 0 0 0 4.4-1.1",
    "M9.9 9.9a3 3 0 0 0 4.2 4.2",
  ],
  check: ["M20 6 9 17l-5-5"],
  x: ["M18 6 6 18M6 6l12 12"],
  alert: ["M12 3 2 20h20z", "M12 9v5", dot(12, 17)],
  sign: ["M14 4l6 6-9 9H5v-6z", "M4 22h16"],
  certificate: [rect(4, 3, 16, 18, 2), "M8 8h8M8 12h5", circle(15, 16, 2)],
  notebook: [rect(5, 3, 14, 18, 2), "M9 3v18M12 8h4M12 12h4"],
  question: [
    face,
    "M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7",
    dot(12, 17),
  ],
  lock: [rect(5, 11, 14, 10, 2), "M8 11V7a4 4 0 0 1 8 0v4"],
  sparkle: ["M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z", "M19 3v3M17.5 4.5h3"],
  wave: [
    "M2 9a15 15 0 0 1 20 0M5 13a10 10 0 0 1 14 0M8.5 16.5a5 5 0 0 1 7 0",
    dot(12, 20),
  ],
  ban: [face, "m5.6 5.6 12.8 12.8"],
  door: ["M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17", "M3 21h18", dot(14, 12)],
  image: [rect(3, 5, 18, 14, 2), circle(9, 10, 2), "m21 16-5-5-8 8"],
  box: ["M3 7l9-4 9 4v10l-9 4-9-4z", "m3 7 9 4 9-4M12 11v10"],
  yen: ["m6 3 6 8 6-8M12 11v10M7 13h10M7 17h10"],
  medical: [rect(3, 3, 18, 18, 3), "M12 8v8M8 12h8"],
  book: [
    "M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4z",
    "M20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z",
  ],
  pin: ["M12 21s-7-6-7-12a7 7 0 0 1 14 0c0 6-7 12-7 12z", circle(12, 9, 2.5)],
  bolt: ["M13 2 4 14h7l-1 8 9-12h-7z"],
  hammer: ["m15 3 6 6-3 3-6-6z", "m12 9-9 9 3 3 9-9"],
  upload: ["M12 15V3M7 8l5-5 5 5", "M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"],
  keypad: [
    rect(5, 2, 14, 20, 2.5),
    `${dot(9, 7)}${dot(12, 7)}${dot(15, 7)}${dot(9, 11)}${dot(12, 11)}${
      dot(15, 11)
    }${dot(9, 15)}${dot(12, 15)}${dot(15, 15)}${dot(12, 18.5)}`,
  ],
  gamepad: [
    rect(2, 7, 20, 11, 5),
    "M6 12.5h4M8 10.5v4",
    dot(15, 11.5),
    dot(17.5, 13.5),
  ],
  cart: [
    circle(9, 20, 1.5),
    circle(18, 20, 1.5),
    "M2 3h3l2.5 12h11.5l2-8H6",
  ],
  globe: [face, "M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"],
  cup: ["M6 3h12l-1 8a5 5 0 0 1-10 0z", "M12 16v5M8 21h8"],
  ticket: ["M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z", "M14 7v10"],
  smile: [face, "M8 14s1.5 2 4 2 4-2 4-2", eyes],
  frown: [face, "M16 16.5s-1.5-2-4-2-4 2-4 2", eyes],
  meh: [face, "M8.5 15h7", eyes],
  clipboard: [rect(5, 4, 14, 17, 2), rect(9, 2, 6, 4, 1), "M9 11h6M9 15h4"],
  hourglass: ["M6 3h12M6 21h12", "M7 3v3l5 6-5 6v3M17 3v3l-5 6 5 6v3"],
  compass: [face, "m15.5 8.5-2 5-5 2 2-5z"],
  bulb: [
    "M9 18h6M10 21h4",
    "M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z",
  ],
  play: ["M7 4v16l13-8z"],
  arrowRight: ["M4 12h16M14 6l6 6-6 6"],
  arrowLeft: ["M20 12H4M10 6l-6 6 6 6"],
  arrowDown: ["M12 4v16M6 14l6 6 6-6"],
  arrowUp: ["M12 20V4M6 10l6-6 6 6"],
  restart: ["M3 12a9 9 0 1 0 3-6.7L3 8", "M3 3v5h5"],
} as const satisfies Record<string, readonly string[]>;

export type IconName = keyof typeof iconPaths;

/** Icons drawn as solid shapes rather than strokes. */
export const filledIcons: ReadonlySet<IconName> = new Set(["play"]);

/**
 * A line icon. Decorative unless given a `label`, and sized in `em` by default so it sits in a
 * line of text like a glyph would.
 *
 * Nested inside another `<svg>`, `x` / `y` place it in the parent's coordinates.
 */
export function Icon(
  handle: Handle<{
    name: IconName;
    /** A CSS length, or a number of user units inside a parent `<svg>`. */
    size?: string | number;
    label?: string;
    x?: number;
    y?: number;
    strokeWidth?: number;
  }>,
) {
  return () => {
    const { name, size = "1.2em", label, x, y, strokeWidth = 2 } = handle.props;
    const filled = filledIcons.has(name);
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        x={x}
        y={y}
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        stroke-width={strokeWidth}
        stroke-linecap="round"
        stroke-linejoin="round"
        role={label ? "img" : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : "true"}
        style={{ flex: "none", verticalAlign: "-0.2em" }}
      >
        {iconPaths[name].map((d, i) => <path key={i} d={d} />)}
      </svg>
    );
  };
}
