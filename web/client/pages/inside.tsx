import type { Handle } from "@remix-run/component";

import { InsideExplorer } from "../islands/inside_explorer.tsx";
import {
  Analogy,
  ChapterHead,
  ChapterNav,
  GrownUpNote,
  Sources,
  Stage,
  Summary,
} from "../parts.tsx";
import { SITE_NAME } from "../layout.tsx";

export const title = `カードの中には何が入っている？ — ${SITE_NAME}`;
export const description =
  "マイナンバーカードの IC チップの中には、どんな部屋があって、何が入っていないのかを、動く図で説明します。";

export const hydrate = true;

export default function Inside(_handle: Handle) {
  return () => (
    <>
      <ChapterHead chapter="inside">
        <p>
          マイナンバーカードには、金色の小さな四角がついているね。これは
          <strong>IC チップ</strong>
          という、とても小さなコンピューター。この中には何が入っているのかな？
        </p>
      </ChapterHead>

      <Analogy>
        <p>
          IC チップは、<strong>いくつもの部屋がある小さな建物</strong>
          のようなもの。部屋ごとに、しまってあるものも、かぎの種類もちがうよ。ある部屋のかぎを持っていても、となりの部屋には入れないんだ。
        </p>
      </Analogy>

      <Stage label="うごかしてみよう：チップの中をのぞく">
        <InsideExplorer />
      </Stage>

      <h2>いちばん大事なのは「ひみつのカギ」</h2>
      <p>
        「ネットの実印」と「ログインの合いカギ」の部屋には、
        <strong>ひみつのカギ</strong>
        がしまってあるよ。このカギは、カードの持ち主だという証拠を作るためのもの。チップの外に出ることは<strong>
          一度もない
        </strong>んだ。どうしてそれで本人だとわかるのかは、「本人確認」の章で見てみよう。
      </p>

      <h2>入っていないものも大事</h2>
      <p>
        チップの中には、税金や病気のきろく、お金のことなどは
        <strong>入っていない</strong>
        よ。そういう情報は、それぞれの役所などが別々に持っている。だから、カードを落としても、カードからそういう情報がもれることはないんだ。
      </p>

      <Summary>
        <p>
          チップの中は部屋に分かれていて、「ひみつのカギ」や名前・住所などが入っている。税金や病気のきろくは入っていない。
        </p>
      </Summary>

      <GrownUpNote>
        <ul>
          <li>
            チップ内のアプリケーション（AP）として、公的個人認証（JPKI）AP
            に「署名用電子証明書」と「利用者証明用電子証明書」、ほかに「券面事項入力補助
            AP」「券面 AP」「住基 AP」と、自治体・民間が使える空き領域がある。
          </li>
          <li>
            署名用電子証明書には基本 4
            情報（氏名・住所・生年月日・性別）が記録される。利用者証明用電子証明書には基本
            4 情報は記録されない。
          </li>
          <li>
            暗証番号は、署名用が英数字 6〜16 文字（5
            回連続で誤るとロック）、利用者証明用・券面事項入力補助用が数字 4
            けた（3 回連続で誤るとロック）。 ロックは市区町村の窓口で解除する。
          </li>
          <li>
            税・年金・医療などの個人情報はチップに記録されず、各機関が分散して管理している。
          </li>
        </ul>
      </GrownUpNote>

      <Sources
        items={[
          {
            href: "https://www.digital.go.jp/policies/mynumber/faq-card",
            label: "デジタル庁：マイナンバーカードについてのよくある質問",
          },
          {
            href: "https://www.jpki.go.jp/",
            label: "公的個人認証サービス ポータルサイト（J-LIS）",
          },
        ]}
      />

      <ChapterNav chapter="inside" />
    </>
  );
}
