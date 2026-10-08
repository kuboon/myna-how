# web/tests — ブラウザ smoke

opt-in のブラウザテスト。デフォルトの `deno task test`
には含まれず、`deno task test:browser` で明示的に起動する。 lightpanda
バイナリは npm:@lightpanda/browser の postinstall script でビルドされる。

## 前提

- ルーターは起動時に `Deno.bundle` で client を bundle する
  (`web/server/assets.ts`) ので、事前のビルド手順は不要。

## 実行

```bash
deno task test:browser    # root から
```

## カバー範囲

- `browser_islands.test.ts`
  - `/inside` — hydrate
    後に「チップの中を見る」を押すと、部屋のとびらが出て、「入っていないもの」のパネルが開くこと。
  - `/tamper` — 暗証番号パッドで 3 回まちがえると、チップが `locked`
    になること。
