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

import { clientEntry, css, type Handle, on } from "@remix-run/component";

import { buttonStyle, primaryStyle } from "../ui/controls.tsx";
import { Icon, type IconName } from "../ui/icons.tsx";
import { art, color, font, radius } from "../tokens.ts";

const LETTER = "ボブさんへ\nあしたの3時に、公園で会おうね。\nアリスより";

const ALGORITHM = { name: "ECDSA", namedCurve: "P-256" } as const;
const SIGN = { name: "ECDSA", hash: "SHA-256" } as const;

/** How long the "making a signature" animation plays. */
const SIGNING_MS = 1600;

/** Bytes as base64 — natively where the browser can, by hand where it is older. */
function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  if (typeof bytes.toBase64 === "function") return bytes.toBase64();
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function fromBase64(text: string): Uint8Array<ArrayBuffer> {
  const clean = text.replace(/\s+/g, "");
  if (typeof Uint8Array.fromBase64 === "function") {
    return Uint8Array.fromBase64(clean) as Uint8Array<ArrayBuffer>;
  }
  return Uint8Array.from(atob(clean), (c) => c.charCodeAt(0));
}

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

function PersonHead(
  handle: Handle<{ icon: IconName; name: string; note: string }>,
) {
  return () => (
    <div mix={personHeadStyle}>
      <span mix={avatarStyle} aria-hidden="true">
        <Icon name={handle.props.icon} size="1.6rem" />
      </span>
      <span>
        <strong>{handle.props.name}</strong>
        <small>{handle.props.note}</small>
      </span>
    </div>
  );
}

function Field(
  handle: Handle<{
    label: string;
    icon: IconName;
    secret?: boolean;
    /** What this box is doing while a signature is made, if anything. */
    use?: "used" | "unused" | "made" | null;
    children: unknown;
  }>,
) {
  return () => {
    const { use } = handle.props;
    return (
      <div
        mix={[
          fieldWrapStyle,
          use === "used" ? usedStyle : null,
          use === "unused" ? unusedStyle : null,
          use === "made" ? madeStyle : null,
        ]}
      >
        <span
          mix={[labelStyle, handle.props.secret ? secretLabelStyle : null]}
        >
          <Icon name={handle.props.icon} />
          {handle.props.label}
          {use === "used" ? <small mix={useTagStyle}>使う</small> : null}
          {use === "unused" ? <small mix={idleTagStyle}>使わない</small> : null}
          {handle.props.secret && !use
            ? <small mix={onlyMeStyle}>アリスさんだけ</small>
            : null}
        </span>
        {handle.props.children as never}
      </div>
    );
  };
}

/** One step's button: filled in blue when it is the one to press next. */
function Action(
  handle: Handle<{
    next: boolean;
    done: boolean;
    enabled: boolean;
    label: string;
    onPress: () => void;
  }>,
) {
  return () => {
    const { next, done, enabled, label, onPress } = handle.props;
    return (
      <button
        type="button"
        mix={[
          buttonStyle,
          next ? primaryStyle : null,
          actionStyle,
          on("click", onPress),
        ]}
        disabled={!enabled}
      >
        {done ? <Icon name="check" /> : null}
        {label}
      </button>
    );
  };
}

const sceneStyle = css({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 5rem minmax(0, 1fr)",
  gap: "0.5rem",
  "@media (max-width: 640px)": { gridTemplateColumns: "1fr" },
});

const personStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.6rem",
  padding: "0.8rem",
  borderRadius: radius.lg,
  background: color.card,
});

const personHeadStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
  "& strong": { display: "block", fontFamily: font.round, fontWeight: 800 },
  "& small": { color: color.muted, fontSize: "0.8rem" },
});

const avatarStyle = css({
  display: "grid",
  placeItems: "center",
  flex: "none",
  width: "2.8rem",
  height: "2.8rem",
  borderRadius: "999px",
  background: art.softBlue,
  color: color.accent,
});

const fieldWrapStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
});

/** A box the signature is being made from: lit up in gold, pulsing. */
const usedStyle = css({
  borderRadius: radius.md,
  animation: `use-glow ${SIGNING_MS / 2}ms ease-in-out 2`,
  "& textarea": { borderColor: art.gold, background: art.goldSoft },
});

/** The public key, which signing does not need: faded back. */
const unusedStyle = css({ opacity: 0.35, transition: "opacity 300ms" });

/** The signature box, waiting for what is being made. */
const madeStyle = css({
  "& textarea": { borderStyle: "dashed", borderColor: color.accent },
});

const useTagStyle = css({
  marginLeft: "auto",
  padding: "0 0.5rem",
  borderRadius: "999px",
  background: art.goldLight,
  color: art.ink,
  fontSize: "0.7rem",
  whiteSpace: "nowrap",
});

const idleTagStyle = css({
  marginLeft: "auto",
  padding: "0 0.5rem",
  borderRadius: "999px",
  background: color.surface,
  color: color.muted,
  fontSize: "0.7rem",
  whiteSpace: "nowrap",
});

/** 「ひみつのカギ ＋ 手紙 → 電子署名」, played out while signing. */
const mixStyle = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.35rem",
  margin: 0,
  padding: "0.5rem",
  borderRadius: radius.md,
  background: color.surface,
  fontWeight: 700,
  fontSize: "0.85rem !important",
});

const mixRowStyle = css({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.35rem",
});

const mixItemStyle = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
  padding: "0.15rem 0.6rem",
  borderRadius: "999px",
  whiteSpace: "nowrap",
});

const mixKeyStyle = css({
  background: art.softRed,
  color: art.ng,
  animation: `pop-in 300ms ease-out both`,
});

const mixLetterStyle = css({
  background: art.goldSoft,
  color: art.ink,
  animation: `pop-in 300ms ease-out 250ms both`,
});

const mixArrowStyle = css({
  display: "inline-flex",
  color: color.accent,
  animation: `pop-in 300ms ease-out 600ms both`,
});

const mixResultStyle = css({
  background: color.accent,
  color: color.onAccent,
  animation: `pop-in 400ms ease-out 900ms both`,
});

const popStyle = css({ animation: "pop-in 400ms ease-out" });

const labelStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.35rem",
  fontWeight: 700,
  fontSize: "0.85rem",
  color: color.accent,
});

const secretLabelStyle = css({ color: art.ng });

const onlyMeStyle = css({
  marginLeft: "auto",
  padding: "0 0.5rem",
  borderRadius: "999px",
  background: art.softRed,
  color: art.ng,
  fontSize: "0.7rem",
  whiteSpace: "nowrap",
});

const fieldStyle = css({
  width: "100%",
  padding: "0.45rem 0.6rem",
  border: `2px solid ${color.line}`,
  borderRadius: radius.md,
  background: color.surface,
  color: color.fg,
  resize: "vertical",
});

const codeStyle = css({
  fontFamily: font.mono,
  fontSize: "0.72rem",
  lineHeight: 1.4,
  wordBreak: "break-all",
});

const letterStyle = css({
  fontFamily: "inherit",
  fontSize: "0.95rem",
  lineHeight: 1.6,
});

const actionsStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.4rem",
});

const actionStyle = css({ fontSize: "0.9rem", minHeight: "2.6rem" });

const wireStyle = css({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.4rem",
  minHeight: "6rem",
});

const wireLabelStyle = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
  color: color.muted,
  fontSize: "0.8rem",
  fontWeight: 700,
});

const wireLineStyle = css({
  width: "100%",
  borderTop: `3px dashed ${color.line}`,
  "@media (max-width: 640px)": { width: "60%" },
});

const packetStyle = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
  padding: "0.2rem 0.5rem",
  borderRadius: "999px",
  background: color.accent,
  color: color.onAccent,
  fontSize: "0.75rem",
  fontWeight: 700,
  whiteSpace: "nowrap",
  animation: "travel-right 900ms ease-out both",
});

const verdictStyle = css({
  display: "flex",
  alignItems: "flex-start",
  gap: "0.4rem",
  margin: 0,
  padding: "0.5rem 0.7rem",
  borderRadius: radius.md,
  fontWeight: 700,
  fontSize: "0.95rem !important",
  lineHeight: "1.6 !important",
  animation: "pop-in 300ms ease-out",
});

const okStyle = css({ background: art.softGreen, color: art.ok });
const ngStyle = css({ background: art.softRed, color: art.ng });

const captionStyle = css({
  minHeight: "4.5rem",
  margin: "0.8rem 0 0.6rem",
  padding: "0.75rem 1rem",
  borderRadius: radius.md,
  background: color.card,
});

const problemStyle = css({ background: art.softRed, color: art.ng });

const footStyle = css({ display: "flex", justifyContent: "flex-end" });
