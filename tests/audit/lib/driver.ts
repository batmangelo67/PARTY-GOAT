import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Page } from "@playwright/test";
import type { MessageKey } from "../../../src/i18n/en";
import { tr, type Lang } from "./i18n";
import { checkLayout, type LayoutIssue } from "./layout";

// AUDIT_LABEL keeps runs apart, e.g. "before" and "after".
export const RUNS_DIR = path.join(fileURLToPath(new URL("../../../docs/audit/runs", import.meta.url)), process.env.AUDIT_LABEL ?? "latest");

export const PLAYER_NAMES = ["Alessandra", "Bo", "Chiara", "Dev"];

export interface ScreenRecord {
  id: string;
  shot?: string;
  issues: LayoutIssue[];
}

// One audited journey: counts every tap and text entry, and records each distinct screen it sees.
export class Session {
  taps = 0;
  texts = 0;
  waits = 0;
  steps: string[] = [];
  screens = new Map<string, ScreenRecord>();
  private shotIndex = 0;

  constructor(
    readonly page: Page,
    readonly lang: Lang,
    readonly project: string,
    readonly label: string,
    readonly options: { shots: boolean; layout: boolean } = { shots: true, layout: true },
  ) {}

  t(key: MessageKey, params: Record<string, string | number> = {}): string {
    return tr(this.lang, key, params);
  }

  mark(): { taps: number; texts: number } {
    return { taps: this.taps, texts: this.texts };
  }

  async tapSelector(selector: string, note: string): Promise<void> {
    await this.page.locator(selector).first().click({ timeout: 10_000 });
    this.taps += 1;
    this.steps.push(note);
    await settle(this.page);
  }

  async tapText(key: MessageKey, params: Record<string, string | number> = {}): Promise<void> {
    const label = this.t(key, params);
    await this.page.getByRole("button", { name: label, exact: true }).first().click({ timeout: 10_000 });
    this.taps += 1;
    this.steps.push(`tap "${label}"`);
    await settle(this.page);
  }

  async typeInto(selector: string, text: string, note: string): Promise<void> {
    const input = this.page.locator(selector).first();
    await input.click();
    await input.fill(text);
    this.taps += 1;
    this.texts += 1;
    this.steps.push(`type ${note}`);
  }

  // Records a screen once: screenshot plus layout checks. `distinct` keeps states of one screen apart.
  async snap(name: string, distinct = false): Promise<void> {
    const id = `${await screenId(this.page)}${distinct ? ` :: ${name}` : ""}`;
    if (this.screens.has(id)) return;
    const record: ScreenRecord = { id, issues: [] };
    if (this.options.layout) record.issues = await checkLayout(this.page);
    if (this.options.shots) {
      this.shotIndex += 1;
      const file = path.join(RUNS_DIR, this.project, this.label, `${String(this.shotIndex).padStart(2, "0")}-${slug(name)}.jpg`);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      await this.page.screenshot({ path: file, type: "jpeg", quality: 55 });
      record.shot = path.relative(RUNS_DIR, file);
    }
    this.screens.set(id, record);
  }
}

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export async function settle(page: Page): Promise<void> {
  await page.waitForTimeout(120);
}

// Stable identity of the current screen: route + heading + footer labels (not card text).
export async function screenId(page: Page): Promise<string> {
  return page.evaluate(() => {
    const heading = document.querySelector("main h1, header h1, main [data-screen]")?.textContent?.trim() ?? "";
    const footer = [...document.querySelectorAll("footer button, footer a")].map((el) => el.textContent?.trim()).join("|");
    const hash = location.hash.replace(/\/[0-9a-f-]{20,}/g, "/:id");
    return `${hash} :: ${heading.slice(0, 40)} :: ${footer}`;
  });
}

export async function gotoHome(page: Page): Promise<void> {
  await page.goto("./#/");
  await page.locator('a[href="#/play/impostor/setup"]').waitFor({ timeout: 20_000 });
}

export async function openGame(session: Session, gameId: string): Promise<void> {
  await session.tapSelector(`a[href="#/play/${gameId}/setup"]`, `open ${gameId}`);
  await waitForScreen(session.page);
}

// Screens may load as separate chunks: wait until one has actions in its footer.
export async function waitForScreen(page: Page): Promise<void> {
  await page.locator("footer button").first().waitFor({ timeout: 10_000 });
}

// Adds the audit players through the setup screen's player editor, skipping names already there.
export async function addPlayers(session: Session, names: readonly string[]): Promise<void> {
  const input = `input[placeholder="${session.t("players.addPlaceholder")}"]`;
  if (!(await session.page.locator(input).isVisible().catch(() => false))) return;
  const existing = await session.page.evaluate(() => [...document.querySelectorAll("main li input, main [data-player-name]")].map((el) => (el as HTMLInputElement).value || el.textContent || ""));
  for (const name of names.filter((n) => !existing.includes(n))) {
    await session.typeInto(input, name, `player ${name}`);
    await session.tapText("players.add");
  }
}

export interface Pick {
  kind: "fill" | "click" | "none";
  numeric?: boolean;
  label?: string;
}

// Chooses the next "obvious" action on screen the way a first-time player would:
// fill an empty field, else the accent (primary) button, else a candidate when the
// primary is blocked (voting), else the last footer button.
export async function pickNextAction(page: Page): Promise<Pick> {
  return page.evaluate(() => {
    document.querySelectorAll("[data-audit-target]").forEach((el) => el.removeAttribute("data-audit-target"));
    const visible = (el: Element) => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
    };
    const enabled = (el: Element) => !(el as HTMLButtonElement).disabled && el.getAttribute("aria-disabled") !== "true";
    const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim().split(/\s+/).map(Number);
    const isPrimary = (el: Element) => {
      const channels = getComputedStyle(el).backgroundColor.match(/[\d.]+/g)?.map(Number) ?? [];
      return channels.length >= 3 && accent.every((value, i) => Math.abs(value - (channels[i] ?? -999)) < 3) && (channels[3] ?? 1) > 0.9;
    };
    const target = (el: Element, kind: "fill" | "click", numeric = false) => {
      el.setAttribute("data-audit-target", "1");
      return { kind, numeric, label: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40) };
    };

    const input = [...document.querySelectorAll("main input:not([type=hidden]), main textarea")].find(
      (el) => visible(el) && !(el as HTMLInputElement).value && !(el as HTMLInputElement).readOnly,
    );
    if (input) {
      const numeric = (input as HTMLInputElement).type === "number" || (input as HTMLInputElement).inputMode === "decimal" || (input as HTMLInputElement).inputMode === "numeric";
      return target(input, "fill", numeric);
    }

    const clickable = (root: string) =>
      [...document.querySelectorAll(`${root} button, ${root} a[href]`)].filter((el) => visible(el) && !el.closest("[data-audit-skip]"));
    const footer = clickable("footer");
    const main = clickable("main");
    const footerPrimary = footer.find((el) => isPrimary(el) && enabled(el));
    if (footerPrimary) return target(footerPrimary, "click");
    const mainPrimary = main.find((el) => isPrimary(el) && enabled(el) && el.tagName === "BUTTON");
    if (mainPrimary) return target(mainPrimary, "click");
    const blockedPrimary = footer.some((el) => isPrimary(el) && !enabled(el));
    const mainButton = main.find((el) => enabled(el) && el.tagName === "BUTTON");
    if (blockedPrimary && mainButton) return target(mainButton, "click");
    const lastFooter = footer.filter(enabled).at(-1);
    if (lastFooter) return target(lastFooter, "click");
    if (mainButton) return target(mainButton, "click");
    return { kind: "none" as const };
  });
}

const FILL_WORDS = ["apple", "moon", "pizza", "river", "guitar"];

export async function doAction(session: Session, pick: Pick, fillIndex: number): Promise<void> {
  const target = session.page.locator('[data-audit-target="1"]').first();
  if (pick.kind === "fill") {
    await target.click();
    await target.fill(pick.numeric ? String(40 + fillIndex) : FILL_WORDS[fillIndex % FILL_WORDS.length]!);
    session.taps += 1;
    session.texts += 1;
    session.steps.push(`type into "${pick.label}"`);
  } else if (pick.kind === "click") {
    await target.click();
    session.taps += 1;
    session.steps.push(`tap "${pick.label}"`);
  }
  await settle(session.page);
}

export async function isVisible(page: Page, label: string): Promise<boolean> {
  return page.getByRole("button", { name: label, exact: true }).first().isVisible().catch(() => false);
}

export async function resultReached(session: Session): Promise<boolean> {
  for (const key of ["common.playAgain", "common.newGame", "bomb.boom.next"] as const) {
    if (await isVisible(session.page, session.t(key))) return true;
  }
  return false;
}

// Drives the game with obvious actions until `done` is true. When the same screen repeats (a timer,
// a fuse, a turn), it fast-forwards the fake clock like a group waiting it out.
export async function driveUntil(session: Session, done: () => Promise<boolean>, maxSteps = 80): Promise<boolean> {
  let lastId = "";
  let repeats = 0;
  for (let step = 0; step < maxSteps; step += 1) {
    await session.snap(`step-${step}`);
    if (await done()) return true;
    const id = await screenId(session.page);
    repeats = id === lastId ? repeats + 1 : 0;
    lastId = id;
    if (repeats >= 4) {
      await session.page.clock.fastForward("03:00");
      session.waits += 1;
      session.steps.push("wait (fast-forward 3 min)");
      repeats = 0;
      await settle(session.page);
      continue;
    }
    let pick = await pickNextAction(session.page);
    if (pick.kind === "none") {
      await session.page.waitForTimeout(400);
      pick = await pickNextAction(session.page);
    }
    if (pick.kind === "none") return done();
    await doAction(session, pick, step);
  }
  return done();
}

export function writeJson(file: string, data: unknown): void {
  const full = path.join(RUNS_DIR, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(data, null, 2));
}
