/**
 * Chapter 1's moving picture: open the chip, and walk through its rooms.
 *
 * The chip is drawn as a little building of rooms (the real name is "アプリケーション", AP). Each
 * room says what it keeps, what locks it, and what it is used for. A last door lists what is NOT in
 * the chip at all, which is the question people most often get wrong.
 */

import { clientEntry, css, type Handle, on } from "@remix-run/component";

import { CardFront } from "../ui/art.tsx";
import { buttonStyle, primaryStyle } from "../ui/controls.tsx";
import { Icon, type IconName } from "../ui/icons.tsx";
import { art, color, font, radius } from "../tokens.ts";

interface Room {
  id: string;
  icon: IconName;
  name: string;
  /** The real name, for the grown-ups. */
  real: string;
  like: string;
  keeps: string[];
  lock: string;
  uses: string;
}

const rooms: Room[] = [
  {
    id: "sign",
    icon: "sign",
    name: "ネットの「実印」の部屋",
    real: "（署名用電子証明書）",
    like:
      "ネットで大事な書類を出すときに「わたしが出しました」と証明する、自分だけのカギ。",
    keeps: [
      "ひみつのカギ（外には出ない）",
      "電子証明書：名前・住所・生年月日・性別",
    ],
    lock: "英字と数字の6〜16文字の暗証番号。5回まちがえるとロック。",
    uses: "税金の申告（e-Tax）や、ネットでの申しこみなど。",
  },
  {
    id: "login",
    icon: "door",
    name: "ログインの「合いカギ」の部屋",
    real: "（利用者証明用電子証明書）",
    like: "「わたしはこのカードの持ち主です」と伝えるための合いカギ。",
    keeps: [
      "ひみつのカギ（外には出ない）",
      "電子証明書：名前や住所は書いていない！番号だけ",
    ],
    lock: "4けたの暗証番号。3回まちがえるとロック。",
    uses:
      "マイナポータルへのログイン、コンビニで住民票をとる、病院の受付など。",
  },
  {
    id: "memo",
    icon: "notebook",
    name: "書きうつし用「メモ」の部屋",
    real: "（券面事項入力補助アプリケーション）",
    like: "申しこみ書に名前や住所を手で書くかわりに、読みとってもらうメモ。",
    keeps: ["マイナンバー（12けた）", "名前・住所・生年月日・性別（文字）"],
    lock: "4けたの暗証番号。3回まちがえるとロック。",
    uses: "ネットの申しこみで、名前や住所を自動で入れるとき。",
  },
  {
    id: "face",
    icon: "image",
    name: "カードの「うつし絵」の部屋",
    real: "（券面アプリケーション）",
    like: "カードのおもてとうらに書いてあることの、そっくりな写し。",
    keeps: ["顔写真", "名前・住所・生年月日・性別", "マイナンバー"],
    lock: "カードに書いてある番号などを入れないと開かない。",
    uses: "窓口で、カードがにせものじゃないか確かめるとき。",
  },
  {
    id: "free",
    icon: "box",
    name: "あき部屋",
    real: "（空き領域：市区町村や国の機関などが使う）",
    like: "市や町が、図書館カードなどのサービスに使えるように空けてある部屋。",
    keeps: ["使うサービスによってちがう"],
    lock: "使うサービスごとに決められる。",
    uses: "自治体のサービスなど（どこでも使えるわけではない）。",
  },
];

/** What people think is in the chip, and is not. */
const notInside: { icon: IconName; label: string }[] = [
  { icon: "yen", label: "税金や給料のこと" },
  { icon: "medical", label: "病気やお薬のきろく" },
  { icon: "user", label: "年金のこと" },
  { icon: "landmark", label: "銀行のお金" },
  { icon: "book", label: "学校の成績" },
  { icon: "pin", label: "いまいる場所" },
];

export const InsideExplorer = clientEntry(
  import.meta.url,
  function InsideExplorer(handle: Handle) {
    let open = false;
    let selected: string | null = null;

    const pick = (id: string) => {
      selected = id;
      handle.update();
    };

    return () => {
      const room = rooms.find((r) => r.id === selected) ?? null;
      return (
        <div>
          <div mix={cardRowStyle}>
            <div mix={cardWrapStyle}>
              <CardFront highlightChip={!open} />
            </div>
            <div mix={cardSideStyle}>
              {open
                ? (
                  <p>
                    {"チップの中は、"}
                    <strong>5つの部屋</strong>
                    {"に分かれているよ。とびらをタップしてみよう。"}
                  </p>
                )
                : (
                  <>
                    <p>
                      {"左の金色の四角が"}
                      <strong>ICチップ</strong>
                      {"。小さなコンピューターだよ。"}
                    </p>
                    <button
                      type="button"
                      mix={[
                        buttonStyle,
                        primaryStyle,
                        pulseStyle,
                        on("click", () => {
                          open = true;
                          handle.update();
                        }),
                      ]}
                    >
                      <Icon name="search" /> チップの中を見る
                    </button>
                  </>
                )}
            </div>
          </div>

          {open
            ? (
              <div mix={buildingStyle}>
                <div mix={doorsStyle}>
                  {rooms.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      aria-pressed={selected === r.id ? "true" : "false"}
                      mix={[doorStyle, on("click", () => pick(r.id))]}
                    >
                      <span mix={doorIconStyle}>
                        <Icon name={r.icon} size={22} />
                      </span>
                      <span>{r.name}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    aria-pressed={selected === "none" ? "true" : "false"}
                    mix={[
                      doorStyle,
                      noDoorStyle,
                      on("click", () => pick("none")),
                    ]}
                  >
                    <span mix={[doorIconStyle, noIconStyle]}>
                      <Icon name="ban" size={22} />
                    </span>
                    <span>入っていないもの</span>
                  </button>
                </div>

                {room
                  ? (
                    <div key={room.id} mix={panelStyle}>
                      <h3 mix={panelTitleStyle}>
                        <span mix={titleIconStyle}>
                          <Icon name={room.icon} size={22} />
                        </span>
                        {room.name}
                      </h3>
                      <p mix={realStyle}>本当の名前{room.real}</p>
                      <p>{room.like}</p>
                      <dl mix={dlStyle}>
                        <dt>
                          <Icon name="box" /> しまってあるもの
                        </dt>
                        <dd>
                          <ul>
                            {room.keeps.map((k) => <li key={k}>{k}</li>)}
                          </ul>
                        </dd>
                        <dt>
                          <Icon name="lock" /> カギ
                        </dt>
                        <dd>{room.lock}</dd>
                        <dt>
                          <Icon name="compass" /> 使う場面
                        </dt>
                        <dd>{room.uses}</dd>
                      </dl>
                    </div>
                  )
                  : selected === "none"
                  ? (
                    <div key="none" mix={panelStyle}>
                      <h3 mix={panelTitleStyle}>
                        <span mix={[titleIconStyle, noIconStyle]}>
                          <Icon name="ban" size={22} />
                        </span>
                        チップに入っていないもの
                      </h3>
                      <div mix={notGridStyle}>
                        {notInside.map((n) => (
                          <div key={n.label} mix={notItemStyle}>
                            <span mix={notIconStyle}>
                              <Icon name={n.icon} size={20} />
                            </span>
                            <span>{n.label}</span>
                            <span mix={notXStyle}>
                              <Icon name="x" size={18} strokeWidth={3} />
                            </span>
                          </div>
                        ))}
                      </div>
                      <p>
                        {"こういう大事な情報は、それぞれの役所が"}
                        <strong>別々に</strong>
                        {"持っているよ。カードをなくしても、カードから読みとられることはないんだ。"}
                      </p>
                    </div>
                  )
                  : (
                    <p mix={hintStyle}>
                      <Icon name="arrowUp" /> とびらをえらんでね
                    </p>
                  )}
              </div>
            )
            : null}
        </div>
      );
    };
  },
);

const cardRowStyle = css({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
  gap: "1rem",
  alignItems: "center",
  "@media (max-width: 520px)": { gridTemplateColumns: "1fr" },
});

const cardWrapStyle = css({
  filter: "drop-shadow(0 6px 10px rgb(0 0 0 / 0.15))",
});

const cardSideStyle = css({ "& p": { marginTop: 0 } });

const pulseStyle = css({ animation: "pulse-ring 1.4s ease-out infinite" });

const buildingStyle = css({
  marginTop: "1rem",
  padding: "1rem",
  borderRadius: radius.lg,
  background: color.card,
  border: `2px solid ${art.gold}`,
  animation: "pop-in 350ms ease-out",
});

const doorsStyle = css({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(9.5rem, 1fr))",
  gap: "0.5rem",
});

const doorStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
  minHeight: "3.5rem",
  padding: "0.5rem 0.7rem",
  border: `2px solid ${color.line}`,
  borderRadius: radius.md,
  background: color.surface,
  color: color.fg,
  textAlign: "left",
  fontFamily: font.round,
  fontWeight: 700,
  fontSize: "0.9rem",
  lineHeight: 1.4,
  cursor: "pointer",
  "&:hover": { borderColor: color.accent },
  '&[aria-pressed="true"]': {
    background: color.accent,
    borderColor: color.accent,
    color: color.onAccent,
  },
  '&[aria-pressed="true"] > span:first-child': {
    background: color.surface,
  },
});

const noDoorStyle = css({ borderStyle: "dashed", borderColor: art.ng });

const doorIconStyle = css({
  flex: "none",
  display: "grid",
  placeItems: "center",
  width: "2.25rem",
  height: "2.25rem",
  borderRadius: radius.sm,
  background: art.softBlue,
  color: color.accent,
});

const noIconStyle = css({ background: art.softRed, color: art.ng });

const titleIconStyle = css({
  flex: "none",
  display: "inline-grid",
  placeItems: "center",
  width: "2.25rem",
  height: "2.25rem",
  borderRadius: radius.sm,
  background: art.softBlue,
  color: color.accent,
});

const panelStyle = css({
  marginTop: "0.9rem",
  padding: "1rem",
  borderRadius: radius.md,
  background: color.surface,
  animation: "pop-in 300ms ease-out",
  "& p": { marginBlock: "0.4rem" },
});

const panelTitleStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
  margin: "0 0 0.25rem",
  fontFamily: font.round,
  fontSize: "1.15rem",
});

const realStyle = css({ color: color.muted, fontSize: "0.85rem !important" });

const dlStyle = css({
  margin: "0.5rem 0 0",
  "& dt": {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    fontWeight: 800,
    marginTop: "0.6rem",
  },
  "& dt svg": { color: color.accent },
  "& dd": { margin: "0.15rem 0 0 1.6rem", lineHeight: 1.8 },
  "& ul": { margin: 0, paddingLeft: "1.1rem" },
});

const notGridStyle = css({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(8rem, 1fr))",
  gap: "0.5rem",
  marginBlock: "0.75rem",
});

const notItemStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.5rem",
  borderRadius: radius.md,
  background: art.softRed,
  fontSize: "0.9rem",
  fontWeight: 600,
});

const notXStyle = css({
  display: "inline-flex",
  marginLeft: "auto",
  color: art.ng,
});

const notIconStyle = css({ display: "inline-flex", color: art.ng });

const hintStyle = css({
  margin: "0.75rem 0 0",
  textAlign: "center",
  color: color.muted,
  fontWeight: 700,
});
