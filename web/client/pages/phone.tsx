import type { Handle } from "@remix-run/component";

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
          いまは、スマホにマイナンバーカードの機能を入れられるよ。Android では
          2023 年から、iPhone では 2025
          年から使えるようになったんだ。でも、カードがスマホの中に「すいこまれる」わけじゃない。どうなっているのかな？
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
        という小さなチップがあるよ。おサイフケータイやタッチ決済でも使われている、マイナンバーカードのチップと同じように「いじられても負けない」金庫なんだ。スマホ用のひみつのカギは、この金庫の中だけにある。
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
            月から「スマホ用電子証明書」を搭載できる。iPhone は 2025 年 6 月 24
            日から、Apple ウォレットに「iPhone
            のマイナンバーカード」を追加できる（iOS 18.5 以降、iPhone XS
            以降）。
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
            href: "https://myna.go.jp/",
            label: "マイナポータル",
          },
        ]}
      />

      <ChapterNav chapter="phone" />
    </>
  );
}
