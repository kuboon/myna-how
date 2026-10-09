/**
 * The social cards, drawn with Skia.
 *
 * A link to a page is a title, a line of description and nothing else until someone renders it —
 * so this draws the page's own words onto a 1200×630 canvas and hands back a PNG. What a card says
 * is decided next door in `mod.ts`; this only knows the two layouts:
 *
 *   home     the card-blue band of the home page: its title with a gold 「ひみつ」, and a tilted
 *            My Number Card.
 *   chapter  the page ground, a blue edge, the chapter's number in a circle, its question, and
 *            its icon on a white tile with the gold chip.
 *
 * `canvaskit-wasm` is Skia compiled to WebAssembly — the text stack a browser uses, minus the
 * browser. That matters for the part that is hard: a title is arbitrary length and the box is not,
 * so it has to be shaped, wrapped, and cut with an ellipsis at a line count. Skia's paragraph API
 * does that, and it does it with the same shaper the page itself will use.
 *
 * The palette is the site's light theme, copied from `client/static/app.css` — CSS custom
 * properties are resolved by a browser, and there is no browser here. The icons are the site's
 * own, from `client/ui/icons.tsx`, which keeps them as SVG path strings so they can be drawn here.
 *
 * The fonts come from `fonts/`, whatever is in it. Headings are set in Rounded M+ like the site's
 * M PLUS Rounded 1c, the rest in Inter and Noto Sans JP, and Skia falls back through them per
 * glyph. A character nothing covers is reported rather than silently drawn as a box; see `report`
 * and `fonts/README.md`.
 *
 * Nothing here touches the network or the clock, so a card is a pure function of its text: the same
 * page builds the same bytes on every machine, which is what keeps a rebuild from churning the
 * deployed artifact.
 */

import CanvasKitModule, {
  type Canvas,
  type CanvasKit,
  type CanvasKitInitOptions,
  type FontMgr,
  type Paragraph,
} from "canvaskit-wasm";

import {
  filledIcons,
  type IconName,
  iconPaths,
} from "../../client/ui/icons.tsx";

/**
 * The loader, given the type its own package documents.
 *
 * `canvaskit-wasm` ships CommonJS with ES-module type declarations, and Deno resolves the default
 * import to the module rather than to the function inside it. The declarations are right about
 * what that function takes and returns; only where it sits is wrong, so this restates it rather
 * than describing it again.
 */
const CanvasKitInit = CanvasKitModule as unknown as (
  options?: CanvasKitInitOptions,
) => Promise<CanvasKit>;

/** What every card says. */
interface CardBase {
  /** The page's title. A `\n` in it is a line break the card keeps. */
  title: string;
  /** A line or two under the title. Omitted when there is none. */
  description?: string;
  /** The words at the bottom left: the site's name, or what it is. */
  signature: string;
  /** The address at the bottom right — where the page lives. */
  footer: string;
}

/** The home page's card. */
export interface HomeCard extends CardBase {
  kind: "home";
  /** The small gold line above the title. */
  eyebrow: string;
  /** The part of the title drawn in gold. */
  highlight?: string;
}

/** A chapter's card. */
export interface ChapterCard extends CardBase {
  kind: "chapter";
  number: number;
  icon: IconName;
}

export type Card = HomeCard | ChapterCard;

/** The card's size. 1200×630 is what every social preview crops to. */
const WIDTH = 1200;
const HEIGHT = 630;

/** The site's light palette, from `client/static/app.css`. */
const color = {
  ground: "#f3f6fb",
  surface: "#ffffff",
  ink: "#142033",
  muted: "#4a5568",
  accent: "#1f5bd8",
  accentStrong: "#163f99",
  border: "#d9e1ec",
  line: "#c9d6ee",
  softBlue: "#e6edf8",
  gold: "#f2c14e",
  goldEdge: "#b98516",
} as const;

/** Skia, the fonts, and which families to ask for headings and for text. */
interface Kit {
  ck: CanvasKit;
  fonts: FontMgr;
  /** Rounded first: headings, numbers. */
  round: string[];
  /** Inter for Latin, Noto Sans JP for the rest. */
  plain: string[];
}

/** Where the fonts are: a directory, so adding one is dropping a file in. See `loadFonts`. */
const fontsDir = new URL("fonts/", import.meta.url);

/**
 * Skia, and the fonts to draw with — started once, on the first card.
 *
 * Lazy because `deno serve` should not pay for a WebAssembly runtime it may never use, and shared
 * because the build asks for one card per page and there is no reason to load Skia twice.
 */
let started: Promise<Kit>;

/**
 * Draws a card.
 *
 * @param card The words to put on it
 * @returns The PNG bytes, ready to serve
 */
export async function renderCard(card: Card): Promise<Uint8Array<ArrayBuffer>> {
  const kit = await (started ??= start());
  const { ck } = kit;

  const surface = ck.MakeSurface(WIDTH, HEIGHT);
  if (surface === null) {
    throw new Error("CanvasKit could not allocate a surface");
  }

  /** Characters no registered font had a glyph for. See `report`. */
  const missing = new Set<number>();
  const pen = new Pen(kit, surface.getCanvas(), missing);

  try {
    if (card.kind === "home") drawHome(pen, card);
    else drawChapter(pen, card);
    report(missing, card);

    const image = surface.makeImageSnapshot();
    try {
      const png = image.encodeToBytes(ck.ImageFormat.PNG, 100);
      if (png === null) {
        throw new Error("CanvasKit could not encode the card as a PNG");
      }
      // Re-wrapped rather than returned as it comes: the bytes arrive over an unspecified buffer,
      // and a response body has to be backed by a plain `ArrayBuffer`.
      return new Uint8Array(png);
    } finally {
      image.delete();
    }
  } finally {
    // WebAssembly memory is not the JavaScript heap, so nothing here is collected for us: a build
    // draws one card per page in one process, and leaking a surface each time would grow with the
    // site.
    pen.delete();
    surface.delete();
  }
}

/** The home page's card: the blue band, the title, a tilted card. */
function drawHome(pen: Pen, card: HomeCard): void {
  const { canvas } = pen;
  canvas.clear(pen.color(color.accent));

  // Two pale circles, the band's only texture.
  pen.circle(1190, 170, 310, "rgba(255,255,255,0.08)");
  pen.circle(970, 720, 180, "rgba(255,255,255,0.06)");

  const left = 80;
  const width = 620;

  pen.icon("card", left, 76, 34, color.gold, 2);
  pen.draw(
    pen.text(card.eyebrow, {
      size: 26,
      color: color.gold,
      bold: true,
      maxLines: 1,
    }),
    left + 46,
    76,
    width - 46,
  );

  const runs = card.highlight && card.title.includes(card.highlight)
    ? highlighted(card.title, card.highlight)
    : [{ text: card.title, color: color.surface }];
  const title = pen.text(runs, {
    size: 84,
    round: true,
    maxLines: 3,
    height: 1.15,
  });
  let top = pen.draw(title, left, 140, width) + 28;

  if (card.description) {
    top = pen.draw(
      pen.text(card.description, {
        size: 26,
        color: "rgba(255,255,255,0.88)",
        maxLines: 2,
        height: 1.6,
      }),
      left,
      top,
      width,
    );
  }

  drawCardArt(pen, 710, 150);

  drawFooter(pen, card, left, 80, "rgba(255,255,255,0.8)", false);
}

/** The My Number Card, simplified and tilted — the hero's picture. */
function drawCardArt(pen: Pen, x: number, y: number): void {
  const { canvas, ck } = pen;
  const w = 400;
  const h = 252;
  const shape = ck.RRectXY(ck.XYWHRect(x, y, w, h), 26, 26);

  canvas.save();
  canvas.rotate(-6, x + w / 2, y + h / 2);

  pen.shadow(shape, 30, 60, "rgba(10,20,50,0.35)");
  pen.rrect(shape, color.surface);

  canvas.save();
  canvas.clipRRect(shape, ck.ClipOp.Intersect, true);
  pen.rect(x, y, w, 46, color.accentStrong);
  canvas.restore();
  pen.draw(
    pen.text("個人番号カード", {
      size: 18,
      color: color.surface,
      round: true,
      maxLines: 1,
    }),
    x + 24,
    y + 10,
    300,
  );

  pen.rrect(
    ck.RRectXY(ck.XYWHRect(x + 30, y + 70, 170, 12), 6, 6),
    color.border,
  );
  pen.rrect(
    ck.RRectXY(ck.XYWHRect(x + 30, y + 92, 210, 12), 6, 6),
    color.border,
  );
  pen.chip(x + 30, y + 124, 78, 62);
  pen.rrect(
    ck.RRectXY(ck.XYWHRect(x + w - 30 - 94, y + 66, 94, 120), 12, 12),
    color.softBlue,
    color.line,
  );

  canvas.restore();
}

/** A chapter's card: the number, the question, the icon on a white tile. */
function drawChapter(pen: Pen, card: ChapterCard): void {
  const { canvas, ck } = pen;
  canvas.clear(pen.color(color.ground));
  pen.rect(0, 0, 24, HEIGHT, color.accent);

  const left = 96;
  const width = 1200 - left - 460;

  // The number in a circle, and 「だいNしょう」 beside it.
  pen.circle(left + 36, 72 + 36, 36, color.accent);
  const number = pen.text(String(card.number), {
    size: 40,
    color: color.surface,
    round: true,
    maxLines: 1,
    align: "center",
  });
  pen.lay(number, 72);
  pen.draw(number, left, 72 + 36 - number.getHeight() / 2, 72);
  const eyebrow = pen.text(`だい${card.number}しょう`, {
    size: 28,
    color: color.accent,
    round: true,
    maxLines: 1,
  });
  pen.lay(eyebrow, width);
  pen.draw(eyebrow, left + 88, 72 + 36 - eyebrow.getHeight() / 2, width - 88);

  // A long question drops a size rather than running into the description.
  let title = pen.text(card.title, {
    size: 68,
    color: color.ink,
    round: true,
    maxLines: 3,
    height: 1.25,
  });
  pen.lay(title, width);
  if (title.getLineMetrics().length > 2) {
    title = pen.text(card.title, {
      size: 56,
      color: color.ink,
      round: true,
      maxLines: 3,
      height: 1.25,
    });
  }
  const top = pen.draw(title, left, 170, width) + 24;

  if (card.description) {
    pen.draw(
      pen.text(card.description, {
        size: 25,
        color: color.muted,
        maxLines: 2,
        height: 1.6,
      }),
      left,
      top,
      width,
    );
  }

  // The icon on a white tile, with the gold chip in its corner.
  const tile = ck.RRectXY(ck.XYWHRect(780, 110, 340, 340), 40, 40);
  pen.shadow(tile, 24, 50, "rgba(20,32,51,0.12)");
  pen.rrect(tile, color.surface);
  pen.icon(card.icon, 780 + 70, 110 + 70, 200, color.accent, 1.6);
  pen.chip(1012, 358, 74, 58);

  drawFooter(pen, card, left, 80, color.muted, true);
}

/** The site's name at the bottom left and the page's address at the bottom right. */
function drawFooter(
  pen: Pen,
  card: Card,
  left: number,
  right: number,
  ink: string,
  strongSignature: boolean,
): void {
  const width = WIDTH - left - right;
  const signature = pen.text(card.signature, {
    size: 22,
    color: strongSignature ? color.ink : ink,
    round: strongSignature,
    maxLines: 1,
  });
  const address = pen.text(card.footer, {
    size: 22,
    color: ink,
    maxLines: 1,
    align: "right",
  });
  pen.lay(signature, width / 2);
  pen.lay(address, width / 2);
  const bottom = HEIGHT - 48;
  pen.draw(signature, left, bottom - signature.getHeight(), width / 2);
  pen.draw(address, left + width / 2, bottom - address.getHeight(), width / 2);
}

/** `text` as white runs, with the last `part` of it in gold. */
function highlighted(text: string, part: string): Run[] {
  const at = text.lastIndexOf(part);
  return [
    { text: text.slice(0, at), color: color.surface },
    { text: part, color: color.gold },
    { text: text.slice(at + part.length), color: color.surface },
  ];
}

/** One run of a paragraph, in its own colour. */
interface Run {
  text: string;
  color: string;
}

/** How a paragraph is drawn. */
interface TextStyle {
  size: number;
  /** The colour of a paragraph given as a plain string. */
  color?: string;
  /** Set in the rounded heading face. */
  round?: boolean;
  /** Bold in the plain face. */
  bold?: boolean;
  /** Lines past this are dropped and the last one ends in an ellipsis. */
  maxLines: number;
  /** Line height as a multiple of the font size. */
  height?: number;
  align?: "left" | "center" | "right";
}

/**
 * The drawing calls the two layouts share, over one canvas.
 *
 * Holds every paragraph and paint it hands out, so `delete()` frees the lot when the card is done.
 */
class Pen {
  readonly ck: CanvasKit;
  #kit: Kit;
  #missing: Set<number>;
  #owned: { delete(): void }[] = [];
  /** Paragraphs already laid out, and at what width. */
  #laid = new Map<Paragraph, number>();

  constructor(kit: Kit, readonly canvas: Canvas, missing: Set<number>) {
    this.ck = kit.ck;
    this.#kit = kit;
    this.#missing = missing;
  }

  color(value: string): Float32Array {
    return this.ck.parseColorString(value);
  }

  #paint(fill: string): ReturnType<CanvasKit["Paint"]["prototype"]["copy"]> {
    const paint = new this.ck.Paint();
    paint.setAntiAlias(true);
    paint.setColor(this.color(fill));
    this.#owned.push(paint);
    return paint;
  }

  rect(x: number, y: number, w: number, h: number, fill: string): void {
    this.canvas.drawRect(this.ck.XYWHRect(x, y, w, h), this.#paint(fill));
  }

  circle(cx: number, cy: number, r: number, fill: string): void {
    this.canvas.drawCircle(cx, cy, r, this.#paint(fill));
  }

  rrect(shape: Float32Array, fill: string, stroke?: string): void {
    this.canvas.drawRRect(shape, this.#paint(fill));
    if (stroke) {
      const edge = this.#paint(stroke);
      edge.setStyle(this.ck.PaintStyle.Stroke);
      edge.setStrokeWidth(3);
      this.canvas.drawRRect(shape, edge);
    }
  }

  /** A soft shadow under `shape`, dropped by `dy` and blurred by `blur`. */
  shadow(shape: Float32Array, dy: number, blur: number, fill: string): void {
    const paint = this.#paint(fill);
    const mask = this.ck.MaskFilter.MakeBlur(
      this.ck.BlurStyle.Normal,
      blur / 2,
      false,
    );
    paint.setMaskFilter(mask);
    this.#owned.push(mask);
    this.canvas.save();
    this.canvas.translate(0, dy);
    this.canvas.drawRRect(shape, paint);
    this.canvas.restore();
  }

  /** The gold chip, as the site draws it. */
  chip(x: number, y: number, w: number, h: number): void {
    this.rrect(
      this.ck.RRectXY(this.ck.XYWHRect(x, y, w, h), 12, 12),
      color.gold,
      color.goldEdge,
    );
  }

  /** One of the site's icons, `size` pixels square, with its top-left corner at (`x`, `y`). */
  icon(
    name: IconName,
    x: number,
    y: number,
    size: number,
    ink: string,
    strokeWidth: number,
  ): void {
    const paint = this.#paint(ink);
    if (filledIcons.has(name)) {
      paint.setStyle(this.ck.PaintStyle.Fill);
    } else {
      paint.setStyle(this.ck.PaintStyle.Stroke);
      paint.setStrokeWidth(strokeWidth);
      paint.setStrokeCap(this.ck.StrokeCap.Round);
      paint.setStrokeJoin(this.ck.StrokeJoin.Round);
    }
    this.canvas.save();
    this.canvas.translate(x, y);
    this.canvas.scale(size / 24, size / 24);
    for (const d of iconPaths[name]) {
      const path = this.ck.Path.MakeFromSVGString(d);
      if (path === null) throw new Error(`og: icon ${name} has a bad path`);
      this.canvas.drawPath(path, paint);
      path.delete();
    }
    this.canvas.restore();
  }

  /** A paragraph, shaped but not yet laid out. */
  text(content: string | Run[], style: TextStyle): Paragraph {
    const { ck } = this;
    const families = style.round ? this.#kit.round : this.#kit.plain;
    const weight = style.round
      ? ck.FontWeight.ExtraBold
      : style.bold
      ? ck.FontWeight.Bold
      : ck.FontWeight.Normal;
    const runs = typeof content === "string"
      ? [{ text: content, color: style.color ?? color.ink }]
      : content;

    const textStyle = (ink: string) => ({
      color: this.color(ink),
      fontFamilies: families,
      fontSize: style.size,
      fontStyle: { weight },
      heightMultiplier: style.height,
    });

    const builder = ck.ParagraphBuilder.Make(
      new ck.ParagraphStyle({
        textStyle: textStyle(runs[0]?.color ?? color.ink),
        textAlign: style.align === "center"
          ? ck.TextAlign.Center
          : style.align === "right"
          ? ck.TextAlign.Right
          : ck.TextAlign.Left,
        maxLines: style.maxLines,
        ellipsis: "…",
      }),
      this.#kit.fonts,
    );
    try {
      for (const run of runs) {
        if (run.text === "") continue;
        builder.pushStyle(new ck.TextStyle(textStyle(run.color)));
        builder.addText(run.text);
        builder.pop();
      }
      const paragraph = builder.build();
      this.#owned.push(paragraph);
      return paragraph;
    } finally {
      builder.delete();
    }
  }

  /** Lays a paragraph out to `width`, which is when Skia resolves its glyphs. */
  lay(paragraph: Paragraph, width: number): Paragraph {
    if (this.#laid.get(paragraph) !== width) {
      paragraph.layout(width);
      this.#laid.set(paragraph, width);
      paragraph.unresolvedCodepoints().forEach((code) =>
        this.#missing.add(code)
      );
    }
    return paragraph;
  }

  /** Lays a paragraph out and draws it, returning the y just below it. */
  draw(paragraph: Paragraph, x: number, y: number, width: number): number {
    this.lay(paragraph, width);
    this.canvas.drawParagraph(paragraph, x, y);
    return y + paragraph.getHeight();
  }

  delete(): void {
    this.#owned.forEach((thing) => thing.delete());
    this.#owned = [];
  }
}

/**
 * Says which characters had no glyph, once per card.
 *
 * A character no registered font covers is drawn as whatever the font's `.notdef` is — a box in
 * some, nothing at all in others, which is how a name can quietly lose a letter. Either way it is
 * visible only to someone looking at the card, and nobody looks at a card; that is the point of
 * one. So the build says it out loud instead. It is a warning rather than an error because one
 * missing character is not a reason to fail a deploy, and because the fix is a font file rather
 * than a code change: `fonts/README.md` says which set is covered and how to widen it.
 *
 * @param missing The code points Skia could not resolve
 * @param card The card they were on, for naming it
 */
function report(missing: Set<number>, card: Card): void {
  if (missing.size === 0) return;

  const characters = [...missing].map((code) => String.fromCodePoint(code))
    .join(" ");
  console.warn(
    `og: no glyph for ${characters} in ${card.footer} — see server/og/fonts/README.md`,
  );
}

/** Starts Skia and registers the fonts. */
async function start(): Promise<Kit> {
  const ck = await CanvasKitInit();
  const files = await loadFonts();

  const fonts = ck.FontMgr.FromData(...files);
  if (fonts === null) throw new Error(`No usable font in ${fontsDir}`);

  const families = Array.from(
    { length: fonts.countFamilies() },
    (_, i) => fonts.getFamilyName(i),
  );
  const isRound = (family: string) => /m\+|mplus|m plus/i.test(family);
  const plain = families.filter((family) => !isRound(family));

  return { ck, fonts, round: [...families.filter(isRound), ...plain], plain };
}

/**
 * Every font in `fonts/`, in name order.
 *
 * A directory rather than a list, for the same reason the islands are globbed: a font file being
 * there is the decision, and naming it again here would only be a second place to keep it.
 *
 * Skia falls back per glyph through the families in the order they are registered, so the names
 * decide which font draws a character two of them have: Inter sorts first and keeps the Latin,
 * Noto Sans JP follows and answers for the Japanese. Covering another script is dropping a file in
 * here, and `report` names the characters that nothing covered yet. See `fonts/README.md`.
 *
 * @returns The font files, sorted by name
 */
async function loadFonts(): Promise<ArrayBuffer[]> {
  const names: string[] = [];
  for await (const entry of Deno.readDir(fontsDir)) {
    if (entry.isFile && /\.(?:ttf|otf)$/i.test(entry.name)) {
      names.push(entry.name);
    }
  }
  names.sort();

  if (names.length === 0) throw new Error(`No font files in ${fontsDir}`);

  return await Promise.all(names.map(async (name) => {
    // Skia takes the buffer rather than a view over it, and a view need not cover the whole of
    // one — so the bytes are copied into a buffer that is exactly the font and nothing else.
    const bytes = await Deno.readFile(new URL(name, fontsDir));
    return bytes.slice().buffer;
  }));
}
