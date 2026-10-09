/**
 * Splits Japanese text into plain runs and kanji with their readings, from the word list in
 * `words.ts`.
 *
 * Every kanji on the site gets a reading above it (`<ruby>`), and this is the one place that
 * decides which. It is a plain longest-match over a hand-written list rather than a dictionary
 * lookup, because the list is small, a reading is right or wrong in context, and the same code
 * has to run on the server and in the browser and give the same answer.
 *
 * A kanji the list does not cover is left as it is; `web/server/text_rules.test.ts` fails on it.
 */

import { words } from "./words.ts";

/** A run of text: plain, or kanji with the reading to set above it. */
export type Token = string | { base: string; reading: string };

/** One entry of the word list: what it matches, and how to set it. */
interface Entry {
  surface: string;
  tokens: Token[];
}

/**
 * Parses one line of the word list.
 *
 * `電子{でんし}署名{しょめい}` is two kanji runs with their readings; text outside braces —
 * okurigana, or kana that pins a reading down — is matched but set plain: `動{うご}く`.
 *
 * @param line One entry
 * @returns The entry
 */
export function parseEntry(line: string): Entry {
  const tokens: Token[] = [];
  let surface = "";
  for (const m of line.matchAll(/([^{}]+?)\{([^{}]+)\}|([^{}]+)/gu)) {
    if (m[3] !== undefined) {
      tokens.push(m[3]);
      surface += m[3];
    } else {
      // Kana before the kanji in the same group stays plain: `お金{かね}`. Digits stay with
      // the kanji, so a date reads as one word: `20日{はつか}`.
      const [, lead, base] = m[1].match(/^([^\p{Script=Han}0-9]*)(.*)$/u)!;
      if (lead) tokens.push(lead);
      tokens.push({ base, reading: m[2] });
      surface += m[1];
    }
  }
  return { surface, tokens };
}

/** The entries, by first character, longest first. */
const index = new Map<string, Entry[]>();
for (const line of words.split("\n")) {
  const entry = line.trim();
  if (entry === "" || entry.startsWith("#")) continue;
  const parsed = parseEntry(entry);
  const first = parsed.surface[0];
  const list = index.get(first) ?? [];
  list.push(parsed);
  index.set(first, list);
}
for (const list of index.values()) {
  list.sort((a, b) => b.surface.length - a.surface.length);
}

const HAN = /\p{Script=Han}|々/u;

/** Whether the text has a kanji in it at all — the cheap test before the real work. */
export function hasKanji(text: string): boolean {
  return HAN.test(text);
}

/**
 * Text split into plain runs and kanji with readings.
 *
 * @param text Any text
 * @returns The runs, in order; adjacent plain text is merged
 */
export function rubify(text: string): Token[] {
  const out: Token[] = [];
  const push = (token: Token) => {
    const last = out[out.length - 1];
    if (typeof token === "string" && typeof last === "string") {
      out[out.length - 1] = last + token;
    } else {
      out.push(token);
    }
  };

  let i = 0;
  while (i < text.length) {
    const entry = index.get(text[i])?.find((e) =>
      text.startsWith(e.surface, i)
    );
    if (entry && HAN.test(entry.surface)) {
      entry.tokens.forEach(push);
      i += entry.surface.length;
    } else {
      push(text[i]);
      i += 1;
    }
  }
  return out;
}

/**
 * The kanji in `text` that no entry covered, with a little context each.
 *
 * @param text Any text
 * @returns One string per uncovered run of kanji
 */
export function uncovered(text: string): string[] {
  const missing: string[] = [];
  for (const token of rubify(text)) {
    if (typeof token !== "string") continue;
    for (const m of token.matchAll(/(?:\p{Script=Han}|々)+/gu)) {
      const at = m.index!;
      missing.push(
        token.slice(Math.max(0, at - 3), at + m[0].length + 3),
      );
    }
  }
  return missing;
}
