/**
 * The site's design tokens, as the names of the custom properties `static/app.css` defines.
 *
 * The values are not here on purpose. Light and dark swap between two palettes, which only CSS can
 * do, so `app.css` holds one copy of every token and this file holds the names — `radius.md` reads
 * as a token either way, and there is nowhere for a second value to drift.
 *
 * Islands import from here, and only from here. `theme.ts` beside it calls `css(...)`, and a
 * `css(...)` call at module scope is not something a bundler will drop — so an island that wanted
 * one border color would otherwise carry every rule in the shell into its chunk.
 */

export const color = {
  /** The ground the page sits on. */
  bg: "var(--bg)",
  /** White: the stage, tiles, buttons — anything that sits on the ground. */
  surface: "var(--surface)",
  fg: "var(--fg)",
  muted: "var(--muted)",
  /** Card blue. */
  accent: "var(--accent)",
  /** The darker blue: hover, the card's top band. */
  accentStrong: "var(--accent-strong)",
  /** Text on an `accent` background — dark in dark mode, where the accent is light. */
  onAccent: "var(--on-accent)",
  border: "var(--border)",
  /** The outline of a control: a button, a chooser pill, a step dot. */
  line: "var(--line)",
  /** A quiet panel inside a white surface: captions, the parties of a diagram. */
  card: "var(--card)",
} as const;

/** The illustrations' palette: the card, the chip, and "OK" / "NG" signals. */
export const art = {
  warm: "var(--warm)",
  gold: "var(--gold)",
  goldLight: "var(--gold-light)",
  /** The "ひとことでいうと" panel. */
  goldSoft: "var(--gold-soft)",
  ok: "var(--ok)",
  ng: "var(--ng)",
  ink: "var(--ink)",
  paper: "var(--paper)",
  softBlue: "var(--soft-blue)",
  softGreen: "var(--soft-green)",
  softRed: "var(--soft-red)",
} as const;

export const font = {
  sans: "var(--font-sans)",
  /** Headings, buttons and numbers. */
  round: "var(--font-round)",
  mono: "var(--font-mono)",
} as const;

export const radius = {
  sm: "var(--radius-sm)",
  md: "var(--radius-md)",
  lg: "var(--radius-lg)",
} as const;

/** The measure every band of the shell lines up to. */
export const contentWidth = "var(--content-width)";

/** The home page's wider measure. */
export const wideWidth = "var(--wide-width)";
