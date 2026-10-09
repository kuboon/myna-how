import type { Handle } from "@remix-run/component";

import { AuthFlow } from "../islands/auth_flow.tsx";
import {
  ChapterHead,
  ChapterNav,
  GrownUpNote,
  Sources,
  Stage,
  Summary,
} from "../parts.tsx";
import { SITE_NAME } from "../layout.tsx";

export const title = `どうやって「本人だ」とわかるの？ — ${SITE_NAME}`;
export const description =
  "マイナンバーカードでログインするとき、サイトはどうやって本人だと確かめるのか。ひみつのカギ（秘密鍵）・公開のカギ（公開鍵）・電子署名のしくみを、動く図で説明します。";

export const hydrate = true;

export default function Auth(_handle: Handle) {
  return () => (
    <>
      <ChapterHead chapter="auth">
        <p>
          ネットのむこうにいるサイトは、カードを手にとって見ることはできないよね。それなのに、どうして「このカードは本物で、使っているのは持ち主だ」とわかるんだろう？
        </p>
      </ChapterHead>

      <h2>登場するもの</h2>
      <ul>
        <li>
          <strong>
            ひみつのカギ（秘密鍵）
          </strong>……チップの中にしまってある。外には一度も出ない。
        </li>
        <li>
          <strong>
            公開のカギ（公開鍵）
          </strong>……ひみつのカギとペアで作られる。みんなに見せてもだいじょうぶ。
        </li>
        <li>
          <strong>
            電子署名
          </strong>……ひみつのカギを使ってつける「しるし」。そのカードのひみつのカギでしか作れない。公開のカギを使うと、本物かどうかたしかめられる。
        </li>
        <li>
          <strong>
            電子証明書
          </strong>……「この公開のカギは、たしかにこのカードのものです」と、国（J-LIS）が証明したもの。
        </li>
      </ul>

      <Stage label="うごかしてみよう：ログインのしくみ">
        <AuthFlow />
      </Stage>

      <h2>公開のカギから、ひみつのカギはわからないの？</h2>
      <p>
        わからないよ。公開のカギとひみつのカギはペアだけど、公開のカギからひみつのカギを見つけるのは、世界中のコンピューターを使っても、とても長い時間がかかるほどむずかしい。だから、公開のカギはみんなに見せても安心なんだ。
      </p>

      <h2>どうして毎回ちがう問題なの？</h2>
      <p>
        もし毎回同じ問題だったら、だれかが電子署名をこっそりのぞき見て、あとでそれを使い回せてしまうよね。毎回ちがう問題にすれば、<strong>
          まえの電子署名はもう役に立たない
        </strong>。上の図で「まえの電子署名を使い回す」をえらぶとわかるよ。
      </p>

      <Summary>
        <p>
          サイトは毎回ちがう問題を出す。チップはひみつのカギで電子署名をつけて返す。サイトは電子証明書の公開のカギで、その電子署名が本物かたしかめる。さらに、その電子証明書がまだ使えるかを
          J-LIS に確認する。
        </p>
      </Summary>

      <GrownUpNote>
        <ul>
          <li>
            公開鍵暗号を使った「チャレンジ・レスポンス認証」。サイトが毎回異なるチャレンジを送り、IC
            チップが秘密鍵で電子署名を生成し、サイトは電子証明書に含まれる公開鍵で署名を検証する。秘密鍵はチップの外に出ない。
          </li>
          <li>
            ログインに使うのは利用者証明用電子証明書（4
            けたの暗証番号）。氏名や住所は含まれない。
          </li>
          <li>
            電子証明書が失効していないか（紛失・死亡・転出などで失効していないか）を、地方公共団体情報システム機構（J-LIS）に確認する。この確認ができるのは、国が認めた事業者に限られる。
          </li>
          <li>
            毎回違うチャレンジを使うので、通信を盗み見て過去の署名を再利用する「リプレイ攻撃」が成り立たない。
          </li>
          <li>
            図に出てくる電子署名の文字列は見た目だけのもので、実際の署名ではない。
          </li>
        </ul>
      </GrownUpNote>

      <Sources
        items={[
          {
            href: "https://www.jpki.go.jp/",
            label: "公的個人認証サービス ポータルサイト（J-LIS）",
          },
          {
            href:
              "https://www.soumu.go.jp/kojinbango_card/kojinninshou-01.html",
            label: "総務省：公的個人認証サービスによる電子証明書",
          },
        ]}
      />

      <ChapterNav chapter="auth" />
    </>
  );
}
