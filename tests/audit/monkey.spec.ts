import { test } from "@playwright/test";
import { PLAYER_NAMES, Session, addPlayers, gotoHome, openGame, settle, writeJson } from "./lib/driver";
import { AUDIT_GAMES } from "./lib/games";
import { langOf, tr } from "./lib/i18n";
import { instrument } from "./lib/instrument";
import { startFromSetup } from "./lib/start";

// Randomised "monkey" run: taps random visible controls inside each game and watches for crashes,
// console errors and impossible states. Seeded so a failing run can be replayed.

const STEPS = 120;
const MONKEY_PROJECTS = /i15/;

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFor(text: string): number {
  return [...text].reduce((hash, char) => Math.imul(hash ^ char.charCodeAt(0), 16777619), 2166136261);
}

const IMPOSSIBLE = [/\bNaN\b/, /\bundefined\b/, /\[object /, /\bnull\b/, /-\d+ (pts|punti)/];

for (const game of AUDIT_GAMES) {
  test(`monkey ${game.id}`, async ({ page }, info) => {
    test.skip(!MONKEY_PROJECTS.test(info.project.name), "monkey runs on the iPhone 15 projects only");
    const lang = langOf(info.project.name);
    const seed = seedFor(`${info.project.name}:${game.id}`);
    const random = seededRandom(seed);
    const errors = await instrument(page);
    await page.clock.install();
    await gotoHome(page);
    const session = new Session(page, lang, info.project.name, `monkey-${game.id}`, { shots: false, layout: false });
    await openGame(session, game.id);
    await addPlayers(session, PLAYER_NAMES);
    await startFromSetup(session);

    const anomalies: string[] = [];
    const crashText = tr(lang, "error.crash", { message: "" }).split("—")[0]!.trim();
    let reentries = 0;
    for (let step = 0; step < STEPS; step += 1) {
      const hash = new URL(page.url()).hash;
      if (hash.split("?")[0] !== `#/play/${game.id}`) {
        // Wandered out (setup, home, packs, editor): come back like a player would.
        reentries += 1;
        await page.goto(`./#/play/${game.id}/setup`);
        await settle(page);
        await addPlayers(session, PLAYER_NAMES).catch(() => undefined);
        await startFromSetup(session).catch(() => undefined);
        continue;
      }
      const text = await page.locator("#root").innerText().catch(() => "");
      if (!text.trim()) anomalies.push(`step ${step}: blank screen at ${hash}`);
      if (text.includes(crashText)) anomalies.push(`step ${step}: error boundary at ${hash}`);
      for (const pattern of IMPOSSIBLE) if (pattern.test(text)) anomalies.push(`step ${step}: "${pattern}" visible at ${hash}`);

      const controls = page.locator("main button:not([disabled]), footer button:not([disabled]), header a, main input, main textarea");
      const count = await controls.count();
      if (count === 0) {
        await page.clock.fastForward("01:00");
        continue;
      }
      const target = controls.nth(Math.floor(random() * count));
      const tag = await target.evaluate((el) => el.tagName).catch(() => "");
      try {
        if (tag === "INPUT" || tag === "TEXTAREA") await target.fill(random() < 0.5 ? String(Math.floor(random() * 3000)) : "zebra", { timeout: 800 });
        else await target.click({ timeout: 800 });
      } catch {
        // Element moved or vanished between count and click: fine for a monkey.
      }
      if (random() < 0.05) await page.clock.fastForward("00:30");
      await page.waitForTimeout(40);
    }
    writeJson(`${info.project.name}/monkey-${game.id}.json`, { project: info.project.name, game: game.id, seed, steps: STEPS, reentries, anomalies: [...new Set(anomalies)].slice(0, 30), errors });
  });
}
