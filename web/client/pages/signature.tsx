import type { Handle } from "@remix-run/component";

import { SignatureDemo } from "../islands/signature_demo.tsx";
import {
  ChapterHead,
  ChapterNav,
  GrownUpNote,
  Sources,
  Stage,
  Summary,
} from "../parts.tsx";
import { SITE_NAME } from "../layout.tsx";

export const title = `電子署名を、自分で作ってみよう — ${SITE_NAME}`;
export const description =
  "アリスさんがひみつのカギと公開のカギを作り、手紙に電子署名をつけてボブさんに送ります。ボブさんは公開のカギで確かめます。ブラウザの中で本物の電子署名を作って、流れをためせます。";

export const hydrate = true;

export default function Signature(_handle: Handle) {
  return () => (
    <>
      <ChapterHead chapter="signature">
        <p>
          {"これまでの章で、何度も「電子署名」が出てきたね。この章では、電子署名を本当に作って、確かめてみよう。登場するのは、手紙を送るアリスさんと、受け取るボブさん。2人のあいだには、インターネットの通り道があるよ。"}
        </p>
      </ChapterHead>

      <Stage label="動かしてみよう：電子署名を作って、確かめる">
        <SignatureDemo />
      </Stage>

      <h2>この図でおきていること</h2>
      <ol>
        <li>
          <strong>カギのペアを作る</strong>
          {"：アリスさんが、ひみつのカギ（秘密鍵）と公開のカギ（公開鍵）を、2つでひと組作る。"}
        </li>
        <li>
          <strong>公開のカギを送る</strong>
          {"：公開のカギはボブさんに送る。だれに見られてもだいじょうぶ。ひみつのカギは、アリスさんだけが持っている。"}
        </li>
        <li>
          <strong>電子署名を作る</strong>
          {"：アリスさんは、手紙とひみつのカギから電子署名を作る。"}
        </li>
        <li>
          <strong>手紙と電子署名を送る</strong>
          {"：2つをいっしょに、ボブさんに送る。"}
        </li>
        <li>
          <strong>公開のカギで確かめる</strong>
          {"：ボブさんは、前にもらった公開のカギで、とどいた手紙と電子署名が合うかを確かめる。"}
        </li>
      </ol>

      <h2>確かめて、何がわかるの？</h2>
      <p>
        {"電子署名が合えば、ボブさんには2つのことがわかるよ。1つは、"}
        <strong>アリスさんのひみつのカギで作られた</strong>
        {"こと。ひみつのカギを持っていない人には、合う電子署名は作れない。もう1つは、"}
        <strong>手紙が1文字も書きかえられていない</strong>
        {"こと。手紙が少しでも変わると、電子署名は合わなくなる。"}
      </p>
      <p>
        {"図の中で、手紙の文を書きかえてみよう。電子署名を作り直さないと、送ることはできないよ。電子署名は、その手紙のためだけのものなんだ。"}
      </p>

      <h2>マイナンバーカードでは？</h2>
      <p>
        {"マイナンバーカードでは、アリスさんのひみつのカギにあたるものが、ICチップの中にある。チップの中で電子署名を作るから、ひみつのカギは外に出ない（第1章・第2章）。そして、公開のカギが本当にその人のものだと、J-LISが電子証明書で証明しているんだ（第4章）。"}
      </p>

      <Summary>
        <p>
          {"電子署名は、手紙とひみつのカギから作る。受け取った人は公開のカギで確かめて、「だれが書いたか」と「書きかえられていないか」がわかる。"}
        </p>
      </Summary>

      <GrownUpNote>
        <ul>
          <li>
            {"図の鍵と電子署名は、ブラウザのWeb Crypto APIで実際に生成している。方式はECDSA（曲線P-256、ハッシュSHA-256）。秘密鍵はPKCS#8、公開鍵はSubjectPublicKeyInfo（SPKI）形式をbase64で表示している。鍵はページを開いているブラウザの中だけで作られ、どこにも送られない。"}
          </li>
          <li>
            {"電子署名の検証は、受け取った文書・署名値・公開鍵の3つで行う。文書が1ビットでも変わると検証に失敗する（改ざん検知）。秘密鍵がなければ、検証に通る署名値は作れない（なりすまし防止）。"}
          </li>
          <li>
            {"図では公開鍵をそのまま送っているが、途中で別の公開鍵にすり替えられると、受け取った側は見分けられない。そのため実際には、公開鍵が本人のものであることを第三者（マイナンバーカードではJ-LIS）が電子証明書で保証する。"}
          </li>
          <li>
            {"アリス（Alice）とボブ（Bob）は、暗号の説明で送り手と受け手によく使われる名前。通信を盗み見る人はイブ（Eve）と呼ばれることが多い。"}
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
              "https://developer.mozilla.org/ja/docs/Web/API/SubtleCrypto/sign",
            label: "MDN：SubtleCrypto.sign()",
          },
        ]}
      />

      <ChapterNav chapter="signature" />
    </>
  );
}
