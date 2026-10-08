import type { Handle } from "@remix-run/component";

import { TamperLab } from "../islands/tamper_lab.tsx";
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

export const title =
  `むりやり開けようとすると、どうなる？（耐タンパー性） — ${SITE_NAME}`;
export const description =
  "マイナンバーカードの IC チップが、こじあけや当てずっぽうから中身を守るしくみ「耐タンパー性」を、動く図で説明します。";

export const hydrate = true;

export default function Tamper(_handle: Handle) {
  return () => (
    <>
      <ChapterHead chapter="tamper">
        <p>
          もしわるい人がカードを拾って、チップの中の「ひみつのカギ」をぬすもうとしたら？チップには、むりやりな手を使われても中身を守るしくみがあるよ。これを<strong>
            耐タンパー性
          </strong>（たいタンパーせい）というんだ。
        </p>
      </ChapterHead>

      <Analogy>
        <p>
          チップは、<strong>
            とてもかしこい金庫
          </strong>。こじあけようとすると、中の大事なものを自分で使えなくしてしまう。番号をまちがえつづけると、とびらがロックされて開かなくなる。そして、中のカギは金庫の外に出さず、
          <strong>金庫の中でハンコをおした結果だけ</strong>を返してくれるんだ。
        </p>
      </Analogy>

      <Stage label="うごかしてみよう：チップにいたずらしてみる">
        <TamperLab />
      </Stage>

      <h2>「タンパー」ってなに？</h2>
      <p>
        英語の「tamper（タンパー）」は、「勝手にいじる・こっそり手を加える」という意味。「耐（たい）」は「たえる」。だから耐タンパー性は、
        <strong>いじられても負けない強さ</strong>のことだよ。
      </p>

      <h2>暗証番号が 4 けたでも大丈夫なの？</h2>
      <p>
        4 けたの番号は 0000 から 9999 まで、<strong>
          1 万とおり
        </strong>あるよ。チップは 3
        回まちがえるとロックされるから、当てずっぽうで当たるのは 1 万回に 3
        回くらい。しかも、カードそのものを持っていないとためすこともできない。「カード」と「番号」の
        2 つがそろわないと使えないから、安全なんだ。
      </p>

      <Summary>
        <p>
          チップは、こじあけや電気のいたずらに気づいて中身を守る。ひみつのカギは外に出ない。暗証番号をまちがえすぎるとロックされる。
        </p>
      </Summary>

      <GrownUpNote>
        <ul>
          <li>
            耐タンパー性（tamper
            resistance）は、物理的な解析（チップの研磨・プロービング）や、電圧・クロック・光などで誤動作を誘う故障利用攻撃、消費電力などを測るサイドチャネル攻撃に対して、内部の秘密情報を守る性質。マイナンバーカードの
            IC チップは、セキュリティ評価の国際基準（ISO/IEC
            15408）の認証を受けたものが使われている。
          </li>
          <li>
            秘密鍵はチップ内で生成・保管され、外部に取り出すコマンドは存在しない。署名演算はチップの中で行われ、外に出るのは署名値だけ。
          </li>
          <li>
            暗証番号の誤入力回数は、利用者証明用（4 けた）が 3 回、署名用（6〜16
            文字）が 5 回でロック。解除・再設定は住所地の市区町村窓口で行う。
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
            href: "https://www.kojinbango-card.go.jp/",
            label: "マイナンバーカード総合サイト（J-LIS）",
          },
        ]}
      />

      <ChapterNav chapter="tamper" />
    </>
  );
}
