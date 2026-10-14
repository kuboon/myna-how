import { assertEquals } from "@std/assert";
import puppeteer from "puppeteer-core";
import { lightpanda } from "@lightpanda/browser";

import router from "../server/router.tsx";

function findFreePort(): number {
  const listener = Deno.listen({ port: 0, hostname: "127.0.0.1" });
  const { port } = listener.addr as Deno.NetAddr;
  listener.close();
  return port;
}

async function waitForCdp(cdpPort: number, timeoutMs = 5000): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${cdpPort}/json/version`);
      if (res.ok) {
        const json = await res.json();
        return json.webSocketDebuggerUrl as string;
      }
      await res.body?.cancel();
    } catch (err) {
      lastError = err;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(
    `lightpanda CDP :${cdpPort} didn't become ready: ${lastError}`,
  );
}

/**
 * `@lightpanda/browser` downloads its binary on first use and leaves it without the executable bit
 * on some hosts (GitHub's runners among them), so the first spawn fails with `EACCES`. Mark it
 * executable and spawn again.
 */
async function serveLightpanda(port: number) {
  try {
    return await lightpanda.serve({ host: "127.0.0.1", port });
  } catch (error) {
    if (!String(error).includes("EACCES")) throw error;
    const home = Deno.env.get("HOME") ?? "";
    await Deno.chmod(`${home}/.cache/lightpanda-node/lightpanda`, 0o755);
    return await lightpanda.serve({ host: "127.0.0.1", port });
  }
}

/** Starts lightpanda and the app, runs `body` against a fresh page, and tears both down. */
async function withPage(
  body: (page: import("puppeteer-core").Page, origin: string) => Promise<void>,
) {
  const cdpPort = findFreePort();
  const appPort = findFreePort();
  const lpProc = await serveLightpanda(cdpPort);
  const app = Deno.serve(
    { port: appPort, hostname: "127.0.0.1", onListen: () => {} },
    (req) => router.fetch(req),
  );
  try {
    const wsUrl = await waitForCdp(cdpPort);
    const browser = await puppeteer.connect({ browserWSEndpoint: wsUrl });
    try {
      const context = await browser.createBrowserContext();
      const page = await context.newPage();
      await body(page, `http://127.0.0.1:${appPort}`);
      await page.close();
      await context.close();
    } finally {
      await browser.disconnect();
    }
  } finally {
    try {
      lpProc.kill("SIGTERM");
    } catch { /* already gone */ }
    await app.shutdown();
  }
}

/**
 * A page-side expression: whether `selector` has an element whose text, readings left out,
 * includes every needle. Every kanji carries an `<rt>` reading, which `textContent` would run
 * into the words — `本物` reads as `本物ほんもの` — so the readings are dropped first.
 */
function shows(needles: string[], selector = "body"): string {
  return `[...document.querySelectorAll(${
    JSON.stringify(selector)
  })].some((el) => {
    const copy = el.cloneNode(true);
    copy.querySelectorAll("rt").forEach((rt) => rt.remove());
    const text = copy.textContent ?? "";
    return ${JSON.stringify(needles)}.every((n) => text.includes(n));
  })`;
}

/**
 * Clicks the first button whose text, readings left out, includes `text` — inside `scope` when
 * a page has more than one moving picture.
 */
function clickButton(
  page: import("puppeteer-core").Page,
  text: string,
  scope = "body",
) {
  return page.$$eval(
    `${scope} button`,
    (els, t) => {
      const plain = (e: Element) => {
        const copy = e.cloneNode(true) as Element;
        copy.querySelectorAll("rt").forEach((rt) => rt.remove());
        return copy.textContent ?? "";
      };
      const el = els.find((e) => plain(e).includes(t as string));
      if (!el) throw new Error(`no button with ${t}`);
      (el as HTMLButtonElement).click();
    },
    text,
  );
}

Deno.test({
  name: "lightpanda: /inside のチップを開くと部屋のとびらが出る",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withPage(async (page, origin) => {
      await page.goto(`${origin}/inside`);
      await page.waitForFunction("globalThis.__rmxReady === true", {
        timeout: 10_000,
      });
      // メモ帳とチップの比べっこ: チップは中身の読み出しをことわる。
      await clickButton(page, "中身をぜんぶ読ませて");
      await page.waitForFunction(
        shows(["お断り"]),
        { timeout: 5_000 },
      );
      await clickButton(page, "チップの中を見る");
      await page.waitForFunction(
        shows(["あき部屋"], "button"),
        { timeout: 5_000 },
      );
      await clickButton(page, "入っていないもの");
      await page.waitForFunction(
        shows(["チップに入っていないもの"]),
        { timeout: 5_000 },
      );
    });
  },
});

Deno.test({
  name: "lightpanda: /tamper で暗証番号を 3 回まちがえるとロックされる",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withPage(async (page, origin) => {
      await page.goto(`${origin}/tamper`);
      await page.waitForFunction("globalThis.__rmxReady === true", {
        timeout: 10_000,
      });
      await clickButton(page, "暗証番号を当てずっぽう");
      await page.waitForFunction(
        shows(["まちがい：0 / 3"]),
        { timeout: 5_000 },
      );
      for (let i = 0; i < 12; i++) {
        await page.$$eval("button", (els) => {
          const one = els.find((e) => e.textContent?.trim() === "1");
          (one as HTMLButtonElement).click();
        });
      }
      await page.waitForFunction(
        shows(["ロック中"]),
        { timeout: 5_000 },
      );
      const status = await page.$eval(
        "[data-mood]",
        (el) => el.getAttribute("data-mood"),
      );
      assertEquals(status, "locked");
    });
  },
});

Deno.test({
  name:
    "lightpanda: /auth で、にせものは J-LIS で、使い回しは電子署名ではじかれる",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withPage(async (page, origin) => {
      await page.goto(`${origin}/auth`);
      await page.waitForFunction("globalThis.__rmxReady === true", {
        timeout: 10_000,
      });
      for (let i = 0; i < 3; i++) await clickButton(page, "すすむ");
      await page.waitForFunction(
        shows(["電子署名は合う"]),
        { timeout: 5_000 },
      );
      // にせものカードは電子署名のたしかめは通るが、J-LIS のたしかめで落ちる。
      await clickButton(page, "にせものカード");
      for (let i = 0; i < 4; i++) await clickButton(page, "すすむ");
      await page.waitForFunction(
        shows(["電子署名は合う", "そんな電子証明書は出していない"]),
        { timeout: 5_000 },
      );
      // のぞき見した人が 1 回目の電子署名を盗み、2 回目に使い回しても合わない。
      await clickButton(page, "のぞき見して使い回す");
      for (let i = 0; i < 4; i++) await clickButton(page, "すすむ");
      await page.waitForFunction(
        shows(["これをそのまま返す", "確かめると…合わない"]),
        { timeout: 5_000 },
      );
    });
  },
});

Deno.test({
  name: "lightpanda: /phone で、スマホなら聞かれたことだけを見せる",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withPage(async (page, origin) => {
      await page.goto(`${origin}/phone`);
      await page.waitForFunction("globalThis.__rmxReady === true", {
        timeout: 10_000,
      });
      // カードを見せると、聞いていないことまで見えてしまう。
      await clickButton(page, "カードを見せる");
      await page.waitForFunction(shows(["聞いていないことまで見えた"]), {
        timeout: 5_000,
      });
      // スマホなら「20さい以上」の1行だけがとどき、J-LISのしるしで確かめられる。
      await clickButton(page, "スマホで見せる");
      const stage = 'section[aria-label*="見せたいこと"]';
      for (let i = 0; i < 3; i++) await clickButton(page, "すすむ", stage);
      await page.waitForFunction(
        shows(["J-LISのしるしと合う：本物", "とどいていない"], stage),
        { timeout: 5_000 },
      );
    });
  },
});

Deno.test({
  name: "lightpanda: /license で、これからのスマホ免許証は未定の例として出る",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withPage(async (page, origin) => {
      await page.goto(`${origin}/license`);
      await page.waitForFunction("globalThis.__rmxReady === true", {
        timeout: 10_000,
      });
      await clickButton(page, "マイナ免許証");
      await page.waitForFunction(shows(["免許の情報は入らない"]), {
        timeout: 5_000,
      });
      await clickButton(page, "これから");
      await page.waitForFunction(
        shows([
          "まだ決まっていないことの例",
          "カードを持たなくても運転できるようにする方向",
        ]),
        { timeout: 5_000 },
      );
    });
  },
});

Deno.test({
  name: "lightpanda: /signature は、カギを作るところから始まる",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    // lightpanda can generate an ECDSA key but cannot export one (NotSupportedError), so the
    // whole flow — keys, signature, check — is verified in a full browser instead. Here: the
    // first render waits for the first button, and nothing else can be pressed yet.
    await withPage(async (page, origin) => {
      await page.goto(`${origin}/signature`);
      await page.waitForFunction("globalThis.__rmxReady === true", {
        timeout: 10_000,
      });
      const enabled = await page.$$eval(
        "section[aria-label*='電子署名'] button:not([disabled])",
        (els) =>
          els.map((e) => {
            const c = e.cloneNode(true) as Element;
            c.querySelectorAll("rt").forEach((r) => r.remove());
            return (c.textContent ?? "").trim();
          }),
      );
      assertEquals(enabled, ["カギのペアを作る"]);
      const official = await page.$$eval(
        "section[aria-label*='届け'] button:not([disabled])",
        (els) =>
          els.map((e) => {
            const c = e.cloneNode(true) as Element;
            c.querySelectorAll("rt").forEach((r) => r.remove());
            return (c.textContent ?? "").trim();
          }),
      );
      assertEquals(official, ["カードで電子署名を作る"]);
    });
  },
});
