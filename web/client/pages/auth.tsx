import type { Handle } from "@remix-run/component";

import { AuthFlow } from "../islands/auth_flow.tsx";
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

export const title = `どうやって「本人だ」とわかるの？ — ${SITE_NAME}`;
export const description =
  "マイナンバーカードでログインするとき、サイトはどうやって本人だと確かめるのか。ひみつのカギと見本（公開鍵）を使うしくみを、動く図で説明します。";

export const hydrate = true;

export default function Auth(_handle: Handle) {
  return () => (
    <>
      <ChapterHead chapter="auth">
        <p>
          ネットのむこうにいるサイトは、カードを手にとって見ることはできないよね。それなのに、どうして「このカードは本物で、使っているのは持ち主だ」とわかるんだろう？
        </p>
      </ChapterHead>

      <Analogy>
        <p>
          持ち主だけが持っている<strong>とくべつなハンコ</strong>
          を思いうかべてみて。サイトは毎回ちがう紙を出して「ここにハンコをおして」とたのむ。サイトの手元には、<strong>
            ハンコの見本
          </strong>
          がある。見本ではハンコをおせないけれど、おされたハンコが本物かどうかは見くらべればわかる。
        </p>
        <p>
          そして、暗証番号は「ハンコを使うための合言葉」。カードと合言葉の両方がそろったときだけ、ハンコがおせるんだ。
        </p>
      </Analogy>

      <Stage label="うごかしてみよう：ログインのしくみ">
        <AuthFlow />
      </Stage>

      <h2>どうして毎回ちがう数字なの？</h2>
      <p>
        もし毎回同じ紙だったら、だれかがハンコをおした紙をこっそりのぞき見て、あとでそれを使い回せてしまうよね。毎回ちがう数字にすれば、
        <strong>
          まえのハンコはもう役に立たない
        </strong>。上の図で「まえのハンコを使い回す」をえらぶとわかるよ。
      </p>

      <h2>ひみつのカギと見本のカギ</h2>
      <p>
        ハンコをおすカギ（<strong>
          ひみつのカギ
        </strong>）と、確かめるためのカギ（
        <strong>見本のカギ</strong>
        ）は、ペアで作られる。見本のカギはみんなに見せてもよくて、証明書にのっている。でも、見本のカギから、ひみつのカギを作ることはできないんだ。
      </p>

      <Summary>
        <p>
          サイトが毎回ちがう数字を出し、チップがひみつのカギでハンコ（電子署名）をおす。サイトは見本（公開鍵）で確かめて、さらに「その証明書がまだ使えるか」を確認する。
        </p>
      </Summary>

      <GrownUpNote>
        <ul>
          <li>
            これは公開鍵暗号を使った「チャレンジ・レスポンス認証」。サイトが乱数（チャレンジ）を送り、IC
            チップが秘密鍵で電子署名を作り、サイトは電子証明書に含まれる公開鍵で署名を検証する。
          </li>
          <li>
            ログインに使うのは利用者証明用電子証明書（4
            けたの暗証番号）。氏名や住所は含まれない。
          </li>
          <li>
            電子証明書が失効していないか（紛失・死亡・転出などで失効していないか）を、地方公共団体情報システム機構（J-LIS）に確認する。この確認ができるのは、国が認めた事業者に限られる。
          </li>
          <li>
            毎回違う乱数を使うので、通信を盗み見て署名を再利用する「リプレイ攻撃」が成り立たない。
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
