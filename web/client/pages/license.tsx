import type { Handle } from "@remix-run/component";

import { LicenseCheck } from "../islands/license_check.tsx";
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

export const title = `スマホが運転免許証になる日は来る？ — ${SITE_NAME}`;
export const description =
  "マイナンバーカードを運転免許証にする「マイナ免許証」と、国が実現をめざしている「モバイル運転免許証」。今とこれからのちがいを、動く図で説明します。";

export const hydrate = true;

export default function License(_handle: Handle) {
  return () => (
    <>
      <ChapterHead chapter="license">
        <p>
          {"マイナンバーカードはスマホに入れられるようになったよね（第3章）。では、運転免許証はどうかな？ 今は、車を運転するときは、カードを持っていないといけない。スマホだけで運転できる日は来るのかな？"}
        </p>
      </ChapterHead>

      <Analogy>
        <p>
          {"電車のきっぷを思いうかべてみて。紙のきっぷから、ICカードになって、今はスマホをピッとかざすだけで乗れるよね。運転免許証も、紙からカードへ、カードからICチップへ、そして"}
          <strong>スマホへ</strong>
          {"と進もうとしているところなんだ。"}
        </p>
      </Analogy>

      <Stage label="動かしてみよう：免許証の今とこれから">
        <LicenseCheck />
      </Stage>

      <h2>今：マイナ免許証</h2>
      <p>
        {"2025年3月24日から、マイナンバーカードのICチップに免許の情報を入れて、運転免許証として使えるようになったよ。これを"}
        <strong>マイナ免許証</strong>
        {"というんだ。カードの表には免許のことは書いていなくて、免許の種類や有効期間、顔写真などは、ICチップの中に入っている。"}
      </p>
      <p>
        {"今までの免許証だけを持つ、マイナ免許証だけを持つ、両方を持つ、の3つから選べる。2026年9月の終わりには、およそ421万人がマイナ免許証を持っているよ。でも、どれを選んでも、運転するときは"}
        <strong>カードを持っていないといけない</strong>
        {"。スマホのマイナンバーカードには、免許の情報は入らないんだ。"}
      </p>

      <h2>これから：スマホ免許証</h2>
      <p>
        {"国は2026年7月に決めた計画で、免許の情報をスマホに入れる"}
        <strong>モバイル運転免許証</strong>
        {"を、できるだけ早く実現することをめざすとしているよ。運転するときにカードを持たなくてもよくするためなんだ。ただし、いつから、どんなしくみで使えるようになるかは、まだ決まっていない。"}
      </p>
      <p>
        {"計画には「外国でも通じるもの」も考えると書いてある。世界には、スマホの運転免許証の決まり（国際標準）があって、第3章で見たスマホのマイナンバーカードのデータも、同じ形になっているんだ。"}
      </p>

      <h2>世界ではどうなっているの？</h2>
      <p>
        {"アメリカでは、いくつかの州がスマホの運転免許証を出していて、一部の空港の手荷物検査で、本人確認に使えるよ。ヨーロッパ（EU）でも、運転免許証をスマホで使えるようにする新しいルールづくりが進んでいる。どれも、スマホから必要な情報を、発行した所の電子署名つきで送って、相手がそれを確かめるしくみなんだ。"}
      </p>

      <Summary>
        <p>
          {"今は、マイナ免許証でも、運転するときはカードが必要。国は、スマホだけで運転できる「モバイル運転免許証」をできるだけ早く実現しようとしているけれど、しくみや時期はまだ決まっていない。"}
        </p>
      </Summary>

      <GrownUpNote>
        <ul>
          <li>
            {"マイナンバーカードと運転免許証の一体化（マイナ免許証）は、令和4年の道路交通法改正に基づき、2025年3月24日から全国で運用されている。免許証のみ・マイナ免許証のみ・両方の3通りから選べ、運転時は免許証またはマイナ免許証のいずれかを携帯する必要がある（警察庁）。"}
          </li>
          <li>
            {"マイナ免許証のICチップには、マイナ免許証の番号、免許の年月日と有効期間の末日、免許の種類、免許の条件、顔写真等が記録される。券面には免許に関する事項は記載されない。内容は警察庁の「マイナ免許証読み取りアプリ」やマイナポータルで確認できる。"}
          </li>
          <li>
            {"マイナ免許証の保有者数は2026年9月末時点で4,207,463人（うちマイナ免許証のみ1,150,552人、2枚持ち3,056,911人）（警察庁）。"}
          </li>
          <li>
            {"「デジタル社会の実現に向けた重点計画」（2026年7月21日閣議決定）は、運転時に必要な物理的カードの携帯を不要にするため、運転免許情報をスマートフォンに記録する「モバイル運転免許証」について、具体的な実現方法の検討を進め、極力早期の実現を目指すとしている。国際的な互換性を有するモバイル運転免許証の導入も引き続き検討するとしている。"}
          </li>
          <li>
            {"モバイル運転免許証（mDL）の国際標準はISO/IEC 18013-5（2021年）。データモデルmdocは、発行者の署名と証明書チェーンでオフラインでも改ざんを検知でき、項目ごとの選択的開示に対応する。iPhone・Androidのマイナンバーカードの券面相当データ（カード代替電磁的記録）もmdoc形式だが、docTypeはmDLのものではなくISO/IEC 23220系の日本固有のもの（案）とされる。"}
          </li>
          <li>
            {"米国では、各州が発行するモバイル運転免許証・IDの一部を、TSAが一部の空港の保安検査で試行的に受け付けている。EUでは、運転免許証のデジタル化を含む運転免許指令の改正について、2025年3月に欧州議会と理事会が暫定合意した。"}
          </li>
          <li>
            {"この章の動く図の「スマホ免許証」は、ISO/IEC 18013-5に沿った場合の例であり、日本のモバイル運転免許証の方式は決まっていない。"}
          </li>
        </ul>
      </GrownUpNote>

      <Sources
        items={[
          {
            href: "https://www.npa.go.jp/bureau/traffic/r4kaisei_main.html",
            label: "警察庁：マイナンバーカードと運転免許証の一体化",
          },
          {
            href: "https://www.npa.go.jp/bureau/traffic/mynamenkyo_202609.pdf",
            label: "警察庁：令和8年9月末時点のマイナ免許証保有者数",
          },
          {
            href: "https://www.digital.go.jp/policies/priority-policy-program",
            label: "デジタル庁：デジタル社会の実現に向けた重点計画",
          },
          {
            href: "https://zenn.dev/trustdock/articles/54ab2b9c6bdd56",
            label:
              "TRUSTDOCK：マイナンバーカードのスマホ搭載と国際標準（mdoc / ISO 18013-5）",
          },
          {
            href: "https://www.iso.org/standard/69084.html",
            label:
              "ISO/IEC 18013-5:2021 Mobile driving licence (mDL) application",
          },
          {
            href: "https://www.tsa.gov/digital-id/participating-states",
            label: "TSA: Participating States and Eligible Digital IDs",
          },
          {
            href:
              "https://transport.ec.europa.eu/news-events/news/commission-welcomes-provisional-agreement-modernised-driving-licences-rules-2025-03-25_en",
            label:
              "European Commission: provisional agreement on modernised driving licences rules",
          },
        ]}
      />

      <ChapterNav chapter="license" />
    </>
  );
}
