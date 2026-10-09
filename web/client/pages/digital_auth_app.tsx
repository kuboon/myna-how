import { css, type Handle } from "@remix-run/component";

import { AppFlow } from "../islands/app_flow.tsx";
import {
  Analogy,
  ChapterHead,
  ChapterNav,
  GrownUpNote,
  Sources,
  Stage,
  Summary,
} from "../parts.tsx";
import { SITE_NAME } from "../layout.tsx";
import { Icon, type IconName } from "../ui/icons.tsx";
import { art, color, radius } from "../tokens.ts";

export const title = `デジタル庁の「デジタル認証アプリ」 — ${SITE_NAME}`;
export const description =
  "デジタル庁の「デジタル認証アプリ」を使うと、いろいろなサイトがマイナンバーカードでのログインを無料で組みこめます。そのしくみを、動く図で説明します。";

export const hydrate = true;

const uses: { icon: IconName; text: string }[] = [
  { icon: "lock", text: "ネットのサービスにログインする" },
  { icon: "cup", text: "お酒を買うときなどの年れい確認" },
  { icon: "ticket", text: "公共しせつのネット予約" },
  { icon: "landmark", text: "銀行やお店での本人確認" },
];

export default function DigitalAuthApp(_handle: Handle) {
  return () => (
    <>
      <ChapterHead chapter="digitalAuthApp">
        <p>
          {"ここまで見てきたしくみを、だれでもかんたんに使えるようにしたのが、デジタル庁の"}
          <strong>デジタル認証アプリ</strong>
          {"。2024年から使われているよ。"}
        </p>
      </ChapterHead>

      <Analogy>
        <p>
          {"サイトの人にとって、カードの電子署名を自分で確かめるのは、とても大変。そこで、デジタル庁が"}
          <strong>「確かめ係」</strong>
          {"を引き受けてくれる。サイトは「この人、本人？」と聞くだけで、確かめ係が「うん、本人だよ。このサイト用の番号はこれ」と答えてくれるんだ。"}
        </p>
      </Analogy>

      <Stage label="動かしてみよう：アプリでログイン">
        <AppFlow />
      </Stage>

      <h2>どんなことに使えるの？</h2>
      <ul mix={usesStyle}>
        {uses.map((u) => (
          <li key={u.text}>
            <span>
              <Icon name={u.icon} size={22} />
            </span>
            {u.text}
          </li>
        ))}
      </ul>

      <h2>サイトの人にうれしいこと</h2>
      <ul>
        <li>
          <strong>無料で使える。</strong>
          {"ログイン（認証）のしくみは、お金をはらわずに組みこめるよ。"}
        </li>
        <li>
          <strong>世界共通の決まりで作られている。</strong>
          {"「○○でログイン」ボタンでおなじみの"}
          <strong>OpenID Connect</strong>
          {"という決まりにそっているので、組みこみやすいんだ。"}
        </li>
        <li>
          <strong>むずかしい確認はデジタル庁がやる。</strong>
          {"電子署名の確認や「証明書がまだ使えるか」の確認を、自分で作らなくていい。"}
        </li>
      </ul>

      <h2>使う人にうれしいこと</h2>
      <ul>
        <li>
          <strong>名前を教えなくてもいい。</strong>
          {"サイトにとどくのは、サイトごとにちがう番号だけ（前の章を見てね）。"}
        </li>
        <li>
          <strong>教えるかどうかは自分で決める。</strong>
          {"名前や住所が必要なときは、アプリに出る画面を見て、自分でOKする。"}
        </li>
        <li>
          <strong>パスワードを覚えなくていい。</strong>
          {"サイトごとにパスワードを作らなくても、カードと暗証番号でログインできる。"}
        </li>
      </ul>

      <Summary>
        <p>
          {"デジタル認証アプリは、マイナンバーカードでの本人確認を、デジタル庁が「確かめ係」になって手伝うしくみ。サイトは無料で組みこめて、使う人は名前を教えずにログインできる。"}
        </p>
      </Summary>

      <GrownUpNote>
        <ul>
          <li>
            {"認証APIはOpenID Connect（OAuth 2.0認可コードフロー）。PKCE（S256）必須、トークンエンドポイントのクライアント認証は"}
            <code>private_key_jwt</code>
            {"（ES256）。"}
          </li>
          <li>
            {"利用者識別子"}
            <code>sub</code>
            {"はpairwise（事業者ごとに異なる）。基本4情報は"}
            <code>name</code> <code>address</code> <code>birthdate</code>{" "}
            <code>gender</code>
            {"のスコープで要求し、利用者の同意を得て取得する。"}
          </li>
          <li>
            {"民間事業者は認証APIを無償で利用できる。署名API（署名用電子証明書による電子署名）を使う場合は、別途プラットフォーム事業者との契約（有償）などが必要。"}
          </li>
          <li>
            {"利用には事前の申請・打ち合わせ、接続確認環境での試験などの手続きがある。最新の条件は公式の事業者向けページで確認を。"}
          </li>
        </ul>
      </GrownUpNote>

      <aside mix={linkBoxStyle}>
        <p>
          <strong>アプリを使ってみたい人へ：</strong>
          {"「デジタル認証アプリ」はApp Store / Google Playから入れられるよ。くわしくはデジタル庁のページを見てね。"}
        </p>
      </aside>

      <Sources
        items={[
          {
            href: "https://services.digital.go.jp/auth-and-sign/",
            label: "デジタル庁：デジタル認証アプリ",
          },
          {
            href: "https://services.digital.go.jp/auth-and-sign/business/",
            label: "デジタル庁：デジタル認証アプリ 民間事業者向け情報",
          },
          {
            href:
              "https://developers.digital.go.jp/documents/auth-and-sign/authserver/",
            label: "デジタル庁：APIリファレンス（民間事業者向け）",
          },
        ]}
      />

      <ChapterNav chapter="digitalAuthApp" />
    </>
  );
}

const usesStyle = css({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(13rem, 1fr))",
  gap: "0.5rem",
  padding: 0,
  listStyle: "none",
  "& li": {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    margin: 0,
    padding: "0.9rem 1.1rem",
    borderRadius: radius.lg,
    background: color.surface,
    fontWeight: 700,
  },
  "& li > span": {
    flex: "none",
    display: "grid",
    placeItems: "center",
    width: "2.5rem",
    height: "2.5rem",
    borderRadius: radius.md,
    background: art.softBlue,
    color: color.accent,
  },
});

const linkBoxStyle = css({
  marginBlock: "1.5rem",
  padding: "1rem 1.1rem",
  borderRadius: radius.lg,
  background: color.surface,
  "& p": { margin: 0 },
});
