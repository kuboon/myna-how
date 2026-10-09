import { css, type Handle } from "@remix-run/component";

import { ChipOrMemo } from "../islands/chip_or_memo.tsx";

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
import { art, radius } from "../tokens.ts";

export const title = `IC チップには何ができる？ — ${SITE_NAME}`;
export const description =
  "マイナンバーカードの IC チップは、メモ帳ではなく小さなコンピューター。できること・できないこと・そのしくみを、動く図で説明します。";

export const hydrate = true;

export default function Inside(_handle: Handle) {
  return () => (
    <>
      <ChapterHead chapter="inside">
        <p>
          マイナンバーカードには、金色の小さな四角がついているね。これは<strong>
            IC チップ
          </strong>。ただの「メモ帳」じゃなくて、自分で考えて計算できる<strong>
            小さなコンピューター
          </strong>なんだ。
        </p>
      </ChapterHead>

      <h2>メモ帳じゃなくて、コンピューター</h2>
      <p>
        もしチップが、書いたことをしまっておくだけの<strong>
          メモ帳
        </strong>だったら、読みとり機をあてた人に、中身をそのまま読まれてしまうよね。でも
        IC チップには、<strong>
          計算するところ
        </strong>があって、「だれに、何を、見せていいか」を自分で決めるんだ。
      </p>

      <Analogy>
        <p>
          メモ帳は、ページを開けばだれでも読める。IC チップは、<strong>
            金庫と、金庫番の係の人がセット
          </strong>になったもの。係の人は、たのまれたことを聞いて、合言葉が合っているか確かめて、いいときだけ仕事をするよ。
        </p>
      </Analogy>

      <Stage label="うごかしてみよう：メモ帳とチップに、たのみごと">
        <ChipOrMemo />
      </Stage>

      <h2>チップに「できること」</h2>
      <ul mix={[listStyle, canStyle]}>
        <li>
          <span aria-hidden="true">🔑</span>
          <span>
            <strong>
              カギを使う。
            </strong>中にしまってある「ひみつのカギ」を使って、「本人です」と証明するしるし（電子署名）を、チップの中で作る。
          </span>
        </li>
        <li>
          <span aria-hidden="true">🔢</span>
          <span>
            <strong>
              暗証番号を確かめる。
            </strong>合っているか自分で調べて、まちがえた回数も数えておく。
          </span>
        </li>
        <li>
          <span aria-hidden="true">🪪</span>
          <span>
            <strong>
              正しいかぎのときだけ見せる。
            </strong>名前や住所などは、決められた番号が合ったときだけ読みとらせる。
          </span>
        </li>
        <li>
          <span aria-hidden="true">🛡️</span>
          <span>
            <strong>
              自分の身を守る。
            </strong>こわされそうになると気づいて、中身を守る（次の章で見てみよう）。
          </span>
        </li>
      </ul>

      <h2>チップに「できないこと」「しないこと」</h2>
      <ul mix={[listStyle, cannotStyle]}>
        <li>
          <span aria-hidden="true">🔑</span>
          <span>
            <strong>
              ひみつのカギを外に出す。
            </strong>そういう命令は、はじめから用意されていない。
          </span>
        </li>
        <li>
          <span aria-hidden="true">🙈</span>
          <span>
            <strong>暗証番号なしで、大事な中身を見せる。</strong>
          </span>
        </li>
        <li>
          <span aria-hidden="true">📡</span>
          <span>
            <strong>
              自分から電波を出す、いる場所を知らせる。
            </strong>チップには電池がない。読みとり機やスマホにかざしたときだけ、その電波の力で動くんだ。
          </span>
        </li>
        <li>
          <span aria-hidden="true">🏥</span>
          <span>
            <strong>
              税金や病気、お金のきろくを持つ。
            </strong>そういう情報は入っていない。それぞれの役所などが別々に持っているよ。
          </span>
        </li>
      </ul>

      <h2>しくみ：チップの中をのぞいてみよう</h2>
      <p>
        では、どうしてこんなことができるのかな？ チップの中は、<strong>
          いくつもの部屋
        </strong>に分かれているよ。部屋ごとに、しまってあるものも、かぎの種類もちがう。ある部屋のかぎを持っていても、となりの部屋には入れないんだ。そして、部屋の出入りは、さっきの「係の人」（計算するところ）がぜんぶ見はっている。
      </p>

      <Stage label="うごかしてみよう：チップの中をのぞく">
        <InsideExplorer />
      </Stage>

      <h2>いちばん大事なのは「ひみつのカギ」</h2>
      <p>
        「ネットの実印」と「ログインの合いカギ」の部屋には、<strong>
          ひみつのカギ
        </strong>がしまってあるよ。このカギを持っていることが、カードの持ち主だという証拠になる。カギはチップの外に<strong>
          一度も出ない
        </strong>。カギを使う計算も、チップの中でするんだ。どうしてそれで本人だとわかるのかは、「本人確認」の章で見てみよう。
      </p>

      <Summary>
        <p>
          IC
          チップはメモ帳ではなく、小さなコンピューター。ひみつのカギを外に出さずに中で使い、暗証番号が合ったときだけ中身を見せる。税金や病気のきろくは入っていない。
        </p>
      </Summary>

      <GrownUpNote>
        <ul>
          <li>
            マイナンバーカードの IC
            チップは、CPU・メモリ・暗号演算用の回路をもつ「スマートカード」。外部とは非接触（ISO/IEC
            14443 Type
            B）でやりとりし、電源は読み取り機からの電磁誘導で得る（電池は持たない）。
          </li>
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

const listStyle = css({
  display: "grid",
  gap: "0.5rem",
  padding: 0,
  listStyle: "none",
  "& li": {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.6rem",
    margin: 0,
    padding: "0.7rem 0.9rem",
    borderRadius: radius.md,
    lineHeight: 1.8,
  },
  "& li > span:first-child": { fontSize: "1.5rem", lineHeight: 1.3 },
});

const canStyle = css({ "& li": { background: art.softGreen } });
const cannotStyle = css({ "& li": { background: art.softRed } });
