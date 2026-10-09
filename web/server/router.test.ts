import { assert, assertEquals, assertStringIncludes } from "@std/assert";
import router from "./router.tsx";

/** The page with its kanji readings taken out, so a needle matches the words as written. */
function withoutReadings(html: string): string {
  return html.replace(/<rt>[^<]*<\/rt>/g, "").replace(/<\/?ruby>/g, "");
}

Deno.test("GET / lists every chapter and ships no JavaScript", async () => {
  const res = await router.fetch(new Request("http://x/"));
  assertEquals(res.status, 200);
  assertStringIncludes(res.headers.get("content-type") ?? "", "text/html");
  const html = withoutReadings(await res.text());
  assertStringIncludes(html, "<!DOCTYPE html>");
  assertStringIncludes(html, '<html lang="ja"');
  assertStringIncludes(html, "マイナンバーカードの");
  for (
    const path of [
      "/inside",
      "/tamper",
      "/phone",
      "/auth",
      "/anonymous",
      "/digital-auth-app",
    ]
  ) {
    assertStringIncludes(html, `href="${path}"`);
  }
  assert(!html.includes('<script type="module"'));
});

for (
  const [path, island, needle] of [
    ["/inside", "InsideExplorer", "ICチップ"],
    ["/tamper", "TamperLab", "耐タンパー性"],
    ["/phone", "PhoneSetup", "セキュアエレメント"],
    ["/auth", "AuthFlow", "公開のカギ"],
    ["/anonymous", "PairwiseDemo", "サイトごとにちがう番号"],
    ["/digital-auth-app", "AppFlow", "OpenID Connect"],
  ] as const
) {
  Deno.test(`GET ${path} renders its chapter and hydrates ${island}`, async () => {
    const res = await router.fetch(new Request(`http://x${path}`));
    assertEquals(res.status, 200);
    const html = withoutReadings(await res.text());
    assertStringIncludes(html, "<main");
    assertStringIncludes(html, needle);
    assertStringIncludes(html, island);
    assertStringIncludes(html, '<script type="module" src="/assets/hydration');
  });
}

Deno.test("GET /api/anything is a 404 — the site has no server API", async () => {
  const res = await router.fetch(new Request("http://x/api/notify"));
  assertEquals(res.status, 404);
  await res.body?.cancel();
});
