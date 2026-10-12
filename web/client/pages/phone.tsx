import { css, type Handle } from "@remix-run/component";

import { PhoneSetup } from "../islands/phone_setup.tsx";
import { ShowOnly } from "../islands/show_only.tsx";
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
import { Icon } from "../ui/icons.tsx";
import { color, font, radius } from "../tokens.ts";

export const title =
  `スマホにマイナンバーカードが入るって、どういうこと？ — ${SITE_NAME}`;
export const description =
  "スマホのマイナンバーカード機能は、カードのコピーではありません。スマホの中の金庫に、スマホ用のカギと電子証明書を作るしくみを、動く図で説明します。";

export const hydrate = true;

export default function PhonePage(_handle: Handle) {
  return () => (
    <>
      <ChapterHead chapter="phone">
        <p>
          今は、スマホにマイナンバーカードの機能を入れられるよ。iPhoneでは2025年から。Androidでは2023年から一部の機能が使えていて、2026年10月20日（予定）からは「Androidのマイナンバーカード」として、できることが増えるんだ。でも、カードがスマホの中に「すいこまれる」わけじゃない。どうなっているのかな？
        </p>
      </ChapterHead>

      <Analogy>
        <p>
          家のカギをなくさないように、<strong>
            合いカギ
          </strong>を作るのに少し似ているよ。ただし、カードのカギを型どりしてコピーするんじゃない。スマホの中の金庫で<strong>
            まったく新しいカギ
          </strong>を作って、「この新しいカギも本人のものです」と、カードを使って国に認めてもらうんだ。
        </p>
      </Analogy>

      <Stage label="動かしてみよう：スマホに入れるまで">
        <PhoneSetup />
      </Stage>

      <h2>スマホの「金庫」ってなに？</h2>
      <p>
        スマホの中には、ふつうのアプリとは別に、<strong>
          セキュアエレメント
        </strong>という小さなチップがあるよ。おサイフケータイやタッチ決済でも使われている、マイナンバーカードのチップと同じように「いじられても負けない」金庫なんだ。スマホ用のひみつのカギは、この金庫の中だけにある。だから、マイナンバーカードを入れられるのは、決められた強さの金庫を持っているスマホだけなんだ。
      </p>

      <h2>スマホのマイナンバーカードでできる2つのこと</h2>
      <div mix={usesStyle}>
        <div mix={useCardStyle}>
          <span mix={useIconStyle}>
            <Icon name="globe" size={26} />
          </span>
          <p mix={useTitleStyle}>ネットで使う</p>
          <p>
            マイナポータルへのログインや、ネットでの申しこみ、コンビニで住民票を取るときなど。これまでの章で見てきた「ひみつのカギ」と「電子証明書」を使うよ。
          </p>
          <p mix={useRealStyle}>本当の名前：電子証明書機能</p>
        </div>
        <div mix={useCardStyle}>
          <span mix={useIconStyle}>
            <Icon name="user" size={26} />
          </span>
          <p mix={useTitleStyle}>目の前の人に見せる</p>
          <p>
            お店や窓口で「本人です」「20さい以上です」「この町に住んでいます」と確かめてもらうとき。お店の人は、デジタル庁の<strong>
              「マイナンバーカード対面確認アプリ」
            </strong>でスマホを読み取るよ。
          </p>
          <p mix={useRealStyle}>本当の名前：属性証明機能</p>
        </div>
      </div>
      <p>
        iPhoneのマイナンバーカードは、2025年から両方ができる。Androidは、2026年10月20日（予定）から「Androidのマイナンバーカード」になって、Googleウォレットに入れて使えるようになり、「目の前の人に見せる」こともできるようになるよ。
      </p>

      <h2>見せたいことだけ、見せられる</h2>
      <p>
        {"お店でお酒を買うとき、お店が知りたいのは「20さい以上かどうか」だけだよね。でもカードを見せると、名前も住所も生年月日も、表に書いてあることが全部見えてしまう。スマホのマイナンバーカードなら、"}
        <strong>聞かれたことだけ</strong>
        {"を送れるんだ。しかも、お店はそれが本物かどうか確かめられる。"}
      </p>

      <Stage label="動かしてみよう：見せたいことだけ見せる">
        <ShowOnly />
      </Stage>

      <p>
        {"どうして1行だけでも本物だとわかるのかな？ スマホの中のデータには、J-LISが作った「1行ずつのしるしのリスト」が入っていて、リストにはJ-LISの電子署名がついている。お店は、とどいた1行がそのリストと合うかを確かめるんだ。とどかなかった行は、お店には何もわからないよ。"}
      </p>

      <h2>カードはもういらないの？</h2>
      <p>
        {"スマホだけで使える場面は増えているけれど、まだカードしか使えない場面もあるよ。デジタル庁も「カードも持ち歩いてね」と呼びかけている。"}
      </p>
      <p>
        {"たとえば、救急車で運ばれるとき。救急隊は、マイナンバーカードで、その人がどんな病気で病院にかかったかなどを確かめられる（マイナ救急）。スマホでもできるようになったけれど、スマホは本人が顔や暗証番号で開かないと使えない。だから"}
        <strong>気をうしなっているときは、カードでないと使えない</strong>
        {"んだ。カードとスマホは、仲良く両方使うものなんだね。"}
      </p>

      <Summary>
        <p>
          スマホに入るのはカードのコピーではなく、スマホの金庫で作った「スマホ用のカギ」と、それを本人のものだと認めた「スマホ用の電子証明書」。なくしたら、スマホの分だけ止められる。
        </p>
      </Summary>

      <GrownUpNote>
        <ul>
          <li>
            Androidは2023年5月から「スマホ用電子証明書」（署名用・利用者証明用）を搭載でき、マイナポータル、オンライン申請、コンビニ交付などに使える。2026年10月20日（予定）に「Androidのマイナンバーカード」（Googleウォレット）へ刷新され、「属性証明機能」が加わる。リリース日は最終テストの結果で変わることがある。対応するのは一定の基準を満たすセキュリティチップを搭載した端末。
          </li>
          <li>
            iPhoneは2025年6月24日から、Appleウォレットに「iPhoneのマイナンバーカード」を追加できる（iOS
            18.5以降、iPhone XS以降）。
          </li>
          <li>
            属性証明機能により、官民の対面サービスで本人確認・年齢確認・住民確認などを受けられる。読み取る側は、デジタル庁が無償提供する「マイナンバーカード対面確認アプリ」で対応できる。
          </li>
          <li>
            スマートフォンのセキュアエレメント内で新たに鍵ペアを生成し、マイナンバーカードによる本人確認（署名用電子証明書）を経て、J-LISがスマホ用の署名用・利用者証明用電子証明書を発行する。カードの秘密鍵をコピーするわけではない。
          </li>
          <li>
            iPhoneでは暗証番号の代わりにFace ID / Touch
            IDで利用できる。追加には、マイナポータルアプリ、カード本体、券面事項入力補助用暗証番号（4けた）、署名用パスワードが必要。
          </li>
          <li>
            紛失時は、スマホ用電子証明書だけを一時停止・失効できる（マイナンバー総合フリーダイヤル等）。
          </li>
          <li>
            {"スマートフォンに載る機能は法令上2種類ある。公的個人認証法に基づく「スマホ用電子証明書」（署名用・利用者証明用）と、番号法第2条第8項の「カード代替電磁的記録」（券面相当の氏名・住所・生年月日・性別・顔写真・個人番号と、その真正性を示すデータ）である。属性証明機能は後者による。"}
          </li>
          <li>
            {"カード代替電磁的記録のデータ形式はISO/IEC 18013-5（mdoc）に準拠する。J-LISのDocument Signerが署名したMobile Security Object（MSO）に、各データ項目のハッシュ値（項目ごとに乱数を加えて計算）が載る。提示時は開示する項目とその乱数だけを渡し、検証者はハッシュをMSOと照合する（選択的開示）。署名鍵・端末鍵はECDSA P-256で、MSOは30日で自動更新される。"}
          </li>
          <li>
            {"送信側（Appleウォレット等）と確認側（デジタル庁の対面確認アプリ、AppleのID Verifier等）のプログラムは、それぞれ番号法に基づく大臣認定の対象である。"}
          </li>
          <li>
            {"利用状況：iPhoneのマイナンバーカードは開始3か月で約251万件、Androidのスマホ用電子証明書は約2年4か月で約33〜34万件（デジタル庁「マイナンバーカードの機能のスマートフォン搭載に関する検討会」第7回資料）。"}
          </li>
          <li>
            {"本人確認の法令も、ICチップの読み取りやカード代替電磁的記録の受け取りを原則とする方向にある。携帯電話不正利用防止法の省令改正（2026年4月1日施行）で、非対面の券面画像送信による方法は廃止された。改正犯罪収益移転防止法（2027年4月1日施行）では、非対面はJPKI・ICチップ情報＋容貌画像・カード代替電磁的記録に一本化され、対面でもICチップの読み取り等が必要になる。"}
          </li>
          <li>
            {"マイナ救急は2026年4月からスマートフォンのマイナ保険証にも対応したが、傷病者本人による生体認証（iPhone）または暗証番号の入力（Android）が必要なため、意識不明時はカードでのみ実施できる（消防庁）。"}
          </li>
        </ul>
      </GrownUpNote>

      <Sources
        items={[
          {
            href: "https://services.digital.go.jp/mynumbercard-iphone/",
            label: "デジタル庁：iPhoneのマイナンバーカード",
          },
          {
            href: "https://services.digital.go.jp/mynumbercard-android/",
            label: "デジタル庁：Androidのマイナンバーカード",
          },
          {
            href:
              "https://services.digital.go.jp/mynumbercard-android/news/fec690c52f9ffeb35d30f/",
            label:
              "デジタル庁：2026年10月20日から「Androidのマイナンバーカード」を開始予定です",
          },
          {
            href: "https://myna.go.jp/",
            label: "マイナポータル",
          },
          {
            href:
              "https://www.fdma.go.jp/publication/ugoki/items/rei_0803_21.pdf",
            label: "消防庁：マイナ救急（「消防の動き」2026年3月号）",
          },
          {
            href: "https://zenn.dev/trustdock/articles/54ab2b9c6bdd56",
            label:
              "TRUSTDOCK：マイナンバーカードのスマホ搭載と国際標準（mdoc / ISO 18013-5）",
          },
        ]}
      />

      <ChapterNav chapter="phone" />
    </>
  );
}

const usesStyle = css({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))",
  gap: "0.75rem",
});

const useCardStyle = css({
  padding: "1.125rem",
  borderRadius: radius.lg,
  background: color.surface,
  "& p": { marginBlock: "0.4rem" },
});

const useIconStyle = css({ display: "inline-flex", color: color.accent });

const useTitleStyle = css({
  fontFamily: font.round,
  fontWeight: 800,
  fontSize: "1.1rem",
});

const useRealStyle = css({
  color: color.muted,
  fontSize: "0.85rem !important",
});
