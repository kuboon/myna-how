/**
 * The pieces the electronic-signature pictures share: the people, the labelled boxes, the step
 * buttons, their styles, and base64 for the keys and signatures they show.
 *
 * Not an island — the islands in `islands/` that draw a signature import it.
 */

import { css, type Handle, on } from "@remix-run/component";

import { buttonStyle, primaryStyle } from "./controls.tsx";
import { Icon, type IconName } from "./icons.tsx";
import { art, color, font, radius } from "../tokens.ts";

export const ALGORITHM = { name: "ECDSA", namedCurve: "P-256" } as const;
export const SIGN = { name: "ECDSA", hash: "SHA-256" } as const;

/**
 * J-LIS's key pair in these pictures. It is fixed, not made on a button press, because J-LIS's
 * keys exist long before any card is made and sign every card's certificate. It is a key made for
 * this site and written here in the open — the real J-LIS secret key never leaves J-LIS.
 */
export const JLIS_PUBLIC =
  "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE2eNwtyzGC2krNC0PY6jcvE35ipiYWEpwV+xSE36ai7N+yUWmczxD3xg51NDoKhtknGmJO8wxLq8UJAIaxRJggg==";

const JLIS_SECRET: JsonWebKey = {
  kty: "EC",
  crv: "P-256",
  d: "Wyg_TEYacYZjrU9AJ-D9ibeD7U_sYMMJz2uHyG7Ea0g",
  x: "2eNwtyzGC2krNC0PY6jcvE35ipiYWEpwV-xSE36ai7M",
  y: "fslFpnM8Q98YOdTQ6CobZJxpiTvMMS6vFCQCGsUSYII",
};

/** J-LIS's secret key, loaded so that it cannot be read back out. */
export function jlisSecretKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey("jwk", JLIS_SECRET, ALGORITHM, false, [
    "sign",
  ]);
}

/** How long the "making a signature" animation plays. */
export const SIGNING_MS = 1600;

/** Bytes as base64 — natively where the browser can, by hand where it is older. */
export function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  if (typeof bytes.toBase64 === "function") return bytes.toBase64();
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

export function fromBase64(text: string): Uint8Array<ArrayBuffer> {
  const clean = text.replace(/\s+/g, "");
  if (typeof Uint8Array.fromBase64 === "function") {
    return Uint8Array.fromBase64(clean) as Uint8Array<ArrayBuffer>;
  }
  return Uint8Array.from(atob(clean), (c) => c.charCodeAt(0));
}

/** A signature check that answers no, rather than throwing, when the inputs are not even the right shape. */
export async function safeVerify(
  key: CryptoKey,
  signature: string,
  data: string,
): Promise<boolean> {
  try {
    return await crypto.subtle.verify(
      SIGN,
      key,
      fromBase64(signature),
      new TextEncoder().encode(data),
    );
  } catch {
    return false;
  }
}

/** A public key from its base64 text, or null when the text is not one. */
export async function importPublic(text: string): Promise<CryptoKey | null> {
  try {
    return await crypto.subtle.importKey(
      "spki",
      fromBase64(text),
      ALGORITHM,
      false,
      ["verify"],
    );
  } catch {
    return null;
  }
}

export function PersonHead(
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

export function Field(
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
export function Action(
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

export const sceneStyle = css({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 5rem minmax(0, 1fr)",
  gap: "0.5rem",
  "@media (max-width: 640px)": { gridTemplateColumns: "1fr" },
});

export const personStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.6rem",
  padding: "0.8rem",
  borderRadius: radius.lg,
  background: color.card,
});

export const personHeadStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
  "& strong": { display: "block", fontFamily: font.round, fontWeight: 800 },
  "& small": { color: color.muted, fontSize: "0.8rem" },
});

export const avatarStyle = css({
  display: "grid",
  placeItems: "center",
  flex: "none",
  width: "2.8rem",
  height: "2.8rem",
  borderRadius: "999px",
  background: art.softBlue,
  color: color.accent,
});

export const fieldWrapStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
});

/** A box the signature is being made from: lit up in gold, pulsing. */
export const usedStyle = css({
  borderRadius: radius.md,
  animation: `use-glow ${SIGNING_MS / 2}ms ease-in-out 2`,
  "& textarea": { borderColor: art.gold, background: art.goldSoft },
});

/** The public key, which signing does not need: faded back. */
export const unusedStyle = css({ opacity: 0.35, transition: "opacity 300ms" });

/** The signature box, waiting for what is being made. */
export const madeStyle = css({
  "& textarea": { borderStyle: "dashed", borderColor: color.accent },
});

export const useTagStyle = css({
  marginLeft: "auto",
  padding: "0 0.5rem",
  borderRadius: "999px",
  background: art.goldLight,
  color: art.ink,
  fontSize: "0.7rem",
  whiteSpace: "nowrap",
});

export const idleTagStyle = css({
  marginLeft: "auto",
  padding: "0 0.5rem",
  borderRadius: "999px",
  background: color.surface,
  color: color.muted,
  fontSize: "0.7rem",
  whiteSpace: "nowrap",
});

/** 「ひみつのカギ ＋ 手紙 → 電子署名」, played out while signing. */
export const mixStyle = css({
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

export const mixRowStyle = css({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.35rem",
});

export const mixItemStyle = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
  padding: "0.15rem 0.6rem",
  borderRadius: "999px",
  whiteSpace: "nowrap",
});

export const mixKeyStyle = css({
  background: art.softRed,
  color: art.ng,
  animation: `pop-in 300ms ease-out both`,
});

export const mixLetterStyle = css({
  background: art.goldSoft,
  color: art.ink,
  animation: `pop-in 300ms ease-out 250ms both`,
});

export const mixArrowStyle = css({
  display: "inline-flex",
  color: color.accent,
  animation: `pop-in 300ms ease-out 600ms both`,
});

export const mixResultStyle = css({
  background: color.accent,
  color: color.onAccent,
  animation: `pop-in 400ms ease-out 900ms both`,
});

export const popStyle = css({ animation: "pop-in 400ms ease-out" });

export const labelStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.35rem",
  fontWeight: 700,
  fontSize: "0.85rem",
  color: color.accent,
});

export const secretLabelStyle = css({ color: art.ng });

export const onlyMeStyle = css({
  marginLeft: "auto",
  padding: "0 0.5rem",
  borderRadius: "999px",
  background: art.softRed,
  color: art.ng,
  fontSize: "0.7rem",
  whiteSpace: "nowrap",
});

export const fieldStyle = css({
  width: "100%",
  padding: "0.45rem 0.6rem",
  border: `2px solid ${color.line}`,
  borderRadius: radius.md,
  background: color.surface,
  color: color.fg,
  resize: "vertical",
});

export const codeStyle = css({
  fontFamily: font.mono,
  fontSize: "0.72rem",
  lineHeight: 1.4,
  wordBreak: "break-all",
});

export const letterStyle = css({
  fontFamily: "inherit",
  fontSize: "0.95rem",
  lineHeight: 1.6,
});

export const actionsStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.4rem",
});

export const actionStyle = css({ fontSize: "0.9rem", minHeight: "2.6rem" });

export const wireStyle = css({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.4rem",
  minHeight: "6rem",
});

export const wireLabelStyle = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
  color: color.muted,
  fontSize: "0.8rem",
  fontWeight: 700,
});

export const wireLineStyle = css({
  width: "100%",
  borderTop: `3px dashed ${color.line}`,
  "@media (max-width: 640px)": { width: "60%" },
});

export const packetStyle = css({
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

export const verdictStyle = css({
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

export const okStyle = css({ background: art.softGreen, color: art.ok });
export const ngStyle = css({ background: art.softRed, color: art.ng });

export const captionStyle = css({
  minHeight: "4.5rem",
  margin: "0.8rem 0 0.6rem",
  padding: "0.75rem 1rem",
  borderRadius: radius.md,
  background: color.card,
});

export const problemStyle = css({ background: art.softRed, color: art.ng });

export const footStyle = css({ display: "flex", justifyContent: "flex-end" });

/** A key that stays sealed inside something — the card's chip, J-LIS — shown but never readable. */
export const sealedBoxStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "0.35rem",
  padding: "0.7rem 0.8rem",
  borderRadius: radius.md,
  background: color.accent,
  color: color.onAccent,
  "& small": { fontSize: "0.8rem", lineHeight: 1.6, opacity: 0.9 },
});

export const sealedBusyStyle = css({
  animation: `use-glow ${SIGNING_MS / 2}ms ease-in-out 2`,
});

export const sealedHeadStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.35rem",
  fontFamily: font.round,
  fontWeight: 800,
  fontSize: "0.9rem",
});

export const sealedKeyStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.35rem",
  padding: "0.4rem 0.6rem",
  borderRadius: radius.md,
  background: art.goldLight,
  color: art.ink,
  fontWeight: 700,
  fontSize: "0.85rem",
});

export const placeholderStyle = css({
  margin: 0,
  padding: "0.45rem 0.6rem",
  border: `2px dashed ${color.line}`,
  borderRadius: radius.md,
  color: color.muted,
  fontSize: "0.85rem !important",
  lineHeight: "1.6 !important",
});
