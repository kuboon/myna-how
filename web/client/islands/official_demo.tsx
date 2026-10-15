/**
 * The electronic-signature chapter's second picture: sending a form (届け) to 役所 with the My Number
 * Card.
 *
 * Unlike アリスさん, あなた never makes or sees a secret key: it was written into the card's chip
 * when the card was made and never leaves it, and the picture shows it only as a sealed box. What travels is the form, the
 * signature, and the 電子証明書 — J-LIS's signed statement of whose public key it is. 役所 checks
 * three things: the certificate carries J-LIS's signature, the signature matches the form under
 * the certificate's public key, and J-LIS still says the certificate is good.
 *
 * Every key and signature is real (Web Crypto, ECDSA P-256). The card's key pair is made when the
 * first button is pressed; J-LIS's is the fixed one in `ui/signature_ui.tsx`, there from the
 * start. The revocation question always answers "still good". Every box but the chip can be edited, so the reader can tamper with what 役所
 * receives and watch the checks fail.
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
  sealedHeadStyle,
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

const FORM =
  "引っこしの届け\n名前：まいな さくら\n今の住所：○○市△△町1-2-3\n引っこし先：□□市◇◇町4-5-6";

const CERT_HEAD = "電子証明書（署名用）";
const CERT_KEY = "公開のカギ：";
const CERT_SPLIT = "\n---\n";
const CERT_SIG = "J-LISの電子署名：";

type Step = 0 | 1 | 2 | 3;

type FieldName =
  | "form"
  | "signature"
  | "certificate"
  | "jlisPublic"
  | "gotForm"
  | "gotSignature"
  | "gotCertificate";

/** One of 役所's three checks: passed, failed, or not reached. */
type Check = "ok" | "ng" | "skip";

interface Checks {
  issuer: Check;
  signature: Check;
  revoked: Check;
}

export const OfficialDemo = clientEntry(
  import.meta.url,
  function OfficialDemo(handle: Handle) {
    let step: Step = 0;
    let busy = false;
    let signing = false;
    let justSigned = false;
    let problem = "";
    let written = 0;
    let checks: Checks | null = null;
    const text: Record<FieldName, string> = {
      form: FORM,
      signature: "",
      certificate: "",
      // J-LIS's public key is published; 役所 has it before any form arrives.
      jlisPublic: JLIS_PUBLIC,
      gotForm: "",
      gotSignature: "",
      gotCertificate: "",
    };

    /** The card's key pair. The secret half cannot be exported, by anyone. */
    let card: CryptoKeyPair | null = null;

    const set = (values: Partial<Record<FieldName, string>>) => {
      Object.assign(text, values);
      written += 1;
    };

    /** Made once, the first time the card is used: the card's keys and J-LIS's certificate. */
    const prepareCard = async () => {
      if (card) return;
      card = await crypto.subtle.generateKey(ALGORITHM, false, [
        "sign",
        "verify",
      ]);
      const publicKey = toBase64(
        await crypto.subtle.exportKey("spki", card.publicKey),
      );
      const body = [
        CERT_HEAD,
        "名前：まいな さくら",
        "住所：○○市△△町1-2-3",
        `${CERT_KEY}${publicKey}`,
        "発行：J-LIS",
      ].join("\n");
      const issued = toBase64(
        await crypto.subtle.sign(
          SIGN,
          await jlisSecretKey(),
          new TextEncoder().encode(body),
        ),
      );
      set({ certificate: `${body}${CERT_SPLIT}${CERT_SIG}${issued}` });
    };

    const sign = async () => {
      busy = true;
      signing = true;
      justSigned = false;
      problem = "";
      handle.update();
      try {
        const [made] = await Promise.all([
          (async () => {
            await prepareCard();
            return toBase64(
              await crypto.subtle.sign(
                SIGN,
                card!.privateKey,
                new TextEncoder().encode(text.form),
              ),
            );
          })(),
          new Promise((done) => setTimeout(done, SIGNING_MS)),
        ]);
        set({ signature: made });
        justSigned = true;
        checks = null;
        step = 1;
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
      set({
        gotForm: text.form,
        gotSignature: text.signature,
        gotCertificate: text.certificate,
      });
      checks = null;
      step = 2;
      handle.update();
    };

    const check = async () => {
      busy = true;
      handle.update();
      const result: Checks = {
        issuer: "ng",
        signature: "skip",
        revoked: "skip",
      };
      try {
        const [body, tail = ""] = text.gotCertificate.split(CERT_SPLIT);
        const issued = tail.startsWith(CERT_SIG)
          ? tail.slice(CERT_SIG.length)
          : "";
        // ① The certificate: does J-LIS's public key, as 役所 holds it, accept J-LIS's signature?
        const jlisKey = await importPublic(text.jlisPublic);
        result.issuer = jlisKey && await safeVerify(jlisKey, issued, body)
          ? "ok"
          : "ng";
        if (result.issuer === "ok") {
          // ② The form: does the certificate's public key accept the signature on it?
          const keyLine = body.split("\n").find((l) => l.startsWith(CERT_KEY));
          const key = await importPublic(keyLine?.slice(CERT_KEY.length) ?? "");
          result.signature = key &&
              await safeVerify(key, text.gotSignature, text.gotForm)
            ? "ok"
            : "ng";
          // ③ J-LIS: is the certificate still good? Here it always is.
          result.revoked = "ok";
        }
      } finally {
        checks = result;
        busy = false;
        step = 3;
        handle.update();
      }
    };

    const edit = (name: FieldName, value: string) => {
      text[name] = value;
      if (checks && (name.startsWith("got") || name === "jlisPublic")) {
        checks = null;
        handle.update();
      }
    };

    const reset = () => {
      set({
        form: FORM,
        signature: "",
        jlisPublic: JLIS_PUBLIC,
        gotForm: "",
        gotSignature: "",
        gotCertificate: "",
      });
      checks = null;
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
        rows={kind === "letter" ? 4 : 3}
        spellcheck={false}
        defaultValue={text[name]}
        aria-label={label}
        placeholder={kind === "letter" ? undefined : "まだない"}
      />
    );

    return () => {
      const allOk = checks !== null && checks.issuer === "ok" &&
        checks.signature === "ok" && checks.revoked === "ok";
      return (
        <div>
          <div mix={sceneStyle}>
            <section mix={personStyle} aria-label="あなた">
              <PersonHead icon="user" name="あなた" note="届けを送る人" />

              <div
                mix={[sealedBoxStyle, signing ? sealedBusyStyle : null]}
                aria-label="マイナンバーカードのICチップ"
              >
                <span mix={sealedHeadStyle}>
                  <Icon name="chip" />
                  マイナンバーカードのICチップ
                </span>
                <span mix={sealedKeyStyle}>
                  <Icon name="lock" />
                  ひみつのカギ（秘密鍵）
                </span>
                <small>
                  {"チップの中だけにある。だれにも見えないし、取り出せないし、書きかえられない。"}
                </small>
              </div>

              <Field
                label="電子証明書"
                icon="certificate"
                use={signing ? "unused" : null}
              >
                {text.certificate
                  ? box("certificate", "あなたの電子証明書", "code")
                  : (
                    <p mix={placeholderStyle}>
                      {"カードの中にある。電子署名を作るときに読み出すよ。"}
                    </p>
                  )}
              </Field>
              <Field
                label="届け"
                icon="clipboard"
                use={signing ? "used" : null}
              >
                {box("form", "あなたの届け", "letter")}
              </Field>
              {signing
                ? (
                  <p mix={mixStyle} aria-live="polite">
                    <span mix={mixRowStyle}>
                      <span mix={[mixItemStyle, mixKeyStyle]}>
                        <Icon name="chip" />
                        チップの中のひみつのカギ
                      </span>
                      <span aria-hidden="true">＋</span>
                      <span mix={[mixItemStyle, mixLetterStyle]}>
                        <Icon name="clipboard" />
                        届け
                      </span>
                    </span>
                    <span mix={mixArrowStyle} aria-hidden="true">
                      <Icon name="arrowDown" />
                    </span>
                    <span mix={[mixItemStyle, mixResultStyle]}>
                      <Icon name="sign" />
                      電子署名
                    </span>
                  </p>
                )
                : null}
              <Field
                label="電子署名"
                icon="sign"
                use={signing ? "made" : null}
              >
                {box("signature", "あなたの電子署名", "code")}
              </Field>

              <div mix={actionsStyle}>
                <Action
                  next={step === 0}
                  done={step > 0}
                  enabled={!busy}
                  label="カードで電子署名を作る"
                  onPress={sign}
                />
                <Action
                  next={step === 1}
                  done={step > 1}
                  enabled={!busy && text.signature !== ""}
                  label="届け・電子署名・電子証明書を送る"
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
              {step === 2
                ? (
                  <span key="sent" mix={packetStyle}>
                    <Icon name="clipboard" />
                    届けなど3つ
                  </span>
                )
                : null}
            </div>

            <section mix={personStyle} aria-label="役所">
              <PersonHead
                icon="landmark"
                name="役所"
                note="届けを受け取る所"
              />

              <Field
                label="J-LISの公開のカギ（前もって持っている）"
                icon="publicKey"
              >
                {box("jlisPublic", "役所が持っているJ-LISの公開のカギ", "code")}
              </Field>
              <Field label="受け取った届け" icon="clipboard">
                {box("gotForm", "役所が受け取った届け", "letter")}
              </Field>
              <Field label="受け取った電子署名" icon="sign">
                {box("gotSignature", "役所が受け取った電子署名", "code")}
              </Field>
              <Field label="受け取った電子証明書" icon="certificate">
                {box("gotCertificate", "役所が受け取った電子証明書", "code")}
              </Field>

              <div mix={actionsStyle}>
                <Action
                  next={step === 2}
                  done={false}
                  enabled={!busy && text.gotSignature !== "" &&
                    text.gotCertificate !== ""}
                  label="3つのことを確かめる"
                  onPress={check}
                />
              </div>

              {checks
                ? (
                  <ol key={`c-${written}`} mix={checksStyle}>
                    <CheckRow
                      result={checks.issuer}
                      label="J-LISの公開のカギで、電子証明書のJ-LISの電子署名は合う？"
                    />
                    <CheckRow
                      result={checks.signature}
                      label="電子証明書の公開のカギで、電子署名は合う？"
                    />
                    <CheckRow
                      result={checks.revoked}
                      label="J-LISに聞く：この電子証明書は、まだ使える？"
                    />
                  </ol>
                )
                : null}
              {checks
                ? (
                  <p
                    mix={[verdictStyle, allOk ? okStyle : ngStyle]}
                    role={allOk ? undefined : "alert"}
                  >
                    <Icon name={allOk ? "check" : "x"} />
                    {allOk
                      ? "受け付けました：本人が出した、そのままの届け"
                      : "エラー：受け付けられません"}
                  </p>
                )
                : null}
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
    };
  },
);

const captions: Record<Step, string> = {
  0: "あなたのマイナンバーカードのICチップには、ひみつのカギが入っている。だれにも見えないし、書きかえることもできない。届けが書けたら、カードで電子署名を作ろう。",
  1: "電子署名は、ICチップの中で作られる。ひみつのカギは、チップの外に出てこないよ（本当は、ここで暗証番号を入れて、カードをスマホなどにかざす）。",
  2: "届けと電子署名に、電子証明書もつけて送るよ。電子証明書には、あなたの名前と公開のカギが書いてあって、J-LISの電子署名がついている。",
  3: "役所は、3つのことを確かめる。全部OKなら、本人が出した、書きかえられていない届けだとわかるんだ。受け取った届けの住所を1文字だけ変えて、もう一度確かめてみよう。",
};

function CheckRow(handle: Handle<{ result: Check; label: string }>) {
  return () => {
    const { result, label } = handle.props;
    return (
      <li
        mix={[
          checkRowStyle,
          result === "ok" ? okStyle : result === "ng" ? ngStyle : skipStyle,
        ]}
      >
        <Icon
          name={result === "ok" ? "check" : result === "ng" ? "x" : "ban"}
        />
        <span>{label}</span>
        <strong>
          {result === "ok" ? "OK" : result === "ng" ? "だめ" : "確かめられない"}
        </strong>
      </li>
    );
  };
}

const checksStyle = css({
  display: "grid",
  gap: "0.35rem",
  margin: 0,
  padding: 0,
  listStyle: "none",
});

const checkRowStyle = css({
  display: "flex",
  alignItems: "flex-start",
  gap: "0.4rem",
  margin: 0,
  padding: "0.4rem 0.6rem",
  borderRadius: radius.md,
  fontSize: "0.85rem !important",
  lineHeight: "1.6 !important",
  animation: "pop-in 300ms ease-out",
  "& strong": { marginLeft: "auto", whiteSpace: "nowrap" },
});

const skipStyle = css({ background: color.surface, color: color.muted });
