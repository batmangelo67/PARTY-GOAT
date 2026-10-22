import { test } from "@playwright/test";
import { Session, gotoHome, settle, writeJson } from "./lib/driver";
import { langOf } from "./lib/i18n";
import { instrument } from "./lib/instrument";

// Layout checks on the screens outside games: players, settings, the pack library and editor,
// every game's setup and pack picker.

const ROUTES = ["#/players", "#/settings", "#/packs", "#/packs/new", "#/packs/import"];
const GAMES = ["impostor", "whos-the-liar", "bomb", "never-have-i-ever", "truth-or-dare", "most-likely-to", "ten-out-of-ten", "forbidden-words", "mind-match", "circa"];

test("other screens", async ({ page }, info) => {
  const lang = langOf(info.project.name);
  const errors = await instrument(page);
  await gotoHome(page);
  const session = new Session(page, lang, info.project.name, "screens");
  await session.snap("home");
  for (const route of ROUTES) {
    await page.goto(`./${route}`);
    await settle(page);
    await session.snap(route.replace(/\W+/g, "-"));
  }
  await page.goto("./#/packs");
  await settle(page);
  const packLink = page.locator('main a[href^="#/packs/"]').first();
  if (await packLink.isVisible().catch(() => false)) {
    await packLink.click();
    await settle(page);
    await session.snap("pack-detail");
  }
  for (const game of GAMES) {
    await page.goto(`./#/play/${game}/setup`);
    await page.locator("footer button").first().waitFor({ timeout: 10_000 });
    await session.snap(`setup-${game}`);
    const more = page.getByRole("button", { name: session.t("setup.more"), exact: true });
    if (await more.isVisible().catch(() => false)) {
      await more.click();
      await settle(page);
      await session.snap(`setup-more-${game}`, true);
    }
    const picker = page.locator(`a[href="#/play/${game}/packs"]`);
    if (await picker.isVisible().catch(() => false)) {
      await picker.click();
      await settle(page);
      await session.snap(`picker-${game}`);
    }
  }
  writeJson(`${info.project.name}/screens.json`, { project: info.project.name, screens: [...session.screens.values()], errors });
});
