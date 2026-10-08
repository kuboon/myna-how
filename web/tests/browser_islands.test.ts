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

/** Clicks the first button whose text includes `text`. */
function clickButton(page: import("puppeteer-core").Page, text: string) {
  return page.$$eval(
    "button",
    (els, t) => {
      const el = els.find((e) => e.textContent?.includes(t as string));
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
        () => document.body.textContent?.includes("おことわり"),
        { timeout: 5_000 },
      );
      await clickButton(page, "チップの中を見る");
      await page.waitForFunction(
        () =>
          [...document.querySelectorAll("button")].some((b) =>
            b.textContent?.includes("あき部屋")
          ),
        { timeout: 5_000 },
      );
      await clickButton(page, "入っていないもの");
      await page.waitForFunction(
        () => document.body.textContent?.includes("チップに入っていないもの"),
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
        () => document.body.textContent?.includes("まちがい：0 / 3"),
        { timeout: 5_000 },
      );
      for (let i = 0; i < 12; i++) {
        await page.$$eval("button", (els) => {
          const one = els.find((e) => e.textContent?.trim() === "1");
          (one as HTMLButtonElement).click();
        });
      }
      await page.waitForFunction(
        () => document.body.textContent?.includes("ロック中"),
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
