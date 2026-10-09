import type { Handle } from "@remix-run/component";

import { PairwiseDemo } from "../islands/pairwise_demo.tsx";
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
  `名前を教えずに「本物の人」だと伝えられる？ — ${SITE_NAME}`;
export const description =
  "マイナンバーカードを使っても、名前や住所を教えずにログインできるしくみ。サイトごとにちがう番号を使う「匿名（仮名）の認証」を、動く図で説明します。";

export const hydrate = true;

export default function Anonymous(_handle: Handle) {
  return () => (
    <>
      <ChapterHead chapter="anonymous">
        <p>
          「マイナカードでログインしたら、名前も住所もぜんぶサイトに知られちゃうの？」……じつは、そうとはかぎらないんだ。
        </p>
      </ChapterHead>

      <Analogy>
        <p>
          コンサートの入り口で、<strong>名前の書いていないリストバンド</strong>
          をもらうのを思いうかべてみて。係の人は「ちゃんとチケットを買った人だ」とわかるけど、名前は知らない。しかも、行くイベントごとに<strong>
            ちがう色・ちがう番号
          </strong>
          のリストバンドなら、イベントどうしで「あの人、こっちにも来てたね」と話し合うこともできないよね。
        </p>
      </Analogy>

      <Stage label="うごかしてみよう：サイトには何が伝わる？">
        <PairwiseDemo />
      </Stage>

      <h2>ログイン用の証明書には、名前がない</h2>
      <p>
        「カードの中身」の章で見た、<strong>ログインの合いカギ</strong>
        （利用者証明用の電子証明書）には、名前も住所も書いていないよ。だから、これでログインするだけなら、サイトにわかるのは
        「<strong>
          本物のカードを持った、本物の人が来た
        </strong>」ということだけ。
      </p>

      <h2>サイトごとに番号を変える</h2>
      <p>
        でも、どのサイトにも同じ番号を見せていたら、サイトどうしが情報を見せ合うと「同じ人だ」とわかってしまう（上の図の
        ②）。そこで、デジタル庁の<strong>デジタル認証アプリ</strong>では、
        <strong>サイトごとにちがう番号</strong>
        を渡すようにしているんだ（上の図の③）。サイトは「また来た人だ」とはわかるけど、ほかのサイトの番号とは結びつけられない。
      </p>

      <h2>名前を教えるのは「いいよ」と言ったときだけ</h2>
      <p>
        お酒を買うときの年れい確認や、銀行の口座を作るときのように、名前や生年月日が本当に必要なこともあるよね。そういうときは、画面に「このサイトに名前などを教えてもいいですか？」と出て、
        <strong>自分で OK したときだけ</strong>伝わるようになっているよ。
      </p>

      <Summary>
        <p>
          ログイン用の証明書には名前がない。さらにサイトごとにちがう番号を使えば、名前を教えずに「本物の人」だと伝えられて、サイトどうしで結びつけられることもない。
        </p>
      </Summary>

      <GrownUpNote>
        <ul>
          <li>
            利用者証明用電子証明書には基本 4
            情報が含まれない。ただし証明書のシリアル番号（発行番号）は証明書ごとに一意なので、そのまま複数事業者に渡ると名寄せの手がかりになりうる（完全な匿名ではなく「仮名」）。
          </li>
          <li>
            デジタル認証アプリの認証 API（OpenID
            Connect）は、利用者識別子（sub）を
            <strong>pairwise</strong>
            （事業者ごとに異なる値）で発行する。シリアル番号自体は事業者に渡らない。
          </li>
          <li>
            基本 4
            情報（氏名・住所・生年月日・性別）などは、事業者がスコープで要求し、利用者が同意した場合にだけ連携される。
          </li>
        </ul>
      </GrownUpNote>

      <Sources
        items={[
          {
            href:
              "https://developers.digital.go.jp/documents/auth-and-sign/authserver/",
            label:
              "デジタル庁：デジタル認証アプリ API リファレンス（民間事業者向け）",
          },
          {
            href: "https://services.digital.go.jp/auth-and-sign/",
            label: "デジタル庁：デジタル認証アプリ",
          },
        ]}
      />

      <ChapterNav chapter="anonymous" />
    </>
  );
}
