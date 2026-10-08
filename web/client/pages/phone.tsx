import { css, type Handle } from "@remix-run/component";

import { PhoneSetup } from "../islands/phone_setup.tsx";
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
import { art, color, radius } from "../tokens.ts";

export const title =
  `スマホにマイナカードが入るって、どういうこと？ — ${SITE_NAME}`;
export const description =
  "スマホのマイナンバーカード機能は、カードのコピーではありません。スマホの中の金庫に、スマホ用のカギと証明書を作るしくみを、動く図で説明します。";

export const hydrate = true;

export default function PhonePage(_handle: Handle) {
  return () => (
    <>
      <ChapterHead chapter="phone">
        <p>
          いまは、スマホにマイナンバーカードの機能を入れられるよ。iPhone では
          2025 年から。Android では 2023 年から一部の機能が使えていて、2026 年
          10 月 20 日（予定）からは「Android
          のマイナンバーカード」として、できることがふえるんだ。でも、カードがスマホの中に「すいこまれる」わけじゃない。どうなっているのかな？
        </p>
      </ChapterHead>

      <Analogy>
        <p>
          家のカギをなくさないように、<strong>合いカギ</strong>
          を作るのに少しにているよ。ただし、カードのカギを型どりしてコピーするんじゃない。スマホの中の金庫で<strong>
            まったく新しいカギ
          </strong>を作って、「この新しいカギも本人のものです」と、カードを使って国に認めてもらうんだ。
        </p>
      </Analogy>

      <Stage label="うごかしてみよう：スマホに入れるまで">
        <PhoneSetup />
      </Stage>

      <h2>スマホの「金庫」ってなに？</h2>
      <p>
        スマホの中には、ふつうのアプリとは別に、<strong>
          セキュアエレメント
        </strong>
        という小さなチップがあるよ。おサイフケータイやタッチ決済でも使われている、マイナンバーカードのチップと同じように「いじられても負けない」金庫なんだ。スマホ用のひみつのカギは、この金庫の中だけにある。だから、マイナンバーカードを入れられるのは、決められた強さの金庫を持っているスマホだけなんだ。
      </p>

      <h2>スマホのマイナカードでできる 2 つのこと</h2>
      <div mix={usesStyle}>
        <div mix={useCardStyle}>
          <p mix={useTitleStyle}>
            <span aria-hidden="true">🌐</span> ネットで使う
          </p>
          <p>
            マイナポータルへのログインや、ネットでの申しこみ、コンビニで住民票をとるときなど。これまでの章で見てきた「ひみつのカギ」と「証明書」を使うよ。
          </p>
          <p mix={useRealStyle}>ほんとうの名前：電子証明書機能</p>
        </div>
        <div mix={useCardStyle}>
          <p mix={useTitleStyle}>
            <span aria-hidden="true">🧑‍💼</span> 目の前の人に見せる
          </p>
          <p>
            お店や窓口で「本人です」「20
            さい以上です」「この町に住んでいます」と確かめてもらうとき。お店の人は、デジタル庁の<strong>
              「マイナンバーカード対面確認アプリ」
            </strong>でスマホを読みとるよ。
          </p>
          <p mix={useRealStyle}>ほんとうの名前：属性証明機能</p>
        </div>
      </div>
      <p>
        iPhone のマイナンバーカードは、2025 年から両方ができる。Android は、2026
        年 10 月 20 日（予定）から「Android
        のマイナンバーカード」になって、Google
        ウォレットに入れて使えるようになり、「目の前の人に見せる」こともできるようになるよ。
      </p>

      <h2>カードはもういらないの？</h2>
      <p>
        スマホだけで使える場面はふえているけれど、まだカードしか使えない場面もあるよ。デジタル庁も「カードも持ち歩いてね」とよびかけている。カードとスマホは<strong>
          なかよく両方使う
        </strong>ものなんだ。
      </p>

      <Summary>
        <p>
          スマホに入るのはカードのコピーではなく、スマホの金庫で作った「スマホ用のカギ」と、それを本人のものだと認めた「スマホ用の証明書」。なくしたら、スマホの分だけ止められる。
        </p>
      </Summary>

      <GrownUpNote>
        <ul>
          <li>
            Android は 2023 年 5
            月から「スマホ用電子証明書」（署名用・利用者証明用）を搭載でき、マイナポータル、オンライン申請、コンビニ交付などに使える。2026
            年 10 月 20 日（予定）に「Android のマイナンバーカード」（Google
            ウォレット）へ刷新され、「属性証明機能」が加わる。リリース日は最終テストの結果で変わることがある。対応するのは一定の基準を満たすセキュリティチップを搭載した端末。
          </li>
          <li>
            iPhone は 2025 年 6 月 24 日から、Apple ウォレットに「iPhone
            のマイナンバーカード」を追加できる（iOS 18.5 以降、iPhone XS
            以降）。
          </li>
          <li>
            属性証明機能により、官民の対面サービスで本人確認・年齢確認・住民確認などを受けられる。読み取る側は、デジタル庁が無償提供する「マイナンバーカード対面確認アプリ」で対応できる。
          </li>
          <li>
            スマートフォンのセキュアエレメント内で新たに鍵ペアを生成し、マイナンバーカードによる本人確認（署名用電子証明書）を経て、J-LIS
            がスマホ用の署名用・利用者証明用電子証明書を発行する。カードの秘密鍵をコピーするわけではない。
          </li>
          <li>
            iPhone では暗証番号の代わりに Face ID / Touch ID
            で利用できる。追加には、マイナポータルアプリ、カード本体、券面事項入力補助用暗証番号（4
            けた）、署名用パスワードが必要。
          </li>
          <li>
            紛失時は、スマホ用電子証明書だけを一時停止・失効できる（マイナンバー総合フリーダイヤル等）。
          </li>
        </ul>
      </GrownUpNote>

      <Sources
        items={[
          {
            href: "https://www.digital.go.jp/policies/mynumber/smartphone-card",
            label: "デジタル庁：マイナンバーカードのスマートフォン搭載",
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
  padding: "0.9rem 1rem",
  borderRadius: radius.lg,
  border: `2px solid ${color.border}`,
  background: art.softBlue,
  "& p": { marginBlock: "0.4rem" },
});

const useTitleStyle = css({ fontWeight: 800, fontSize: "1.1rem" });

const useRealStyle = css({
  color: color.muted,
  fontSize: "0.85rem !important",
});
