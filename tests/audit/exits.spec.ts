import path from "node:path";
import { test, type Page } from "@playwright/test";
import type { MessageKey } from "../../src/i18n/en";
import {
  PLAYER_NAMES,
  RUNS_DIR,
  Session,
  addPlayers,
  doAction,
  gotoHome,
  openGame,
  pickNextAction,
  resultReached,
  screenId,
  settle,
  writeJson,
} from "./lib/driver";
import { AUDIT_GAMES } from "./lib/games";
import { langOf, tr, type Lang } from "./lib/i18n";
import { instrument, readProbe, setVisibility } from "./lib/instrument";
import { checkLayout } from "./lib/layout";
import { startFromSetup } from "./lib/start";

// Exits and interruptions: is there a way out of every in-game screen, and what happens on
// browser back, reload, backgrounding and rotation in the middle of a game.

const EXIT_KEYS: MessageKey[] = [
  "game.exit",
  "common.back",
  "common.backToSetup",
  "common.home",
  "nhie.play.end",
  "tod.play.end",
  "mlt.play.end",
  "ten.play.end",
  "bomb.boom.end",
];

async function exitAffordance(page: Page, lang: Lang): Promise<string | null> {
  for (const key of EXIT_KEYS) {
    const label = tr(lang, key);
    const control = page.locator(`a[aria-label="${label}"], button[aria-label="${label}"]`).or(page.getByRole("button", { name: label, exact: true }));
    if (await control.first().isVisible().catch(() => false)) return key;
  }
  return null;
}

async function newGameSession(page: Page, lang: Lang, project: string, gameId: string): Promise<Session> {
  await gotoHome(page);
  const session = new Session(page, lang, project, `exits-${gameId}`, { shots: false, layout: false });
  await openGame(session, gameId);
  await addPlayers(session, PLAYER_NAMES);
  await startFromSetup(session);
  return session;
}

async function advance(session: Session, actions: number): Promise<void> {
  for (let i = 0; i < actions; i += 1) {
    const pick = await pickNextAction(session.page);
    if (pick.kind === "none") return;
    await doAction(session, pick, i);
  }
}

async function bodyText(page: Page): Promise<string> {
  return (await page.locator("#root").innerText()).replace(/\s+/g, " ").slice(0, 160);
}

for (const game of AUDIT_GAMES) {
  test(`exits ${game.id}`, async ({ page }, info) => {
    const lang = langOf(info.project.name);
    const errors = await instrument(page);
    await page.clock.install();
    const project = info.project.name;

    // 1. Walk a full round and check every screen for a visible way out.
    let session = await newGameSession(page, lang, project, game.id);
    const screens: { id: string; exit: string | null }[] = [];
    const seen = new Set<string>();
    let repeats = 0;
    let lastId = "";
    for (let step = 0; step < 60; step += 1) {
      const id = await screenId(page);
      if (!seen.has(id)) {
        seen.add(id);
        screens.push({ id, exit: await exitAffordance(page, lang) });
      }
      if (await resultReached(session)) break;
      repeats = id === lastId ? repeats + 1 : 0;
      lastId = id;
      if (repeats >= 4) {
        await page.clock.fastForward("03:00");
        await settle(page);
        repeats = 0;
        if (game.shape === "cards") break;
        continue;
      }
      const pick = await pickNextAction(page);
      if (pick.kind === "none") break;
      await doAction(session, pick, step);
    }

    // 2. Browser/system back from the middle of a round, then forward again.
    session = await newGameSession(page, lang, project, game.id);
    await advance(session, 2);
    const midBefore = await bodyText(page);
    const midHash = new URL(page.url()).hash;
    await page.goBack({ waitUntil: "commit", timeout: 5000 }).catch(() => null);
    await settle(page);
    const backLanding = new URL(page.url()).hash;
    await page.goForward({ waitUntil: "commit", timeout: 5000 }).catch(() => null);
    await settle(page);
    const forwardText = await bodyText(page);
    const back = { from: midHash, landedOn: backLanding, forwardRestoredSameScreen: forwardText === midBefore, forwardScreen: forwardText.slice(0, 80) };

    // 4. Background + return while a timer, fuse or turn is running.
    session = await newGameSession(page, lang, project, game.id);
    await advance(session, game.id === "bomb" ? 1 : game.id === "forbidden-words" ? 1 : 0);
    const timerBefore = await page.locator("[role=timer]").first().textContent({ timeout: 500 }).catch(() => null);
    const voicesBefore = (await readProbe(page)).voices;
    await setVisibility(page, "hidden");
    await page.clock.fastForward("01:00");
    const voicesWhileHidden = (await readProbe(page)).voices - voicesBefore;
    await setVisibility(page, "visible");
    await settle(page);
    const background = {
      timerBefore,
      timerAfter: await page.locator("[role=timer]").first().textContent({ timeout: 500 }).catch(() => null),
      soundsWhileHidden: voicesWhileHidden,
      screenAfter: (await bodyText(page)).slice(0, 80),
    };

    // 5. Leaving mid-game: wake lock and sounds must stop.
    session = await newGameSession(page, lang, project, game.id);
    await advance(session, game.id === "bomb" ? 1 : 2);
    const locksInGame = (await readProbe(page)).activeLocks;
    await page.goto("./#/");
    await settle(page);
    const voicesAtExit = (await readProbe(page)).voices;
    await page.waitForTimeout(1500);
    const probeAfter = await readProbe(page);
    const leak = { locksInGame, locksAfterExit: probeAfter.activeLocks, soundsAfterExit: probeAfter.voices - voicesAtExit };

    // 6. Rotation to landscape mid-game.
    session = await newGameSession(page, lang, project, game.id);
    await advance(session, 1);
    const size = page.viewportSize()!;
    await page.setViewportSize({ width: size.height, height: size.width });
    await settle(page);
    const landscape = await checkLayout(page);
    await page.screenshot({ path: path.join(RUNS_DIR, project, `exits-${game.id}`, "landscape.jpg"), type: "jpeg", quality: 50 });
    await page.setViewportSize(size);

    // 3. Reload in the middle of a round (iOS can also kill a backgrounded PWA). Last, because the
    // fake clock does not survive a real reload.
    session = await newGameSession(page, lang, project, game.id);
    await advance(session, 2);
    await page.reload();
    await page.waitForTimeout(800);
    const reload = { landedOn: new URL(page.url()).hash, screen: (await bodyText(page)).slice(0, 80) };

    writeJson(`${project}/exits-${game.id}.json`, { project, game: game.id, screens, back, reload, background, leak, landscape, errors });
  });
}
