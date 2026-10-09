/**
 * The checks `docs/WRITING.md` promises: every kanji has a reading, only elementary-school kanji
 * outside the places official names may go, and no stray spaces between Latin and Japanese.
 *
 * They read the sources under `client/` rather than the rendered pages, because an island's
 * later steps — the captions after "すすむ" — are never in the server's HTML. One last test then
 * renders every page and makes sure no kanji reached it without a reading, which is what catches
 * text that bypassed the JSX runtime.
 */

import { assertEquals } from "@std/assert";

import { parseEntry, uncovered } from "../client/ruby/rubify.ts";
import { words } from "../client/ruby/words.ts";
import { chapterHref, chapters } from "../client/chapters.ts";
import { routes } from "../client/routes.ts";
import router from "./router.tsx";
import { kyoikuKanji } from "./text/kyoiku_kanji.ts";

/** Official names that may use kanji outside the elementary-school list anywhere on the site. */
const TERMS = [
  "秘密鍵",
  "公開鍵",
  "耐タンパー性",
  "耐タンパー",
  "搭載",
  "匿名",
];

const clientDir = new URL("../client/", import.meta.url);

/** A source file's text with its comments blanked out, line numbers kept. */
interface Source {
  path: string;
  lines: string[];
}

async function sources(): Promise<Source[]> {
  const out: Source[] = [];
  const walk = async (dir: URL, rel: string) => {
    for await (const entry of Deno.readDir(dir)) {
      const path = `${rel}${entry.name}`;
      if (entry.isDirectory) {
        if (path === "ruby") continue;
        await walk(new URL(`${entry.name}/`, dir), `${path}/`);
      } else if (/\.tsx?$/.test(entry.name) && path !== "jsx_runtime.ts") {
        const text = await Deno.readTextFile(new URL(entry.name, dir));
        out.push({ path, lines: stripComments(text).split("\n") });
      }
    }
  };
  await walk(clientDir, "");
  return out.sort((a, b) => a.path.localeCompare(b.path));
}

/** Comments replaced by blanks of the same shape, so line numbers still point at the source. */
function stripComments(text: string): string {
  const blank = (s: string) => s.replace(/[^\n]/g, " ");
  return text
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(
      /^(\s*)\/\/.*$/gm,
      (m, lead: string) => lead + blank(m.slice(lead.length)),
    );
}

/** The same lines with the places official names may go blanked out. */
function withoutTermZones(lines: string[]): string[] {
  const text = lines.join("\n")
    .replace(
      /<GrownUpNote>[\s\S]*?<\/GrownUpNote>/g,
      (m) => m.replace(/[^\n]/g, " "),
    )
    .replace(/<Sources[\s\S]*?\/>/g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/（[^（）\n]*）/g, (m) => m.replace(/[^\n]/g, " "));
  return TERMS.reduce(
    (t, term) => t.replaceAll(term, " ".repeat(term.length)),
    text,
  )
    .split("\n");
}

/** The list, plus the marks the Han script includes that are not kanji to learn. */
const kyoiku = new Set([...kyoikuKanji.join(""), "々", "〇"]);
const JA = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}ー]/u;

Deno.test("every kanji has a reading in the word list", async () => {
  const problems: string[] = [];
  for (const { path, lines } of await sources()) {
    lines.forEach((line, i) => {
      for (const run of uncovered(line)) {
        problems.push(`${path}:${i + 1} ${run}`);
      }
    });
  }
  assertEquals(problems, [], "add these to web/client/ruby/words.ts");
});

Deno.test("the word list gives each word one reading", () => {
  const seen = new Map<string, string>();
  const problems: string[] = [];
  for (const raw of words.split("\n")) {
    const line = raw.trim();
    if (line === "" || line.startsWith("#")) continue;
    const { surface } = parseEntry(line);
    const before = seen.get(surface);
    if (before !== undefined && before !== line) {
      problems.push(`${before} / ${line}`);
    }
    seen.set(surface, line);
  }
  assertEquals(problems, []);
});

Deno.test("only elementary-school kanji, outside official names", async () => {
  const problems: string[] = [];
  for (const { path, lines } of await sources()) {
    withoutTermZones(lines).forEach((line, i) => {
      for (const c of line.match(/\p{Script=Han}/gu) ?? []) {
        if (!kyoiku.has(c)) {
          problems.push(`${path}:${i + 1} ${c} — ${line.trim()}`);
        }
      }
    });
  }
  assertEquals(problems, [], "see docs/WRITING.md §1");
});

Deno.test("no space between Latin and Japanese, and no line break inside Japanese", async () => {
  const problems: string[] = [];
  for (const { path, lines } of await sources()) {
    lines.forEach((line, i) => {
      const at = `${path}:${i + 1}`;
      const spaced = line.match(
        /[A-Za-z0-9][ 　]+[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]|[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}][ 　]+[A-Za-z0-9]/u,
      );
      if (spaced) problems.push(`${at} space: ${spaced[0]}`);

      // JSX turns a line break between two words into a space.
      const next = lines[i + 1]?.trim() ?? "";
      const end = line.trimEnd().slice(-1);
      const word = (c: string) => JA.test(c) || /[A-Za-z0-9]/.test(c);
      if (
        end && next && word(end) && word(next[0]) &&
        (JA.test(end) || JA.test(next[0]))
      ) {
        problems.push(
          `${at} line break: …${line.trim().slice(-6)} / ${next.slice(0, 6)}…`,
        );
      }
    });
  }
  assertEquals(problems, [], "see docs/WRITING.md §5 and CLAUDE.md");
});

Deno.test("no kanji reaches a page without a reading", async () => {
  const hrefs = [
    routes.home.href(),
    ...chapters.map((c) => chapterHref(c.key)),
  ];
  const problems: string[] = [];
  for (const href of hrefs) {
    const html =
      await (await router.fetch(new Request(`http://localhost${href}`))).text();
    const body = html.slice(html.indexOf("<body"))
      .replace(/<script[\s\S]*?<\/script>/g, "")
      .replace(/<svg[\s\S]*?<\/svg>/g, "")
      .replace(/<ruby>[\s\S]*?<\/ruby>/g, "")
      .replace(/<[^>]+>/g, " ");
    for (const run of body.match(/(?:\p{Script=Han}|々)+/gu) ?? []) {
      problems.push(`${href} ${run}`);
    }
  }
  assertEquals(problems, []);
});
