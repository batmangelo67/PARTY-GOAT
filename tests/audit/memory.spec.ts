import { test } from "@playwright/test";
import { PLAYER_NAMES, Session, addPlayers, gotoHome, openGame, settle, writeJson } from "./lib/driver";
import { AUDIT_GAMES } from "./lib/games";
import { langOf } from "./lib/i18n";
import { instrument } from "./lib/instrument";

// Does the app remember a group's choices? Changes one option and one pack, relaunches, compares.

async function snapshotSetup(page: import("@playwright/test").Page) {
  return page.evaluate(() => ({
    radios: [...document.querySelectorAll("main [role=radio][aria-checked=true]")].map((el) => el.textContent?.trim() ?? ""),
    switches: [...document.querySelectorAll("main [role=switch]")].map((el) => el.getAttribute("aria-checked")),
    packs: [...document.querySelectorAll("main [role=checkbox]")].map((el) => el.getAttribute("aria-checked")).join(""),
  }));
}

for (const game of AUDIT_GAMES) {
  test(`memory ${game.id}`, async ({ page }, info) => {
    const lang = langOf(info.project.name);
    await instrument(page);
    await gotoHome(page);
    const session = new Session(page, lang, info.project.name, `memory-${game.id}`, { shots: false, layout: false });
    await openGame(session, game.id);
    await addPlayers(session, PLAYER_NAMES);

    const lastRadio = page.locator("main [role=radiogroup]").last().locator("[role=radio]").last();
    if (await lastRadio.isVisible().catch(() => false)) await lastRadio.click();
    const firstSwitch = page.locator("main [role=switch]").first();
    if (await firstSwitch.isVisible().catch(() => false)) await firstSwitch.click();
    const firstPack = page.locator("main [role=checkbox]").first();
    if (await firstPack.isVisible().catch(() => false)) await firstPack.click();
    await settle(page);
    const before = await snapshotSetup(page);

    // A real reload: in-memory state is gone, only what was stored survives.
    await page.reload();
    await gotoHome(page);
    await openGame(session, game.id);
    await settle(page);
    const after = await snapshotSetup(page);
    const playersKept = await page.locator("main li input").count();
    writeJson(`${info.project.name}/memory-${game.id}.json`, {
      project: info.project.name,
      game: game.id,
      optionsKept: JSON.stringify(before.radios) === JSON.stringify(after.radios) && JSON.stringify(before.switches) === JSON.stringify(after.switches),
      packsKept: before.packs === after.packs,
      before,
      after,
      playersKept,
    });
  });
}
