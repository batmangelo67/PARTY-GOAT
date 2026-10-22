import { test } from "@playwright/test";
import { PLAYER_NAMES, Session, addPlayers, gotoHome, openGame, settle, writeJson } from "./lib/driver";
import { langOf } from "./lib/i18n";
import { instrument } from "./lib/instrument";
import { startFromSetup } from "./lib/start";

// Pack selection effort: taps to play Impostor with exactly one pack, then to go back to "everything".
// Works on both the old inline picker and the new picker screen.

const GAME = "impostor";

async function checkboxes(page: import("@playwright/test").Page) {
  return page.locator("main [role=checkbox]");
}

test("picker effort", async ({ page }, info) => {
  const lang = langOf(info.project.name);
  await instrument(page);
  await gotoHome(page);
  const session = new Session(page, lang, info.project.name, "picker", { shots: false, layout: false });
  await openGame(session, GAME);
  await addPlayers(session, PLAYER_NAMES);
  const pickerLink = page.locator(`a[href="#/play/${GAME}/packs"]`);
  const newPicker = await pickerLink.isVisible().catch(() => false);

  // 1. Only one pack (the second in the list).
  const startOne = session.taps;
  if (newPicker) await session.tapSelector(`a[href="#/play/${GAME}/packs"]`, "open picker");
  if (newPicker) await session.tapText("picker.clear");
  const rows = await checkboxes(page);
  const total = await rows.count();
  const target = (await rows.nth(1).innerText()).split("\n").find((line) => line.trim().length > 2) ?? "";
  if (newPicker) {
    await rows.nth(1).click();
    session.taps += 1;
    await session.tapSelector("footer button", "done");
  } else {
    for (let i = 0; i < total; i += 1) {
      if (i === 1) continue;
      await rows.nth(i).click();
      session.taps += 1;
    }
  }
  await settle(page);
  await startFromSetup(session);
  const onePackTaps = session.taps - startOne;

  // 2. Back to everything.
  await page.goto(`./#/play/${GAME}/setup`);
  await settle(page);
  const startAll = session.taps;
  if (newPicker) {
    await session.tapSelector(`a[href="#/play/${GAME}/packs"]`, "open picker");
    await session.tapText("picker.mixAll");
    await session.tapSelector("footer button", "done");
  } else {
    const all = await checkboxes(page);
    for (let i = 0; i < (await all.count()); i += 1) {
      if ((await all.nth(i).getAttribute("aria-checked")) === "false") {
        await all.nth(i).click();
        session.taps += 1;
      }
    }
  }
  await startFromSetup(session);
  const allPacksTaps = session.taps - startAll;

  writeJson(`${info.project.name}/picker.json`, { project: info.project.name, newPicker, packsListed: total, target, onePackTaps, allPacksTaps });
});
