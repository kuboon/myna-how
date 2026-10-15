/**
 * The electronic-signature chapter's picture of a certificate: J-LIS signs it, 役所 checks it.
 *
 * It is the アリスさん–ボブさん picture again with the parts renamed. J-LIS is the one who signs;
 * what it signs is the certificate's body — a name, an address, and the public key of the card
 * just made — and the body plus J-LIS's signature is the 電子証明書. 役所 already holds J-LIS's
 * public key and checks the signature with it, which is what tells 役所 that the name and the
 * public key belong together.
 *
 * Every key and signature is real (Web Crypto, ECDSA P-256). J-LIS's key pair is fixed and its
 * public key is on screen from the start, because it exists before any card; the card's key pair is
 * made when the first button is pressed. J-LIS's secret key is loaded unreadable
 * (`extractable: false`) and shown only as a sealed box. Every other box can be edited, so the reader can change a name or a key in what 役所
 * received and watch the check fail.
 */

import { clientEntry, css, type Handle, on } from "@remix-run/component";

import { buttonStyle } from "../ui/controls.tsx";
import { Icon } from "../ui/icons.tsx";
import {
  Action,
  actionsStyle,
  ALGORITHM,
  captionStyle,
  codeStyle,
  Field,
  fieldStyle,
  footStyle,
  importPublic,
  JLIS_PUBLIC,
  jlisSecretKey,
  labelStyle,
  letterStyle,
  mixArrowStyle,
  mixItemStyle,
  mixKeyStyle,
  mixLetterStyle,
  mixResultStyle,
  mixRowStyle,
  mixStyle,
  ngStyle,
  okStyle,
  packetStyle,
  PersonHead,
  personStyle,
  placeholderStyle,
  popStyle,
  problemStyle,
  safeVerify,
  sceneStyle,
  sealedBoxStyle,
  sealedBusyStyle,
  sealedKeyStyle,
  SIGN,
  SIGNING_MS,
  toBase64,
  verdictStyle,
  wireLabelStyle,
  wireLineStyle,
  wireStyle,
} from "../ui/signature_ui.tsx";
import { color, radius } from "../tokens.ts";

type Step = 0 | 1 | 2 | 3 | 4;

type Verdict =
  | { ok: true }
  | { ok: false; reason: "mismatch" | "broken" };

type FieldName =
  | "jlisPublic"
  | "body"
  | "signature"
  | "gotJlisPublic"
  | "gotBody"
  | "gotSignature";

export const CertificateDemo = clientEntry(
  import.meta.url,
  function CertificateDemo(handle: Handle) {
    let step: Step = 0;
    let busy = false;
    let signing = false;
    let justSigned = false;
    let problem = "";
    let written = 0;
    let verdict: Verdict | null = null;
    const text: Record<FieldName, string> = {
      jlisPublic: JLIS_PUBLIC,
      body: "",
      signature: "",
      // J-LIS's public key is published; 役所 has it before any certificate arrives.
      gotJlisPublic: JLIS_PUBLIC,
      gotBody: "",
      gotSignature: "",
    };

    const set = (values: Partial<Record<FieldName, string>>) => {
      Object.assign(text, values);
      written += 1;
    };

    /** A card is made: its key pair, whose public half goes into the certificate's body. */
    const makeCard = async () => {
      busy = true;
      problem = "";
      handle.update();
      try {
        const card = await crypto.subtle.generateKey(ALGORITHM, false, [
          "sign",
          "verify",
        ]);
        const cardPublic = toBase64(
          await crypto.subtle.exportKey("spki", card.publicKey),
        );
        set({
          body: [
            "電子証明書（署名用）",
            "名前：まいな さくら",
            "住所：○○市△△町1-2-3",
            `公開のカギ：${cardPublic}`,
            "発行：J-LIS",
          ].join("\n"),
          signature: "",
          gotBody: "",
          gotSignature: "",
        });
        verdict = null;
        step = 1;
      } catch {
        problem =
          "このブラウザでは、カギを作れなかったよ。新しいブラウザでためしてね。";
      } finally {
        busy = false;
        handle.update();
      }
    };

    const sign = async () => {
      busy = true;
      signing = true;
      justSigned = false;
      problem = "";
      handle.update();
      try {
        const [made] = await Promise.all([
          jlisSecretKey().then((key) =>
            crypto.subtle.sign(SIGN, key, new TextEncoder().encode(text.body))
          ),
          new Promise((done) => setTimeout(done, SIGNING_MS)),
        ]);
        set({ signature: toBase64(made) });
        justSigned = true;
        verdict = null;
        step = 2;
      } catch {
        problem =
          "このブラウザでは、電子署名を作れなかったよ。新しいブラウザでためしてね。";
      } finally {
        busy = false;
        signing = false;
        handle.update();
      }
    };

    const send = () => {
      set({ gotBody: text.body, gotSignature: text.signature });
      verdict = null;
      step = 3;
      handle.update();
    };

    const verify = async () => {
      busy = true;
      handle.update();
      const key = await importPublic(text.gotJlisPublic);
      if (key === null) {
        verdict = { ok: false, reason: "broken" };
      } else {
        verdict = await safeVerify(key, text.gotSignature, text.gotBody)
          ? { ok: true }
          : { ok: false, reason: "mismatch" };
      }
      busy = false;
      step = 4;
      handle.update();
    };

    const edit = (name: FieldName, value: string) => {
      text[name] = value;
      if (verdict && name.startsWith("got")) {
        verdict = null;
        handle.update();
      }
    };

    const reset = () => {
      set({
        jlisPublic: JLIS_PUBLIC,
        body: "",
        signature: "",
        gotJlisPublic: JLIS_PUBLIC,
        gotBody: "",
        gotSignature: "",
      });
      verdict = null;
      step = 0;
      problem = "";
      handle.update();
    };

    const box = (name: FieldName, label: string, kind: "code" | "letter") => (
      <textarea
        key={`${name}-${written}`}
        mix={[
          fieldStyle,
          kind === "letter" ? letterStyle : codeStyle,
          name === "signature" && justSigned ? popStyle : null,
          on("input", (event) =>
            edit(name, (event.currentTarget as HTMLTextAreaElement).value)),
        ]}
        rows={kind === "letter" ? 5 : 3}
        spellcheck={false}
        defaultValue={text[name]}
        aria-label={label}
        placeholder="まだない"
      />
    );

    return () => (
      <div>
        <div mix={sceneStyle}>
          <section mix={personStyle} aria-label="J-LIS">
            <PersonHead
              icon="shieldCheck"
              name="J-LIS"
              note="電子証明書を出す所"
            />

            <div
              mix={[sealedBoxStyle, signing ? sealedBusyStyle : null]}
              aria-label="J-LISのひみつのカギ"
            >
              <span mix={sealedKeyStyle}>
                <Icon name="lock" />
                J-LISのひみつのカギ（秘密鍵）
              </span>
              <small>
                {"J-LISの中だけにある。だれにも見えないし、取り出せない。"}
              </small>
            </div>
            <Field
              label="J-LISの公開のカギ（公開鍵）"
              icon="publicKey"
              use={signing ? "unused" : null}
            >
              {box("jlisPublic", "J-LISの公開のカギ", "code")}
            </Field>

            <div mix={certificateStyle}>
              <span mix={[labelStyle, certificateLabelStyle]}>
                <Icon name="certificate" />
                <span>電子証明書 ＝ 本文 ＋ J-LISの電子署名</span>
              </span>
              <Field
                label="本文"
                icon="notebook"
                use={signing ? "used" : null}
              >
                {text.body || step > 0
                  ? box("body", "電子証明書の本文", "letter")
                  : (
                    <p mix={placeholderStyle}>
                      {"カードを作ると、名前・住所と、カードの公開のカギがここに書かれる。"}
                    </p>
                  )}
              </Field>
              {signing
                ? (
                  <p mix={mixStyle} aria-live="polite">
                    <span mix={mixRowStyle}>
                      <span mix={[mixItemStyle, mixKeyStyle]}>
                        <Icon name="lock" />
                        J-LISのひみつのカギ
                      </span>
                      <span aria-hidden="true">＋</span>
                      <span mix={[mixItemStyle, mixLetterStyle]}>
                        <Icon name="notebook" />
                        本文
                      </span>
                    </span>
                    <span mix={mixArrowStyle} aria-hidden="true">
                      <Icon name="arrowDown" />
                    </span>
                    <span mix={[mixItemStyle, mixResultStyle]}>
                      <Icon name="sign" />
                      J-LISの電子署名
                    </span>
                  </p>
                )
                : null}
              <Field
                label="J-LISの電子署名"
                icon="sign"
                use={signing ? "made" : null}
              >
                {box("signature", "J-LISの電子署名", "code")}
              </Field>
            </div>

            <div mix={actionsStyle}>
              <Action
                next={step === 0}
                done={step > 0}
                enabled={!busy}
                label="あなたのカードを作る"
                onPress={makeCard}
              />
              <Action
                next={step === 1}
                done={step > 1}
                enabled={!busy && text.body !== ""}
                label="J-LISが本文に電子署名をつける"
                onPress={sign}
              />
              <Action
                next={step === 2}
                done={step > 2}
                enabled={!busy && text.signature !== ""}
                label="電子証明書を役所にわたす"
                onPress={send}
              />
            </div>
          </section>

          <div mix={wireStyle} aria-label="通り道（インターネット）">
            <span mix={wireLabelStyle}>
              <Icon name="globe" />
              通り道
            </span>
            <span mix={wireLineStyle} aria-hidden="true" />
            {step === 3
              ? (
                <span key="sent" mix={packetStyle}>
                  <Icon name="certificate" />
                  電子証明書
                </span>
              )
              : null}
          </div>

          <section mix={personStyle} aria-label="役所">
            <PersonHead
              icon="landmark"
              name="役所"
              note="電子証明書を確かめる所"
            />

            <Field
              label="J-LISの公開のカギ（前もって持っている）"
              icon="publicKey"
            >
              {box(
                "gotJlisPublic",
                "役所が持っているJ-LISの公開のカギ",
                "code",
              )}
            </Field>
            <Field label="受け取った本文" icon="notebook">
              {box("gotBody", "役所が受け取った電子証明書の本文", "letter")}
            </Field>
            <Field label="受け取ったJ-LISの電子署名" icon="sign">
              {box("gotSignature", "役所が受け取ったJ-LISの電子署名", "code")}
            </Field>

            <div mix={actionsStyle}>
              <Action
                next={step === 3}
                done={false}
                enabled={!busy && text.gotJlisPublic !== "" &&
                  text.gotSignature !== ""}
                label="J-LISの公開のカギで確かめる"
                onPress={verify}
              />
            </div>

            {verdict === null ? null : (
              <p
                key={`v-${written}-${verdict.ok}`}
                mix={[verdictStyle, verdict.ok ? okStyle : ngStyle]}
                role={verdict.ok ? undefined : "alert"}
                aria-live="polite"
              >
                <Icon name={verdict.ok ? "check" : "x"} />
                {verdict.ok
                  ? "電子署名は合う：J-LISが出した、そのままの電子証明書。名前と公開のカギの組み合わせは本物"
                  : verdict.reason === "mismatch"
                  ? "エラー：電子署名が合わない。電子証明書が書きかえられているか、J-LISが出したものではない"
                  : "エラー：確かめられない。J-LISの公開のカギの文字がこわれている"}
              </p>
            )}
          </section>
        </div>

        <p
          mix={[captionStyle, problem ? problemStyle : null]}
          aria-live="polite"
        >
          {problem || captions[step]}
        </p>

        <div mix={footStyle}>
          <button
            type="button"
            mix={[buttonStyle, on("click", reset)]}
            disabled={step === 0 || busy}
          >
            <Icon name="restart" />
            さいしょから
          </button>
        </div>
      </div>
    );
  },
);

const captions: Record<Step, string> = {
  0: "J-LISは、電子証明書を出す所。J-LISのひみつのカギと公開のカギは、カードを作るよりずっと前からあって、どのカードの電子証明書にも、同じカギで電子署名をつける。J-LISの公開のカギは公開されていて、役所も前もって持っているよ。まず「あなたのカードを作る」をおしてみよう。",
  1: "特別な機械で、あなたのカギのペアができた。ひみつのカギはカードにしまわれて、公開のカギは、名前・住所といっしょに電子証明書の本文に書かれたよ。",

  2: "J-LISは、自分のひみつのカギと本文から、電子署名を作った。本文とJ-LISの電子署名を合わせたものが、電子証明書だよ。",
  3: "役所に電子証明書がとどいた（本当は、届けといっしょに送られてくる）。役所は、前もって持っているJ-LISの公開のカギで確かめよう。",
  4: "電子署名が合えば、J-LISが出した、書きかえられていない電子証明書だとわかる。受け取った本文の名前を「イブ」に変えたり、公開のカギを1文字だけ変えたりして、もう一度確かめてみよう。",
};

const certificateStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  padding: "0.6rem",
  border: `2px solid ${color.accent}`,
  borderRadius: radius.md,
});

const certificateLabelStyle = css({ alignItems: "flex-start" });
