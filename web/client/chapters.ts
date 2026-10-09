/**
 * The chapters, in reading order.
 *
 * The header's table of contents, the home page's cards and the "まえ / つぎ" links at the foot of
 * every chapter all read this list, so a chapter added here shows up in all three.
 */

import { routes } from "./routes.ts";
import type { IconName } from "./ui/icons.tsx";

export interface Chapter {
  /** The route's key in `routes`. */
  key: ChapterKey;
  /** Short label for the nav. */
  short: string;
  /** The chapter's question, as its heading. */
  title: string;
  /** One line for the home page's card. */
  lead: string;
  /** A picture for the card. */
  icon: IconName;
}

export type ChapterKey =
  | "inside"
  | "tamper"
  | "phone"
  | "auth"
  | "anonymous"
  | "digitalAuthApp";

export const chapters: readonly Chapter[] = [
  {
    key: "inside",
    short: "ICチップ",
    title: "ICチップには何ができる？",
    lead:
      "金色のICチップは、メモ帳じゃなくて小さなコンピューター。できること・できないことを見てみよう。",
    icon: "chip",
  },
  {
    key: "tamper",
    short: "こわすと守る",
    title: "むりやり開けようとすると、どうなる？",
    lead: "チップは「金庫」。こじあけようとすると、中身を守るしくみがあるよ。",
    icon: "shield",
  },
  {
    key: "phone",
    short: "スマホの中",
    title: "スマホにマイナンバーカードが入るって、どういうこと？",
    lead:
      "カードをコピーするんじゃない。スマホの金庫に「スマホ用のカギ」を作るんだ。",
    icon: "phone",
  },
  {
    key: "auth",
    short: "本人確認",
    title: "どうやって「本人だ」とわかるの？",
    lead:
      "毎回ちがう問題に、ひみつのカギで電子署名をつけてもらって、本物かどうか確かめるよ。",
    icon: "key",
  },
  {
    key: "anonymous",
    short: "名前を出さない",
    title: "名前を教えずに「本物の人」だと伝えられる？",
    lead: "お店ごとにちがう番号を使えば、名前を言わなくてもログインできる。",
    icon: "userOff",
  },
  {
    key: "digitalAuthApp",
    short: "デジタル認証アプリ",
    title: "デジタル庁の「デジタル認証アプリ」",
    lead:
      "いろいろなサイトが、マイナンバーカードでのログインを無料で使えるしくみ。",
    icon: "landmark",
  },
];

/** The href of a chapter's page. */
export function chapterHref(key: ChapterKey): string {
  return routes[key].href();
}

/** The chapter's position in the list, counting from 1. */
export function chapterNumber(key: ChapterKey): number {
  return chapters.findIndex((c) => c.key === key) + 1;
}

/** The chapter before and after this one, or `null` at either end. */
export function neighbours(
  key: ChapterKey,
): { prev: Chapter | null; next: Chapter | null } {
  const i = chapters.findIndex((c) => c.key === key);
  return {
    prev: i > 0 ? chapters[i - 1] : null,
    next: i < chapters.length - 1 ? chapters[i + 1] : null,
  };
}
