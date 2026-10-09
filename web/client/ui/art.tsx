/**
 * The pictures more than one page draws: the card, its chip, a phone, a website window.
 *
 * Plain SVG, sized by their container, coloured from the `art` tokens so dark mode follows. They
 * render the same on the server and in an island.
 */

import type { Handle } from "@remix-run/component";

import { art } from "../tokens.ts";

/**
 * The front of a My Number Card, simplified: a photo, lines of text and the gold chip.
 *
 * The chip is drawn at a fixed place so a page can lay a button over it.
 */
export function CardFront(
  handle: Handle<{ highlightChip?: boolean; label?: string }>,
) {
  return () => (
    <svg
      viewBox="0 0 340 214"
      role="img"
      aria-label={handle.props.label ?? "マイナンバーカードのおもて"}
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <rect
        x="2"
        y="2"
        width="336"
        height="210"
        rx="16"
        fill="#f4f8ff"
        stroke="#9db8e8"
        stroke-width="3"
      />
      <rect x="2" y="2" width="336" height="34" rx="16" fill="#2f6fde" />
      <rect x="2" y="20" width="336" height="16" fill="#2f6fde" />
      <text x="20" y="25" fill="#fff" font-size="15" font-weight="700">
        個人番号カード
      </text>
      {/* name / address lines */}
      <rect x="20" y="54" width="150" height="10" rx="5" fill="#c7d4ea" />
      <rect x="20" y="74" width="190" height="10" rx="5" fill="#c7d4ea" />
      <rect x="20" y="94" width="120" height="10" rx="5" fill="#c7d4ea" />
      {
        /*
        chip — placed by the outer group and floated by the inner one: a CSS `transform`
        animation replaces the SVG `transform` attribute on the same element, which would
        drop the chip to the card's corner. Its colours are fixed, like the card's, so it
        stays gold on the light card in dark mode too.
      */
      }
      <g transform="translate(30 122)">
        <g
          style={handle.props.highlightChip
            ? { animation: "float 1.6s ease-in-out infinite" }
            : undefined}
        >
          <rect
            width="58"
            height="46"
            rx="8"
            fill="#f6d77a"
            stroke="#d9a520"
            stroke-width="3"
          />
          <path
            d="M0 23h58M29 0v46M14 0v12M44 0v12M14 46V34M44 46V34"
            stroke="#d9a520"
            stroke-width="2.5"
            fill="none"
          />
        </g>
      </g>
      {/* photo */}
      <rect
        x="244"
        y="52"
        width="76"
        height="96"
        rx="8"
        fill="#dce6f7"
        stroke="#9db8e8"
        stroke-width="2"
      />
      <circle cx="282" cy="86" r="18" fill="#9db8e8" />
      <path d="M252 144c4-20 18-30 30-30s26 10 30 30z" fill="#9db8e8" />
      <rect x="196" y="178" width="124" height="12" rx="6" fill="#c7d4ea" />
    </svg>
  );
}

/** A smartphone outline with a screen the caller fills. */
export function Phone(
  handle: Handle<{ label: string; screen?: string; vault?: boolean }>,
) {
  return () => (
    <svg
      viewBox="0 0 120 220"
      role="img"
      aria-label={handle.props.label}
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <rect
        x="4"
        y="4"
        width="112"
        height="212"
        rx="18"
        fill={art.ink}
        opacity="0.9"
      />
      <rect x="11" y="18" width="98" height="180" rx="8" fill={art.paper} />
      <rect x="45" y="9" width="30" height="5" rx="2.5" fill={art.paper} />
      {handle.props.screen
        ? (
          <text
            x="60"
            y="60"
            text-anchor="middle"
            font-size="30"
          >
            {handle.props.screen}
          </text>
        )
        : null}
      {handle.props.vault
        ? (
          <g transform="translate(30 120)">
            <rect
              width="60"
              height="52"
              rx="8"
              fill={art.goldLight}
              stroke={art.gold}
              stroke-width="3"
            />
            <circle
              cx="30"
              cy="26"
              r="11"
              fill="none"
              stroke={art.gold}
              stroke-width="3"
            />
            <path d="M30 15v22M19 26h22" stroke={art.gold} stroke-width="2" />
          </g>
        )
        : null}
    </svg>
  );
}
