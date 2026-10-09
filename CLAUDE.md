# myna-how

マイナンバーカードのしくみを、動く図で、小学生にもわかる言葉で説明する静的サイト。
Remix v3 + Deno。サーバー API は持たず、GitHub Pages に静的サイトとして出す。
ページ構成と各章で伝えることは `docs/PLAN.md`。

## 構造

- `web/server/router.tsx`
  が唯一のエントリ。`deno task build`（`@remix-kbn/ssg`） が同じ router を
  `fetch()` でクロールして `web/dist` に静的 HTML を書き出す。 クロールは
  `entryPoints`（`/` と og 画像）とそこからのリンクだけを辿る。
- `web/client/` — ブラウザに渡るもの全て。`deno.ns` 無しで型チェックされる
  - `routes.ts` — URL の一覧。`chapters.ts` — 章の一覧（ヘッダーの目次・トップの
    もくじ・まえ/つぎ がここを読む）。章を足すときは両方と `router.tsx` に足す
  - `pages/` — 各章のページ（サーバーでだけ描画）。`parts.tsx` の部品
    （`ChapterHead` `Analogy` `Stage` `Summary` `GrownUpNote` `Sources`
    `ChapterNav`）で「問い → たとえ → 動く図 → ひとことで → おとな向けメモ」
    の順に組む
  - `islands/` — 動く図（`clientEntry`）。このディレクトリのファイルは全部
    bundle の entrypoint になるので、共有部品は `ui/` に置く
  - `ui/` — island どうしで共有する部品（`StepBar`、ボタンの style、SVG の絵、
    `icons.tsx` の線アイコン）
  - `static/app.css` — トークンの値と `@keyframes`（`css()` mixin は keyframes
    を宣言できないので、アニメーションはここに足す）
- `web/server/og/` — 各ページの SNS カード画像（ビルド時に生成）

## 書き方

- 読み手は小学生くらい。漢字は少なめ、専門用語は「やさしい言い方（ほんとうの名前）」。
  正確な名前・数字は「おとなの人向けメモ」（`GrownUpNote`）に書く
- 事実は公式資料（デジタル庁・J-LIS・総務省）に合わせ、ページ末尾の `Sources`
  に出典を載せる
- 絵文字は使わない。アイコンは `ui/icons.tsx` の `Icon`（OG
  画像も同じデータで描く）
- JSX のテキストを日本語の途中で改行しない（改行が空白になって表示される）
- island の初期描画はサーバーとブラウザで同じにする（乱数・時刻は操作後に使う）

## 環境変数

- `BASE_URL` — 静的ビルド専用。Pages のサブパス（PR プレビュー等）を `base`
  にする。og 画像の絶対 URL にも使う。

## 開発

```bash
deno task dev      # 開発サーバー起動
deno task build    # GitHub Pages 用の静的サイトを web/dist へ生成
deno task test     # ルーターのテスト
deno task test:browser  # ブラウザ smoke テスト (lightpanda)
deno task check    # 型チェック + lint + fmt
```

変更後は `deno task check && deno task test && deno task build` と
`deno task test:browser` を通す。

## コーディング規約

- Deno ファースト（Web API 優先、Node.js API は必要最小限）
- TypeScript strict mode
- テストは `Deno.test()` + `@std/assert`
- ファイル名はスネークケース（例: `auth_flow.tsx`）
- 見た目は `@remix-run/component` の `css()` mixin と `web/client/tokens.ts`
  のトークンで書く (Tailwind / daisyUI は使わない)
- ブラウザへ渡るコードは `web/client/` に置き、`Deno.` を参照しない
- 追加した `import` は `deno.json`（ルート）にだけ書く
