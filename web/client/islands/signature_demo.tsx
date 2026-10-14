/**
 * The electronic-signature chapter's moving picture: an electronic signature, made and checked for real.
 *
 * アリスさん makes a key pair, sends the public key to ボブさん, writes a letter, signs it and
 * sends both; ボブさん checks the signature with the public key he was given. Every value on
 * screen is real: the keys and the signature come from the browser's Web Crypto (ECDSA P-256 with
 * SHA-256), shown as base64. Nothing is explained about how they are computed — the chapter is
 * about who holds what, and what the check proves.
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

/** How far the story has got. Each step needs the one before it. */
type Step = 0 | 1 | 2 | 3 | 4 | 5;

export const SignatureDemo = clientEntry(
  import.meta.url,
  function SignatureDemo(handle: Handle) {
    let step: Step = 0;
    let busy = false;
    let privateKey: CryptoKey | null = null;
    let alicePrivate = "";
    let alicePublic = "";
    let letter = LETTER;
    let signature = "";
    let bobPublic = "";
    let bobLetter = "";
    let bobSignature = "";
    let verdict: boolean | null = null;
    /** Something the browser could not do, said plainly. */
    let problem = "";
    /** Bumped on reset, so the letter's text area starts over with the default text. */
    let round = 0;

    const run = async (work: () => Promise<void>) => {
      busy = true;
      problem = "";
      handle.update();
      try {
        await work();
      } catch {
        problem =
          "このブラウザでは、カギや電子署名を作れなかったよ。新しいブラウザでためしてね。";
      } finally {
        busy = false;
        handle.update();
      }
    };

    const makeKeys = () =>
      run(async () => {
        const pair = await crypto.subtle.generateKey(ALGORITHM, true, [
          "sign",
          "verify",
        ]);
        privateKey = pair.privateKey;
        alicePrivate = toBase64(
          await crypto.subtle.exportKey("pkcs8", pair.privateKey),
        );
        alicePublic = toBase64(
          await crypto.subtle.exportKey("spki", pair.publicKey),
        );
        signature =
          bobPublic =
          bobLetter =
          bobSignature =
            "";
        verdict = null;
        step = 1;
      });

    const sendKey = () => {
      bobPublic = alicePublic;
      step = 2;
      handle.update();
    };

    const sign = () =>
      run(async () => {
        const data = new TextEncoder().encode(letter);
        signature = toBase64(
          await crypto.subtle.sign(SIGN, privateKey!, data),
        );
        step = 3;
      });

    const sendLetter = () => {
      bobLetter = letter;
      bobSignature = signature;
      verdict = null;
      step = 4;
      handle.update();
    };

    const verify = () =>
      run(async () => {
        const key = await crypto.subtle.importKey(
          "spki",
          fromBase64(bobPublic),
          ALGORITHM,
          false,
          ["verify"],
        );
        verdict = await crypto.subtle.verify(
          SIGN,
          key,
          fromBase64(bobSignature),
          new TextEncoder().encode(bobLetter),
        );
        step = 5;
      });

    const editLetter = (text: string) => {
      letter = text;
      // A signature belongs to the letter it was made for; a changed letter needs a new one.
      if (step >= 3) {
        signature = bobLetter = bobSignature = "";
        verdict = null;
        step = 2;
        handle.update();
      }
    };

    const reset = () => {
      step = 0;
      privateKey = null;
      alicePrivate = alicePublic = signature = "";
      bobPublic = bobLetter = bobSignature = "";
      letter = LETTER;
      verdict = null;
      problem = "";
      round += 1;
      handle.update();
    };

    return () => (
      <div>
        <div mix={sceneStyle}>
          <section mix={personStyle} aria-label="アリスさん">
            <PersonHead icon="user" name="アリスさん" note="手紙を送る人" />

            <Field label="ひみつのカギ（秘密鍵）" icon="key" secret>
              <Box text={alicePrivate} empty="まだない" />
            </Field>
            <Field label="公開のカギ（公開鍵）" icon="publicKey">
              <Box text={alicePublic} empty="まだない" />
            </Field>
            <Field label="手紙" icon="notebook">
              <textarea
                key={`letter-${round}`}
                mix={[
                  fieldStyle,
                  letterStyle,
                  on("input", (event) =>
                    editLetter(
                      (event.currentTarget as HTMLTextAreaElement).value,
                    )),
                ]}
                rows={4}
                defaultValue={LETTER}
                aria-label="アリスさんの手紙"
                disabled={step < 2}
              />
            </Field>
            <Field label="電子署名" icon="sign">
              <Box text={signature} empty="まだない" />
            </Field>

            <div mix={actionsStyle}>
              <Action
                at={0}
                step={step}
                busy={busy}
                label="カギのペアを作る"
                onPress={makeKeys}
              />
              <Action
                at={1}
                step={step}
                busy={busy}
                label="公開のカギをボブさんに送る"
                onPress={sendKey}
              />
              <Action
                at={2}
                step={step}
                busy={busy}
                label="電子署名を作る"
                onPress={sign}
              />
              <Action
                at={3}
                step={step}
                busy={busy}
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
              <Box text={bobPublic} empty="まだとどいていない" />
            </Field>
            <Field label="とどいた手紙" icon="notebook">
              <Box text={bobLetter} empty="まだとどいていない" plain />
            </Field>
            <Field label="とどいた電子署名" icon="sign">
              <Box text={bobSignature} empty="まだとどいていない" />
            </Field>

            <div mix={actionsStyle}>
              <Action
                at={4}
                step={step}
                busy={busy}
                label="公開のカギで確かめる"
                onPress={verify}
              />
            </div>

            {verdict === null ? null : (
              <p
                mix={[verdictStyle, verdict ? okStyle : ngStyle]}
                aria-live="polite"
              >
                <Icon name={verdict ? "check" : "x"} />
                {verdict
                  ? "電子署名は合う：アリスさんが書いた、そのままの手紙"
                  : "電子署名が合わない"}
              </p>
            )}
          </section>
        </div>

        <p mix={captionStyle} aria-live="polite">
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
  5: "公開のカギで確かめると、アリスさんのひみつのカギで作った電子署名か、手紙が書きかえられていないかがわかるんだ。",
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
    children: unknown;
  }>,
) {
  return () => (
    <div mix={fieldWrapStyle}>
      <span mix={[labelStyle, handle.props.secret ? secretLabelStyle : null]}>
        <Icon name={handle.props.icon} />
        {handle.props.label}
        {handle.props.secret
          ? <small mix={onlyMeStyle}>アリスさんだけ</small>
          : null}
      </span>
      {handle.props.children as never}
    </div>
  );
}

/** A read-only text field. Re-mounted when its text changes, so it always shows the latest. */
function Box(
  handle: Handle<{ text: string; empty: string; plain?: boolean }>,
) {
  return () => {
    const { text, empty, plain } = handle.props;
    if (!text) return <div mix={[fieldStyle, emptyStyle]}>{empty}</div>;
    return (
      <textarea
        key={text}
        mix={[fieldStyle, plain ? letterStyle : codeStyle, popStyle]}
        rows={plain ? 4 : 3}
        readOnly
        defaultValue={text}
      />
    );
  };
}

function Action(
  handle: Handle<{
    at: Step;
    step: Step;
    busy: boolean;
    label: string;
    onPress: () => void;
  }>,
) {
  return () => {
    const { at, step, busy, label, onPress } = handle.props;
    const next = step === at;
    return (
      <button
        type="button"
        mix={[
          buttonStyle,
          next ? primaryStyle : null,
          actionStyle,
          on("click", onPress),
        ]}
        disabled={!next || busy}
      >
        {step > at ? <Icon name="check" /> : null}
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
  "&:disabled": { opacity: 0.6 },
});

const emptyStyle = css({
  color: color.muted,
  fontSize: "0.85rem",
  borderStyle: "dashed",
});

const popStyle = css({ animation: "pop-in 300ms ease-out" });

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

const footStyle = css({ display: "flex", justifyContent: "flex-end" });
