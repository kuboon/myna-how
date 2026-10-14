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
  "マイナンバーカードのICチップが、こじ開けや当てずっぽうから中身を守るしくみ「耐タンパー性」を、動く図で説明します。";

export const hydrate = true;

export default function Tamper(_handle: Handle) {
  return () => (
    <>
      <ChapterHead chapter="tamper">
        <p>
          もし悪い人がカードを拾って、チップの中の「ひみつのカギ」をぬすもうとしたら？チップには、むりやりな手を使われても中身を守るしくみがあるよ。これを<strong>
            耐タンパー性
          </strong>というんだ。
        </p>
      </ChapterHead>

      <Analogy>
        <p>
          チップは、<strong>
            とてもかしこい金庫
          </strong>。こじ開けようとすると、中の大事なものを自分で使えなくしてしまう。番号をまちがえつづけると、とびらがロックされて開かなくなる。そして、中のカギは金庫の外に出さず、<strong>
            金庫の中でカギを使ってつけた電子署名だけ
          </strong>を返してくれるんだ。
        </p>
      </Analogy>

      <Stage label="動かしてみよう：チップにいたずらしてみる">
        <TamperLab />
      </Stage>

      <h2>「タンパー」ってなに？</h2>
      <p>
        英語の「tamper（タンパー）」は、「勝手にいじる・こっそり手を加える」という意味。「たい（耐）」は「たえる」。だから耐タンパー性は、<strong>
          いじられても負けない強さ
        </strong>のことだよ。
      </p>

      <h2>暗証番号が4けたでもだいじょうぶなの？</h2>
      <p>
        4けたの番号は0000から9999まで、<strong>
          1万通り
        </strong>あるよ。チップは3回まちがえるとロックされるから、当てずっぽうで当たるのは1万回に3回くらい。しかも、カードそのものを持っていないと試すこともできない。「カード」と「番号」の2つがそろわないと使えないから、安全なんだ。
      </p>

      <Summary>
        <p>
          チップは、こじ開けや電気のいたずらに気づいて中身を守る。ひみつのカギは外に出ない。暗証番号をまちがえすぎるとロックされる。
        </p>
      </Summary>

      <GrownUpNote>
        <ul>
          <li>
            耐タンパー性（tamper
            resistance）は、物理的な解析（チップの研磨・プロービング）や、電圧・クロック・光などで誤動作を誘う故障利用攻撃、消費電力などを測るサイドチャネル攻撃に対して、内部の秘密情報を守る性質。マイナンバーカードのICチップは、セキュリティ評価の国際基準（ISO/IEC
            15408）の認証を受けたものが使われている。
          </li>
          <li>
            秘密鍵は、カード発行時に市町村長（またはJ-LIS）の鍵ペア生成装置で作成され、暗号化してチップに送られ、チップ内で復号して記録される。記録後は、外部に取り出すコマンドは存在しない。署名演算はチップの中で行われ、外に出るのは署名値だけ。
          </li>
          <li>
            暗証番号の誤入力回数は、利用者証明用（4けた）が3回、署名用（6〜16文字）が5回でロック。解除・再設定は住所地の市区町村窓口で行う。
          </li>
        </ul>
      </GrownUpNote>

      <Sources
        items={[
          {
            href: "https://www.digital.go.jp/policies/mynumber_faq_03/",
            label: "デジタル庁：マイナンバーカードについてのよくある質問",
          },
          {
            href: "https://www.kojinbango-card.go.jp/",
            label: "マイナンバーカード総合サイト（J-LIS）",
          },
          {
            href:
              "https://www.digital.go.jp/assets/contents/node/basic_page/field_ref_resources/d12bde7e-a950-493b-987c-0f8d4bbd1b6b/fdc3a7cb/20260420_laws_notice_03.pdf",
            label:
              "総務省告示第706号：認証業務及びこれに附帯する業務の実施に関する技術的基準",
          },
        ]}
      />

      <ChapterNav chapter="tamper" />
    </>
  );
}
