/**
 * The electronic-signature chapter's moving picture: an electronic signature, made and checked for real.
 *
 * アリスさん makes a key pair, sends the public key to ボブさん, writes a letter, signs it and
 * sends both; ボブさん checks the signature with the public key he was given. Every value on
 * screen is real: the keys and the signature come from the browser's Web Crypto (ECDSA P-256 with
 * SHA-256), shown as base64. Nothing is explained about how they are computed — the chapter is
 * about who holds what, and what the check proves.
 *
 * Every box can be typed in, keys and signatures included, so a reader can change one character
 * of what ボブさん received and watch the check fail. A check that fails — or that cannot even
 * read the key or the signature — is shown as an error.
 *
 * The line between the two is where イブさん, who reads and tampers with what passes, will stand
 * later.
 *
 * Nothing is generated until a button is pressed, so the first render is the same on the server
 * and in the browser.
 */

import { clientEntry, type Handle, on } from "@remix-run/component";

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
  fromBase64,
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
  popStyle,
  problemStyle,
  sceneStyle,
  SIGN,
  SIGNING_MS,
  toBase64,
  verdictStyle,
  wireLabelStyle,
  wireLineStyle,
  wireStyle,
} from "../ui/signature_ui.tsx";

const LETTER = "ボブさんへ\nあしたの3時に、公園で会おうね。\nアリスより";

/** The last thing that happened, which picks the sentence under the picture. */
type Step = 0 | 1 | 2 | 3 | 4 | 5;

/** What ボブさん's check came to. */
type Verdict =
  | { ok: true }
  | { ok: false; reason: "mismatch" | "broken" };

/** Every text box, by name. They are all editable; the buttons copy between them. */
type FieldName =
  | "alicePrivate"
  | "alicePublic"
  | "letter"
  | "signature"
  | "bobPublic"
  | "bobLetter"
  | "bobSignature";

export const SignatureDemo = clientEntry(
  import.meta.url,
  function SignatureDemo(handle: Handle) {
    let step: Step = 0;
    let busy = false;
    const text: Record<FieldName, string> = {
      alicePrivate: "",
      alicePublic: "",
      letter: LETTER,
      signature: "",
      bobPublic: "",
      bobLetter: "",
      bobSignature: "",
    };
    let verdict: Verdict | null = null;
    /**
     * While a signature is being made: the secret key and the letter light up, the public key
     * steps back, and the two flow together into the signature box. Then `justSigned` lets the
     * new signature pop in.
     */
    let signing = false;
    let justSigned = false;
    /** Something that could not be done, said plainly. */
    let problem = "";
    /**
     * Bumped whenever a button writes into the boxes. The boxes are uncontrolled (what is typed
     * stays typed), so they are re-mounted with the new text rather than overwritten under the
     * reader's cursor.
     */
    let written = 0;

    const set = (values: Partial<Record<FieldName, string>>) => {
      Object.assign(text, values);
      written += 1;
    };

    const run = async (work: () => Promise<void>, failure: string) => {
      busy = true;
      problem = "";
      handle.update();
      try {
        await work();
      } catch {
        problem = failure;
      } finally {
        busy = false;
        handle.update();
      }
    };

    const makeKeys = () =>
      run(
        async () => {
          const pair = await crypto.subtle.generateKey(ALGORITHM, true, [
            "sign",
            "verify",
          ]);
          set({
            alicePrivate: toBase64(
              await crypto.subtle.exportKey("pkcs8", pair.privateKey),
            ),
            alicePublic: toBase64(
              await crypto.subtle.exportKey("spki", pair.publicKey),
            ),
            signature: "",
            bobPublic: "",
            bobLetter: "",
            bobSignature: "",
          });
          verdict = null;
          step = 1;
        },
        "このブラウザでは、カギを作れなかったよ。新しいブラウザでためしてね。",
      );

    const sendKey = () => {
      set({ bobPublic: text.alicePublic });
      verdict = null;
      step = 2;
      handle.update();
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
            const key = await crypto.subtle.importKey(
              "pkcs8",
              fromBase64(text.alicePrivate),
              ALGORITHM,
              false,
              ["sign"],
            );
            return toBase64(
              await crypto.subtle.sign(
                SIGN,
                key,
                new TextEncoder().encode(text.letter),
              ),
            );
          })(),
          // Long enough to see which two boxes are used.
          new Promise((done) => setTimeout(done, SIGNING_MS)),
        ]);
        set({ signature: made });
        justSigned = true;
        step = 3;
      } catch {
        problem =
          "ひみつのカギがこわれていて、電子署名を作れなかったよ。「カギのペアを作る」からやり直してね。";
      } finally {
        busy = false;
        signing = false;
        handle.update();
      }
    };

    const sendLetter = () => {
      set({ bobLetter: text.letter, bobSignature: text.signature });
      verdict = null;
      step = 4;
      handle.update();
    };

    const verify = async () => {
      busy = true;
      problem = "";
      handle.update();
      try {
        const key = await crypto.subtle.importKey(
          "spki",
          fromBase64(text.bobPublic),
          ALGORITHM,
          false,
          ["verify"],
        );
        const ok = await crypto.subtle.verify(
          SIGN,
          key,
          fromBase64(text.bobSignature),
          new TextEncoder().encode(text.bobLetter),
        );
        verdict = ok ? { ok: true } : { ok: false, reason: "mismatch" };
      } catch {
        // A public key or signature that is not even the right shape is a failed check too.
        verdict = { ok: false, reason: "broken" };
      } finally {
        busy = false;
        step = 5;
        handle.update();
      }
    };

    /** Typing keeps the text; a new check is needed once anything ボブさん holds changes. */
    const edit = (name: FieldName, value: string) => {
      text[name] = value;
      if (verdict && name.startsWith("bob")) {
        verdict = null;
        handle.update();
      }
    };

    const reset = () => {
      set({
        alicePrivate: "",
        alicePublic: "",
        letter: LETTER,
        signature: "",
        bobPublic: "",
        bobLetter: "",
        bobSignature: "",
      });
      step = 0;
      verdict = null;
      problem = "";
      handle.update();
    };

    /** An editable box for one of the named texts. */
    const box = (
      name: FieldName,
      label: string,
      kind: "code" | "letter",
    ) => (
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

    /** Whether each button can be pressed: when what it needs is there. */
    const can = {
      sendKey: () => text.alicePublic !== "",
      sign: () => text.alicePrivate !== "",
      sendLetter: () => text.signature !== "",
      verify: () => text.bobPublic !== "" && text.bobSignature !== "",
    };

    return () => (
      <div>
        <div mix={sceneStyle}>
          <section mix={personStyle} aria-label="アリスさん">
            <PersonHead icon="user" name="アリスさん" note="手紙を送る人" />

            <Field
              label="ひみつのカギ（秘密鍵）"
              icon="key"
              secret
              use={signing ? "used" : null}
            >
              {box("alicePrivate", "アリスさんのひみつのカギ", "code")}
            </Field>
            <Field
              label="公開のカギ（公開鍵）"
              icon="publicKey"
              use={signing ? "unused" : null}
            >
              {box("alicePublic", "アリスさんの公開のカギ", "code")}
            </Field>
            <Field
              label="手紙"
              icon="notebook"
              use={signing ? "used" : null}
            >
              {box("letter", "アリスさんの手紙", "letter")}
            </Field>
            {signing
              ? (
                <p mix={mixStyle} aria-live="polite">
                  <span mix={mixRowStyle}>
                    <span mix={[mixItemStyle, mixKeyStyle]}>
                      <Icon name="key" />
                      ひみつのカギ
                    </span>
                    <span aria-hidden="true">＋</span>
                    <span mix={[mixItemStyle, mixLetterStyle]}>
                      <Icon name="notebook" />
                      手紙
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
              {box("signature", "アリスさんの電子署名", "code")}
            </Field>

            <div mix={actionsStyle}>
              <Action
                next={step === 0}
                done={step > 0}
                enabled={!busy}
                label="カギのペアを作る"
                onPress={makeKeys}
              />
              <Action
                next={step === 1}
                done={step > 1}
                enabled={!busy && can.sendKey()}
                label="公開のカギをボブさんに送る"
                onPress={sendKey}
              />
              <Action
                next={step === 2}
                done={step > 2}
                enabled={!busy && can.sign()}
                label="電子署名を作る"
                onPress={sign}
              />
              <Action
                next={step === 3}
                done={step > 3}
                enabled={!busy && can.sendLetter()}
                label="手紙と電子署名を送る"
                onPress={sendLetter}
              />
            </div>
          </section>

          <div mix={wireStyle} aria-label="通り道（インターネット）">
            <span mix={wireLabelStyle}>
              <Icon name="globe" />
              通り道
            </span>
            <span mix={wireLineStyle} aria-hidden="true" />
            {packet(step)}
          </div>

          <section mix={personStyle} aria-label="ボブさん">
            <PersonHead icon="user" name="ボブさん" note="手紙を受け取る人" />

            <Field label="アリスさんの公開のカギ" icon="publicKey">
              {box("bobPublic", "ボブさんが持っている公開のカギ", "code")}
            </Field>
            <Field label="とどいた手紙" icon="notebook">
              {box("bobLetter", "ボブさんにとどいた手紙", "letter")}
            </Field>
            <Field label="とどいた電子署名" icon="sign">
              {box("bobSignature", "ボブさんにとどいた電子署名", "code")}
            </Field>

            <div mix={actionsStyle}>
              <Action
                next={step === 4}
                done={false}
                enabled={!busy && can.verify()}
                label="公開のカギで確かめる"
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
                  ? "電子署名は合う：アリスさんが書いた、そのままの手紙"
                  : verdict.reason === "mismatch"
                  ? "エラー：電子署名が合わない。手紙か電子署名か公開のカギが、アリスさんが送ったものとちがう"
                  : "エラー：確かめられない。公開のカギか電子署名の文字がこわれている"}
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

/** What to do next, in a sentence, at each step. */
const captions: Record<Step, string> = {
  0: "まず、アリスさんが「カギのペアを作る」をおしてみよう。ひみつのカギと公開のカギが、2つでひと組できるよ。",
  1: "ひみつのカギは、アリスさんだけが持つ。公開のカギは、だれに見せてもいい。ボブさんに送ってあげよう。",
  2: "アリスさんが手紙を書くよ。文を自由に書きかえてもいい。書けたら、ひみつのカギで電子署名を作ろう。",
  3: "電子署名ができた。手紙とひみつのカギから作ったものだよ。手紙といっしょにボブさんへ送ろう。",
  4: "ボブさんに手紙と電子署名がとどいた。ボブさんは、前にもらった公開のカギで確かめてみよう。",
  5: "公開のカギで確かめると、アリスさんのひみつのカギで作った電子署名か、手紙が書きかえられていないかがわかるんだ。ボブさんの手紙や電子署名を1文字だけ書きかえて、もう一度確かめてみよう。",
};

/** The little card that rides along the wire for the most recent send. */
function packet(step: Step) {
  if (step === 2) {
    return (
      <span key="key" mix={packetStyle}>
        <Icon name="publicKey" />
        公開のカギ
      </span>
    );
  }
  if (step === 4) {
    return (
      <span key="letter" mix={packetStyle}>
        <Icon name="notebook" />
        手紙と電子署名
      </span>
    );
  }
  return null;
}
