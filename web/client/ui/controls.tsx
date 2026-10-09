/**
 * Small controls the islands share: the step-through bar and a plain button style.
 *
 * Not islands themselves — they are placed inside one, so their callbacks never cross the
 * server/browser boundary. They live outside `islands/` because every file there is bundled as an
 * entrypoint of its own.
 */

import { css, type Handle, on } from "@remix-run/component";

import { art, color, font, radius } from "../tokens.ts";
import { Icon } from "./icons.tsx";

/** "もどる / すすむ", with a dot per step between them. */
export function StepBar(
  handle: Handle<{
    step: number;
    total: number;
    onGo: (step: number) => void;
  }>,
) {
  return () => {
    const { step, total, onGo } = handle.props;
    return (
      <div mix={barStyle}>
        <button
          type="button"
          mix={[buttonStyle, on("click", () => onGo(step - 1))]}
          disabled={step === 0}
        >
          <Icon name="arrowLeft" /> もどる
        </button>
        <div mix={dotsStyle} aria-label={`${total}こ中${step + 1}こめ`}>
          {Array.from({ length: total }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`${i + 1}こめへ`}
              aria-current={i === step ? "step" : undefined}
              mix={[dotStyle, on("click", () => onGo(i))]}
            />
          ))}
        </div>
        {step < total - 1
          ? (
            <button
              type="button"
              mix={[
                buttonStyle,
                primaryStyle,
                on("click", () => onGo(step + 1)),
              ]}
            >
              すすむ <Icon name="arrowRight" />
            </button>
          )
          : (
            <button
              type="button"
              mix={[buttonStyle, on("click", () => onGo(0))]}
            >
              <Icon name="restart" /> さいしょから
            </button>
          )}
      </div>
    );
  };
}

/** `<…>` in a caption becomes bold — keeps the islands' step tables readable. */
export function emphasize(text: string) {
  return text.split(/(<[^>]+>)/).map((part, i) =>
    part.startsWith("<") ? <strong key={i}>{part.slice(1, -1)}</strong> : part
  );
}

/** A rounded, chunky button that is easy to hit with a thumb. */
export const buttonStyle = css({
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.4rem",
  padding: "0.4rem 1.2rem",
  minHeight: "3rem",
  border: `2px solid ${color.line}`,
  borderRadius: "999px",
  background: color.surface,
  color: color.fg,
  fontFamily: font.round,
  fontWeight: 800,
  fontSize: "1rem",
  "&:hover:not(:disabled)": { borderColor: color.accent, color: color.accent },
  "&:active:not(:disabled)": { transform: "translateY(1px)" },
  "&:disabled": { opacity: 0.4, cursor: "not-allowed" },
});

/** Composed after {@link buttonStyle} for the one thing to press next. */
export const primaryStyle = css({
  borderColor: color.accent,
  background: color.accent,
  color: color.onAccent,
  "&:hover:not(:disabled)": {
    color: color.onAccent,
    borderColor: color.accentStrong,
    background: color.accentStrong,
  },
});

/** Composed after {@link buttonStyle} for a "やってみよう、でもこれは悪いこと" button. */
export const dangerStyle = css({
  borderColor: art.ng,
  color: art.ng,
  "&:hover:not(:disabled)": { background: art.softRed, color: art.ng },
});

/** The speech under a picture: what is happening on this step. */
export const captionStyle = css({
  minHeight: "5.5rem",
  margin: "0.75rem 0",
  padding: "0.75rem 1rem",
  borderRadius: radius.md,
  background: color.card,
  fontSize: "1.05rem",
  lineHeight: 1.8,
  animation: "pop-in 300ms ease-out",
  "& strong": { color: color.accent },
});

const barStyle = css({
  display: "flex",
  "& > button": { whiteSpace: "nowrap", paddingInline: "1rem" },
  "@media (max-width: 420px)": {
    gap: "0.35rem",
    "& > button": { paddingInline: "0.75rem", fontSize: "0.9rem" },
  },
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.5rem",
});

const dotsStyle = css({
  display: "flex",
  flexWrap: "nowrap",
  justifyContent: "center",
  gap: "0.4rem",
});

const dotStyle = css({
  width: "0.6rem",
  height: "0.6rem",
  padding: 0,
  border: 0,
  borderRadius: "999px",
  background: color.line,
  cursor: "pointer",
  transition: "width 200ms",
  // A bigger hit area than the dot itself.
  outlineOffset: "4px",
  '&[aria-current="step"]': {
    width: "1.75rem",
    background: color.accent,
  },
});
