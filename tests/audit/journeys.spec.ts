import { expect, test } from "@playwright/test";
import {
  PLAYER_NAMES,
  Session,
  addPlayers,
  driveUntil,
  gotoHome,
  openGame,
  resultReached,
  settle,
  writeJson,
} from "./lib/driver";
import { AUDIT_GAMES, type AuditGame } from "./lib/games";
import { langOf } from "./lib/i18n";
import { instrument, readProbe } from "./lib/instrument";
import { measureScreen } from "./lib/layout";
import { startFromSetup } from "./lib/start";

// Journey: home -> first playable moment -> full round -> result -> play again, then a relaunch
// and a repeat play. Records taps, text entries and screen measurements.

async function playRound(session: Session, game: AuditGame): Promise<boolean> {
  if (game.shape === "round") return driveUntil(session, () => resultReached(session));
  let cards = 0;
  await driveUntil(session, async () => cards++ >= (game.cards ?? 3), 40);
  await session.tapText(game.endKey!);
  await session.snap("after-end");
  return (await resultReached(session)) || /\/setup$/.test(new URL(session.page.url()).hash);
}

for (const game of AUDIT_GAMES) {
  test(`journey ${game.id}`, async ({ page }, info) => {
    const lang = langOf(info.project.name);
    const errors = await instrument(page);
    await page.clock.install();
    await gotoHome(page);

    const first = new Session(page, lang, info.project.name, `journey-${game.id}`);
    await first.snap("home");
    await openGame(first, game.id);
    await first.snap("setup");
    const setupFresh = await measureScreen(page);
    const needsPlayers = await page.locator(`input[placeholder="${first.t("players.addPlaceholder")}"]`).isVisible();
    if (needsPlayers) await addPlayers(first, PLAYER_NAMES);
    const setupFilled = await measureScreen(page);
    await first.snap("setup-filled");
    await startFromSetup(first);
    const toPlayable = first.mark();
    await first.snap("first-playable");

    const reached = await playRound(first, game);
    const afterRound = first.mark();

    let playAgainTaps: number | null = null;
    if (await resultReached(first)) {
      const before = first.taps;
      const label = (await first.page.getByRole("button", { name: first.t("common.playAgain"), exact: true }).isVisible())
        ? "common.playAgain"
        : (await first.page.getByRole("button", { name: first.t("common.newGame"), exact: true }).isVisible())
          ? "common.newGame"
          : "bomb.boom.next";
      await first.tapText(label);
      playAgainTaps = first.taps - before;
    } else if (/\/setup$/.test(new URL(page.url()).hash)) {
      const before = first.taps;
      await startFromSetup(first);
      playAgainTaps = first.taps - before;
    }

    await gotoHome(page);
    const probe = await readProbe(page);

    // Relaunch: a new page in the same browser profile, like reopening the Home Screen app after
    // iOS evicted it. Only what the app stored survives.
    const app = await page.context().newPage();
    await instrument(app);
    await page.close();
    await gotoHome(app);
    const repeat = new Session(app, lang, info.project.name, `repeat-${game.id}`, { shots: false, layout: false });
    await openGame(repeat, game.id);
    const setupRepeat = await measureScreen(app);
    await startFromSetup(repeat);
    await settle(app);
    const repeatReachedPlay = /#\/play\/[^/]+$/.test(new URL(app.url()).hash);

    // One-tap repeat from home, when the app offers it (the "play again" card).
    await gotoHome(app);
    let quickTaps: number | null = null;
    const quickSelector = `a[href="#/play/${game.id}/setup?go=1"]`;
    if (await app.locator(quickSelector).isVisible().catch(() => false)) {
      const quickSession = new Session(app, lang, info.project.name, `quick-${game.id}`, { shots: false, layout: false });
      await quickSession.tapSelector(quickSelector, "play again card");
      await app.waitForTimeout(400);
      quickTaps = /#\/play\/[^/]+$/.test(new URL(app.url()).hash) ? quickSession.taps : null;
    }

    const result = {
      project: info.project.name,
      game: game.id,
      firstPlay: {
        tapsToPlayable: toPlayable.taps,
        textsToPlayable: toPlayable.texts,
        roundTaps: afterRound.taps - toPlayable.taps,
        roundTexts: afterRound.texts - toPlayable.texts,
        waits: first.waits,
        reachedResult: reached,
        setupControlsFresh: setupFresh.controls,
        setupControlsFilled: setupFilled.controls,
        setupScreensFilled: setupFilled.screens,
      },
      playAgainTaps,
      repeat: { tapsToPlayable: repeat.taps, setupControls: setupRepeat.controls, setupScreens: setupRepeat.screens, reachedPlay: repeatReachedPlay, quickTaps },
      wakeLockActiveAtHome: probe.activeLocks,
      steps: first.steps,
      screens: [...first.screens.values()],
      errors,
    };
    writeJson(`${info.project.name}/journey-${game.id}.json`, result);
    expect.soft(reached, "round reached a result").toBe(true);
  });
}
