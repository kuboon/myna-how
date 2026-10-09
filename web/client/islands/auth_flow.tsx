/**
 * Chapter 4's moving picture: how a website checks that the card's owner is there.
 *
 * Told with the real names and no metaphor or arithmetic: the website sends a fresh question, the
 * chip attaches an electronic signature made with its secret key, and the website checks that
 * signature with the public key in the certificate, then asks J-LIS whether the certificate is
 * still valid. Two switches show why it is safe: a fake card has no secret key, and a signature
 * copied from last time was made for a different question.
 *
 * The signature shown is a stand-in — a short code derived from the question and whose key made
 * it — so the same card and question always give the same code and anything else gives another.
 */

import { clientEntry, css, type Handle, on } from "@remix-run/component";

import {
  buttonStyle,
  captionStyle,
  emphasize,
  primaryStyle,
  StepBar,
} from "../ui/controls.tsx";
import { Icon, type IconName } from "../ui/icons.tsx";
import { art, color, font, radius } from "../tokens.ts";

type Who = "real" | "fake" | "replay";

/** A stand-in signature: looks like a jumble, depends on the question and on whose key made it. */
function signatureOf(question: string, key: string): string {
  let h = 2166136261;
  for (const ch of key + ":" + question) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  let out = "";
  for (let i = 0; i < 4; i++) {
    out += (h >>> (i * 8) & 0xff).toString(16).padStart(2, "0");
    h = Math.imul(h ^ (h >>> 13), 2246822507) >>> 0;
  }
  return `${out.slice(0, 4)}…${out.slice(4)}`;
}

const REAL_KEY = "card";
const FAKE_KEY = "fake";

/** The first question, fixed so the server and the browser render the same thing. */
const FIRST_QUESTION = "4 8 1 5 2";
function newQuestion(not?: string): string {
  for (;;) {
    const n = crypto.getRandomValues(new Uint32Array(1))[0] % 100000;
    const q = String(n).padStart(5, "0").split("").join(" ");
    if (q !== not) return q;
  }
}

const captions = [
  "サイトに「マイナカードでログイン」とおすと、サイトは<毎回ちがう「問題」>を作って、カードに送ってくるよ。",
  "暗証番号が合ったら、チップは中の<ひみつのカギ（秘密鍵）>を使って、問題に<電子署名>をつける。電子署名は、そのカードのひみつのカギでしか作れないしるしなんだ。",
  "チップは、<電子署名>と<電子証明書>をサイトに送る。ひみつのカギは送らない。チップの外には一度も出ないよ。",
  "サイトは、電子証明書にのっている<公開のカギ（公開鍵）>で、電子署名をたしかめる。公開のカギでは電子署名は作れないけれど、<その電子証明書とペアのひみつのカギで作られたかどうか>はわかるんだ。",
  "さいごに<J-LIS（カードを発行しているところ）>に「この電子証明書、<本当に J-LIS が出したもの？ まだ使える？>」と聞く。OK なら、ログインできる！",
];

/** The eavesdropper's story: watch the first login, replay its signature on the second. */
const replayCaptions = [
  "<1 回目>：本物のカードの持ち主がログインする。サイトは問題 <{A}> を送る。でも、とちゅうで<のぞき見している人>がいる……！",
  "チップは問題 {A} に電子署名をつけて返す。サイトがたしかめて OK、ログインできた。でも、のぞき見した人は、その電子署名を<こっそりメモ>してしまった。",
  "<2 回目>：こんどは、のぞき見した人が、持ち主のふりをしてログインしようとする。サイトは<新しい問題 {B}> を出すよ。",
  "のぞき見した人は、ひみつのカギを持っていない。だから、メモしておいた<問題 {A} の電子署名>を、そのまま返す。",
  "サイトがたしかめると……<合わない！> この電子署名は問題 {A} につけたもので、問題 {B} につけたものじゃないから。<毎回ちがう問題を出す>のは、このためなんだ。",
];

export const AuthFlow = clientEntry(
  import.meta.url,
  function AuthFlow(handle: Handle) {
    let step = 0;
    let who: Who = "real";
    let question = FIRST_QUESTION;
    /** The replay story's first-login question; `question` is the second login's. */
    let firstQuestion = FIRST_QUESTION;

    const total = () =>
      who === "replay" ? replayCaptions.length : captions.length;

    const go = (next: number) => {
      step = Math.max(0, Math.min(total() - 1, next));
      handle.update();
    };

    const choose = (w: Who) => {
      who = w;
      step = 0;
      firstQuestion = newQuestion();
      question = newQuestion(firstQuestion);
      handle.update();
    };

    return () => {
      // A fake card can make its own key pair and certificate, so its signature matches the
      // public key in that certificate. What it cannot get is J-LIS vouching for the certificate.
      const key = who === "fake" ? FAKE_KEY : REAL_KEY;
      const signature = signatureOf(question, key);
      const registered = who === "real";

      return (
        <div>
          <div
            mix={chooserStyle}
            role="group"
            aria-label="だれがログインする？"
          >
            {(
              [
                ["real", "user", "本物のカード"],
                ["fake", "userX", "にせものカード"],
                ["replay", "peeker", "のぞき見して使い回す"],
              ] as const
            ).map(([w, icon, label]) => (
              <button
                key={w}
                type="button"
                aria-pressed={who === w ? "true" : "false"}
                mix={[
                  buttonStyle,
                  chooserButtonStyle,
                  on("click", () => choose(w)),
                ]}
              >
                <Icon name={icon} />
                {label}
              </button>
            ))}
          </div>

          {who === "replay"
            ? (
              <ReplayScene
                step={step}
                first={firstQuestion}
                second={question}
              />
            )
            : (
              <div mix={sceneStyle}>
                <div mix={partyStyle}>
                  <PartyHead icon="monitor" name="サイト" />
                  <div mix={boardStyle}>
                    <small>今回の問題</small>
                    <span mix={questionStyle}>{question}</span>
                    {step >= 3
                      ? (
                        <>
                          <small>公開のカギでたしかめると…</small>
                          <span
                            key={`v-${who}-${question}`}
                            mix={[verdictStyle, okStyle]}
                          >
                            <Icon name="check" />電子署名は合う
                          </span>
                        </>
                      )
                      : null}
                    {step >= 4
                      ? (
                        <span
                          key={`jlis-${who}`}
                          mix={[verdictStyle, registered ? okStyle : ngStyle]}
                        >
                          <Icon name={registered ? "check" : "x"} />
                          {registered
                            ? "J-LIS「まだ使えるよ」→ ログインOK"
                            : "J-LIS「そんな電子証明書は出していない」→ ログインできない"}
                        </span>
                      )
                      : null}
                  </div>
                </div>

                <div mix={wireStyle} aria-hidden="true">
                  {step === 0
                    ? (
                      <Packet
                        key={`q-${question}`}
                        dir="toCard"
                        icons={["question"]}
                      />
                    )
                    : step === 2
                    ? (
                      <Packet
                        key="s"
                        dir="toSite"
                        icons={["sign", "certificate"]}
                      />
                    )
                    : null}
                </div>

                <div mix={partyStyle}>
                  {who === "fake"
                    ? <PartyHead icon="userX" name="にせものカード" bad />
                    : <PartyHead icon="card" name="カードのチップ" />}
                  <div mix={boardStyle}>
                    <small>もっているもの</small>
                    <span mix={tokenStyle}>
                      <Icon name="key" />
                      {who === "fake"
                        ? "自分で作ったひみつのカギ"
                        : "ひみつのカギ（中だけ）"}
                    </span>
                    <span mix={tokenStyle}>
                      <Icon name="certificate" />
                      {who === "fake"
                        ? "自分で作ったにせの電子証明書"
                        : "J-LIS が出した電子証明書"}
                    </span>
                    {step >= 1
                      ? (
                        <>
                          <small>つけた電子署名</small>
                          <span
                            key={`sig-${who}-${question}`}
                            mix={signatureStyle}
                          >
                            <Icon name="sign" />
                            {signature}
                          </span>
                        </>
                      )
                      : null}
                  </div>
                </div>
              </div>
            )}

          <p key={`c-${step}-${who}`} mix={captionStyle} aria-live="polite">
            {emphasize(
              who === "replay"
                ? replayCaptions[step]
                  .replaceAll("{A}", firstQuestion)
                  .replaceAll("{B}", question)
                : captions[step],
            )}
            {step === 3 && who === "fake"
              ? (
                <>
                  <br />
                  <strong>
                    にせものカードも、ひみつのカギと公開のカギのペアや、それらしい電子証明書は自分で作れる。
                  </strong>
                  だから、電子署名のたしかめだけなら通ってしまうんだ。
                </>
              )
              : null}
            {step >= 4 && who === "fake"
              ? (
                <>
                  <br />
                  <strong>
                    でも、その電子証明書は J-LIS が出したものじゃない。
                  </strong>
                  {"J-LIS に聞くと「知らない」と言われるので、ログインできないよ。だから最後のたしかめが大事なんだ。"}
                </>
              )
              : null}
          </p>
          <StepBar step={step} total={total()} onGo={go} />
          {step === total() - 1
            ? (
              <p mix={againStyle}>
                <button
                  type="button"
                  mix={[
                    buttonStyle,
                    primaryStyle,
                    on("click", () => choose(who)),
                  ]}
                >
                  <Icon name="question" />
                  ちがう問題でもう一回
                </button>
              </p>
            )
            : null}
        </div>
      );
    };
  },
);

/** A party's icon tile and name: stacked on wide screens, side by side on a phone. */
function PartyHead(
  handle: Handle<{ icon: IconName; name: string; bad?: boolean }>,
) {
  return () => {
    const { icon, name, bad } = handle.props;
    return (
      <div mix={partyHeadStyle}>
        <span
          mix={[partyIconStyle, bad ? badIconStyle : undefined]}
          aria-hidden="true"
        >
          {icon === "card" ? <MiniCard /> : <Icon name={icon} size="1.9rem" />}
        </span>
        <strong mix={bad ? badNameStyle : undefined}>{name}</strong>
      </div>
    );
  };
}

/** The card, small: card blue with the gold chip. */
function MiniCard() {
  return () => (
    <svg viewBox="0 0 40 28" width="2.4rem" height="1.7rem" aria-hidden="true">
      <rect
        x="1"
        y="1"
        width="38"
        height="26"
        rx="4"
        style={{ fill: color.accent }}
      />
      <rect
        x="6"
        y="9"
        width="10"
        height="8"
        rx="1.5"
        style={{ fill: art.gold, stroke: art.goldLight }}
        stroke-width="1"
      />
      <path
        d="M21 11h12M21 16h8"
        style={{ stroke: color.onAccent }}
        stroke-width="2"
        stroke-linecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

/**
 * Something on its way between the website (above / left) and the card (below / right). The arrow
 * points sideways on a wide screen and up or down once the parties stack on a phone.
 */
function Packet(
  handle: Handle<{ dir: "toCard" | "toSite"; icons: readonly IconName[] }>,
) {
  return () => {
    const { dir, icons } = handle.props;
    const toCard = dir === "toCard";
    const stuff = icons.map((name) => <Icon key={name} name={name} />);
    return (
      <span mix={[packetStyle, toCard ? toRightStyle : toLeftStyle]}>
        {toCard ? null : (
          <>
            <span mix={wideOnlyStyle}>
              <Icon name="arrowLeft" />
            </span>
            <span mix={narrowOnlyStyle}>
              <Icon name="arrowUp" />
            </span>
          </>
        )}
        {stuff}
        {toCard
          ? (
            <>
              <span mix={wideOnlyStyle}>
                <Icon name="arrowRight" />
              </span>
              <span mix={narrowOnlyStyle}>
                <Icon name="arrowDown" />
              </span>
            </>
          )
          : null}
      </span>
    );
  };
}

/**
 * The replay story: the eavesdropper stands between the website and the card, copies the first
 * login's signature, and hands it back when the website asks a new question.
 */
function ReplayScene(
  handle: Handle<{ step: number; first: string; second: string }>,
) {
  return () => {
    const { step, first, second } = handle.props;
    const stolen = signatureOf(first, REAL_KEY);
    const secondRound = step >= 2;
    // What travels on each wire this step, if anything.
    const siteWire = step === 0 || step === 2
      ? <Packet key={`a-${step}`} dir="toCard" icons={["question"]} />
      : step === 1 || step === 3
      ? <Packet key={`b-${step}`} dir="toSite" icons={["sign"]} />
      : null;
    const cardWire = step === 0
      ? <Packet key="c" dir="toCard" icons={["question"]} />
      : step === 1
      ? <Packet key="d" dir="toSite" icons={["sign"]} />
      : null;
    return (
      <div mix={replaySceneStyle}>
        <div mix={[partyStyle, replayPartyStyle]}>
          <PartyHead icon="monitor" name="サイト" />
          <div mix={boardStyle}>
            <small>{secondRound ? "2 回目の問題" : "1 回目の問題"}</small>
            <span
              key={`q-${secondRound}`}
              mix={[questionStyle, compactQuestionStyle, popStyle]}
            >
              {secondRound ? second : first}
            </span>
            {step === 1
              ? (
                <span mix={[verdictStyle, okStyle]}>
                  <Icon name="check" />本物。ログインOK
                </span>
              )
              : null}
            {step >= 4
              ? (
                <>
                  <small>公開のカギでたしかめると…</small>
                  <span mix={[verdictStyle, ngStyle]}>
                    <Icon name="x" />合わない
                  </span>
                </>
              )
              : null}
          </div>
        </div>

        <div mix={[connectorStyle, narrowOnlyStyle]} aria-hidden="true">
          {siteWire}
        </div>

        <div mix={[partyStyle, replayPartyStyle, eveStyle]}>
          <PartyHead icon="peeker" name="のぞき見した人" bad />
          <div mix={wireRowStyle} aria-hidden="true">
            {siteWire}
          </div>
          <div mix={[boardStyle, eveBoardStyle]}>
            <small>
              <Icon name={step === 0 ? "eye" : "notebook"} />
              {step === 0 ? " 見ている…" : " こっそりメモ"}
            </small>
            {step >= 1
              ? (
                <>
                  <small>問題 {first} の電子署名</small>
                  <span key="memo" mix={signatureStyle}>
                    <Icon name="sign" />
                    {stolen}
                  </span>
                </>
              )
              : null}
            {step >= 3
              ? <span mix={[verdictStyle, ngStyle]}>これをそのまま返す</span>
              : null}
          </div>
        </div>

        <div mix={[connectorStyle, narrowOnlyStyle]} aria-hidden="true">
          {cardWire}
        </div>

        <div
          mix={[
            partyStyle,
            replayPartyStyle,
            secondRound ? awayStyle : undefined,
          ]}
        >
          <PartyHead icon="card" name="カードのチップ" />
          <div mix={boardStyle}>
            {secondRound ? <small>2 回目は、ここにいない</small> : (
              <>
                <span mix={tokenStyle}>
                  <Icon name="key" />ひみつのカギ（中だけ）
                </span>
                {step >= 1
                  ? (
                    <>
                      <small>つけた電子署名</small>
                      <span mix={signatureStyle}>
                        <Icon name="sign" />
                        {stolen}
                      </span>
                    </>
                  )
                  : null}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };
}

/** Where the parties stop sitting side by side and stack instead. */
const narrow = "@media (max-width: 560px)";

const wideOnlyStyle = css({ [narrow]: { display: "none" } });
const narrowOnlyStyle = css({ display: "none", [narrow]: { display: "flex" } });

const chooserStyle = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "0.4rem",
  marginBottom: "0.75rem",
});

const chooserButtonStyle = css({
  minHeight: "2.5rem",
  padding: "0.3rem 0.9rem",
  fontSize: "0.9rem",
  borderRadius: "999px",
  border: `2px solid ${color.line}`,
  background: color.surface,
  '&[aria-pressed="true"]': {
    background: color.accent,
    borderColor: color.accent,
    color: color.onAccent,
  },
  '&[aria-pressed="true"]:hover:not(:disabled)': {
    color: color.onAccent,
    borderColor: color.accentStrong,
  },
});

const sceneStyle = css({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 3.5rem minmax(0, 1fr)",
  alignItems: "start",
  gap: "0.25rem",
  [narrow]: { gridTemplateColumns: "minmax(0, 1fr)", gap: 0 },
});

const partyStyle = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.4rem",
  textAlign: "center",
  [narrow]: { alignItems: "stretch", textAlign: "left" },
});

const partyHeadStyle = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.3rem",
  fontFamily: font.round,
  [narrow]: { flexDirection: "row", gap: "0.6rem" },
});

const partyIconStyle = css({
  display: "grid",
  placeItems: "center",
  width: "3.25rem",
  height: "3.25rem",
  flex: "none",
  borderRadius: radius.md,
  background: art.softBlue,
  color: color.accent,
  [narrow]: { width: "2.75rem", height: "2.75rem" },
});

const badIconStyle = css({ background: art.softRed, color: art.ng });
const badNameStyle = css({ color: art.ng });

const boardStyle = css({
  width: "100%",
  minHeight: "10rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.3rem",
  padding: "0.6rem",
  borderRadius: radius.md,
  background: color.card,
  border: `1px solid ${color.border}`,
  "& small": { color: color.muted, fontSize: "0.75rem" },
  [narrow]: { minHeight: 0, alignItems: "flex-start" },
});

const questionStyle = css({
  fontFamily: font.mono,
  fontWeight: 800,
  fontSize: "1.1rem",
  letterSpacing: "0.05em",
  whiteSpace: "nowrap",
});

const tokenStyle = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.3rem",
  padding: "0.15rem 0.6rem",
  borderRadius: "999px",
  background: art.goldLight,
  color: art.ink,
  fontWeight: 700,
  fontSize: "0.8rem",
});

const signatureStyle = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.3rem",
  padding: "0.15rem 0.5rem",
  borderRadius: radius.sm,
  border: `2px solid ${color.accent}`,
  background: color.surface,
  color: color.accent,
  fontFamily: font.mono,
  fontWeight: 800,
  fontSize: "0.95rem",
  whiteSpace: "nowrap",
  animation: "pop-in 400ms ease-out",
});

const verdictStyle = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.3rem",
  padding: "0.2rem 0.7rem",
  borderRadius: "999px",
  fontFamily: font.round,
  fontWeight: 800,
  fontSize: "0.85rem",
  animation: "pop-in 350ms ease-out",
});

const okStyle = css({ background: art.softGreen, color: art.ok });
const ngStyle = css({ background: art.softRed, color: art.ng });

const wireStyle = css({
  alignSelf: "center",
  display: "flex",
  justifyContent: "center",
  height: "2rem",
  borderBottom: `3px dotted ${color.line}`,
  [narrow]: {
    alignSelf: "center",
    width: 0,
    height: "2.75rem",
    borderBottom: 0,
    borderLeft: `3px dotted ${color.line}`,
    alignItems: "center",
  },
});

const packetStyle = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.15rem",
  color: color.accent,
  fontSize: "1.1rem",
  whiteSpace: "nowrap",
  [narrow]: {
    padding: "0.15rem 0.4rem",
    borderRadius: "999px",
    background: color.surface,
    border: `2px solid ${color.line}`,
  },
});

const toRightStyle = css({
  animation: "travel-right 1.2s ease-in-out infinite",
  [narrow]: { animation: "float 1.2s ease-in-out infinite" },
});
const toLeftStyle = css({
  animation: "travel-left 1.2s ease-in-out infinite",
  [narrow]: { animation: "float 1.2s ease-in-out infinite" },
});

const replaySceneStyle = css({
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  alignItems: "start",
  gap: "0.3rem",
  "& > div > div": { paddingInline: "0.35rem" },
  [narrow]: {
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: 0,
    "& > div > div": { paddingInline: 0 },
  },
});

/** On a phone, each party is one row: icon on the left, name and what it has on the right. */
const replayPartyStyle = css({
  [narrow]: {
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr)",
    columnGap: "0.6rem",
    alignItems: "start",
    padding: "0.6rem",
    borderRadius: radius.md,
    background: color.card,
    border: `1px solid ${color.border}`,
    "& > div:first-child": { display: "contents" },
    "& > div:first-child > span": { gridRow: "span 2" },
    "& > div:last-child": {
      gridColumn: "2",
      padding: 0,
      background: "transparent",
      border: 0,
    },
  },
});

const eveStyle = css({
  [narrow]: {
    background: art.softRed,
    border: `2px dashed ${art.ng}`,
  },
});

const eveBoardStyle = css({
  background: art.softRed,
  borderStyle: "dashed",
  borderColor: art.ng,
});

const connectorStyle = css({
  justifyContent: "center",
  alignItems: "center",
  height: "2.75rem",
  marginInline: "auto",
  borderLeft: `3px dotted ${color.line}`,
  width: 0,
  overflow: "visible",
});

const wireRowStyle = css({
  display: "flex",
  justifyContent: "center",
  width: "100%",
  height: "1.6rem",
  borderBottom: `3px dotted ${color.line}`,
  [narrow]: { display: "none" },
});

const compactQuestionStyle = css({
  fontSize: "0.95rem",
  letterSpacing: 0,
});

const awayStyle = css({ opacity: 0.4 });

const popStyle = css({ animation: "pop-in 350ms ease-out" });

const againStyle = css({ textAlign: "center" });
