# myna-how — マイナンバーカードのひみつ

マイナンバーカードのしくみを、**動く図**で、**小学生にもわかる言葉**で説明する
静的サイト。

- カードの中には何が入っている？
- むりやり開けようとすると、どうなる？（耐タンパー性）
- スマホにマイナカードが入るって、どういうこと？
- どうやって「本人だ」とわかるの？
- 名前を教えずに「本物の人」だと伝えられる？（匿名・仮名の認証）
- デジタル庁の「デジタル認証アプリ」

サイトの構成は [docs/PLAN.md](./docs/PLAN.md)、開発のルールは
[CLAUDE.md](./CLAUDE.md) を参照。

## 開発

```bash
deno task dev           # 開発サーバー (http://localhost:8000)
deno task build         # GitHub Pages 用の静的サイトを web/dist へ生成
deno task test          # ルーターのテスト
deno task test:browser  # ブラウザ smoke テスト (lightpanda)
deno task check         # 型チェック + lint + fmt
```

Remix v3 + Deno の [deno-remix-tmpl](https://github.com/kuboon/deno-remix-tmpl)
から作成。
