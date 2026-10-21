import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "@playwright/test";
import { PLAYER_NAMES, Session, addPlayers, gotoHome, openGame, writeJson } from "./lib/driver";
import { langOf } from "./lib/i18n";
import { instrument } from "./lib/instrument";
import { startFromSetup } from "./lib/start";

// First-load performance and offline behaviour. Sizes come from the build output, timings from
// the browser. Chromium also runs a throttled "slow phone on 4G" load through CDP.

const DIST = path.resolve(fileURLToPath(new URL("../..", import.meta.url)), process.env.AUDIT_DIST ?? "dist");

function buildSizes() {
  const html = fs.readFileSync(path.join(DIST, "index.html"), "utf8");
  const initial = [...html.matchAll(/(?:src|href)="\/?(assets\/[^"]+\.(?:js|css))"/g)].map((m) => m[1]!);
  const size = (file: string) => fs.statSync(path.join(DIST, file)).size;
  const all = fs.readdirSync(path.join(DIST, "assets")).map((f) => `assets/${f}`);
  const sw = fs.readFileSync(path.join(DIST, "sw.js"), "utf8");
  const precacheEntries = (sw.match(/url:"/g) ?? []).length;
  return {
    initialFiles: initial.map((file) => ({ file, bytes: size(file) })),
    initialBytes: initial.reduce((sum, file) => sum + size(file), 0),
    allAssetBytes: all.reduce((sum, file) => sum + size(file), 0),
    publicBytes: fs.readdirSync(DIST).filter((f) => /\.(png|svg|webmanifest)$/.test(f)).reduce((sum, f) => sum + size(f), 0),
    precacheEntries,
  };
}

test("first load and offline", async ({ page, context, browserName }, info) => {
  const lang = langOf(info.project.name);
  const errors = await instrument(page);

  let throttled: number | null = null;
  if (browserName === "chromium") {
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    const start = Date.now();
    await gotoHome(page);
    throttled = Date.now() - start;
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    await context.clearCookies();
  }

  const start = Date.now();
  await gotoHome(page);
  const homeVisibleMs = Date.now() - start;
  const timing = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const paint = performance.getEntriesByName("first-contentful-paint")[0];
    return { domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd) : null, load: nav ? Math.round(nav.loadEventEnd) : null, fcp: paint ? Math.round(paint.startTime) : null };
  });

  const swReady = await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) return "unsupported";
    const registration = await Promise.race([navigator.serviceWorker.ready, new Promise((resolve) => setTimeout(() => resolve(null), 15000))]);
    return registration ? "ready" : "timeout";
  });
  await page.waitForTimeout(2500);

  let offline: Record<string, unknown> = { tested: false };
  if (swReady === "ready") {
    await context.setOffline(true);
    try {
      await page.reload();
      await gotoHome(page);
      const session = new Session(page, lang, info.project.name, "offline", { shots: false, layout: false });
      await openGame(session, "impostor");
      await addPlayers(session, PLAYER_NAMES);
      const summary = page.locator('a[href="#/play/impostor/packs"]');
      const packsListed = (await summary.isVisible().catch(() => false))
        ? await summary.innerText().then((text) => text.split("\n")[0])
        : await page.getByRole("checkbox").count();
      await startFromSetup(session);
      await page.waitForTimeout(500);
      offline = { tested: true, homeLoads: true, packsListed, reachedPlay: /#\/play\/impostor$/.test(new URL(page.url()).hash) };
    } catch (error) {
      offline = { tested: true, homeLoads: false, error: String(error).slice(0, 200) };
    } finally {
      await context.setOffline(false);
    }
  }

  writeJson(`${info.project.name}/offline-perf.json`, { project: info.project.name, sizes: buildSizes(), homeVisibleMs, throttledHomeVisibleMs: throttled, timing, swReady, offline, errors });
});
