import { describe, expect, it } from "vitest";
import { GAMES } from "../games/registry";
import { LANGUAGES } from "../i18n/languages";
import { groupKey, sectionKey } from "../i18n/labels";
import { importBuiltinPacks, loadBuiltinPacks, parsePackFile } from "./loader";

const MIN_PACKS_PER_GAME_AND_LANGUAGE = 5;
const MIN_ITEMS_PER_PACK = 25;
const MAX_HINT_WORDS = 3;
const MIN_BANNED_WORDS = 4;
const MAX_BANNED_WORDS = 5;

const { entries } = await importBuiltinPacks();
const { packs, errors } = await loadBuiltinPacks();

describe("builtin packs", () => {
  it("are found by the loader", () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it.each(entries)("%s matches the schema", (path, raw) => {
    expect(() => parsePackFile(raw, path)).not.toThrow();
  });

  it("name every folder and section with a translated label", () => {
    const missing = packs.flatMap((pack) => [
      ...(pack.group && !groupKey(pack.group) ? [`${pack.id}: group ${pack.group}`] : []),
      ...(pack.section && !sectionKey(pack.section) ? [`${pack.id}: section ${pack.section}`] : []),
    ]);
    expect(missing).toEqual([]);
  });

  it("all load without errors", () => {
    expect(errors).toEqual([]);
  });

  it.each(entries)("%s id matches its folders and file name", (path, raw) => {
    const [, language, game, slug] = path.match(/packs\/(\w+)\/([\w-]+)\/([\w-]+)\.json$/) ?? [];
    expect(raw).toMatchObject({ id: `${language}-${game}-${slug}`, language, games: [game] });
  });

  it.each(packs.map((p) => [p.id, p] as const))("%s sits in a folder and has enough items", (_id, pack) => {
    expect(pack.group, pack.id).toBeTruthy();
    expect(pack.items.length, pack.id).toBeGreaterThanOrEqual(MIN_ITEMS_PER_PACK);
  });

  it("have unique ids", () => {
    const ids = packs.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(packs.map((p) => [p.id, p] as const))("%s has no duplicate items", (_id, pack) => {
    const ids = pack.items.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("only target registered games that accept their kind", () => {
    for (const pack of packs) {
      for (const gameId of pack.games) {
        const game = GAMES.find((g) => g.id === gameId);
        expect(game, `${pack.id} targets unknown game ${gameId}`).toBeDefined();
        expect(game?.acceptsKinds, `${pack.id} kind`).toContain(pack.kind);
      }
    }
  });

  it("have short hints that never contain their own word", () => {
    for (const pack of packs) {
      if (pack.kind !== "words") continue;
      for (const item of pack.items) {
        expect(item.hint, `${pack.id}: ${item.word} needs a hint`).toBeTruthy();
        expect(item.difficulty, `${pack.id}: ${item.word} needs a difficulty`).toBeDefined();
        const hint = item.hint!.toLowerCase();
        expect(hint.includes(item.word.toLowerCase()), `${pack.id}: hint of ${item.word}`).toBe(false);
        expect(hint.split(/\s+/).length, `${pack.id}: hint of ${item.word}`).toBeLessThanOrEqual(MAX_HINT_WORDS);
      }
    }
  });

  it("have no duplicate words across word packs of the same language", () => {
    for (const language of LANGUAGES) {
      const words = packs.flatMap((p) => (p.kind === "words" && p.language === language ? p.items.map((i) => i.word.toLowerCase()) : []));
      expect(words.filter((word, i) => words.indexOf(word) !== i), language).toEqual([]);
    }
  });

  it("have liar questions that differ from the main question", () => {
    for (const pack of packs) {
      if (pack.kind !== "question-pairs") continue;
      for (const item of pack.items) expect(item.liarQuestion, pack.id).not.toBe(item.question);
    }
  });

  it("give every truth or dare pack both truths and dares", () => {
    for (const pack of packs) {
      if (!pack.games.includes("truth-or-dare") || pack.kind !== "prompts") continue;
      const types = new Set(pack.items.map((item) => item.type));
      expect([...types].sort(), pack.id).toEqual(["dare", "truth"]);
    }
  });

  it("give every forbidden word card 4 or 5 banned words that never contain the word", () => {
    for (const pack of packs) {
      if (pack.kind !== "cards") continue;
      for (const item of pack.items) {
        expect(item.banned.length, `${pack.id}: ${item.word}`).toBeGreaterThanOrEqual(MIN_BANNED_WORDS);
        expect(item.banned.length, `${pack.id}: ${item.word}`).toBeLessThanOrEqual(MAX_BANNED_WORDS);
        const word = item.word.toLowerCase();
        for (const banned of item.banned) {
          expect(banned.toLowerCase().includes(word), `${pack.id}: ${item.word} bans ${banned}`).toBe(false);
        }
        expect(new Set(item.banned.map((b) => b.toLowerCase())).size, `${pack.id}: ${item.word}`).toBe(item.banned.length);
      }
    }
  });

  it("give every circa question a unit, a decoy question and a decoy answer that differs from the truth", () => {
    for (const pack of packs) {
      if (pack.kind !== "numeric") continue;
      for (const item of pack.items) {
        expect(item.decoyQuestion, `${pack.id}: ${item.question}`).toBeTruthy();
        expect(item.decoyQuestion, pack.id).not.toBe(item.question);
        expect(item.decoyAnswer, `${pack.id}: ${item.question}`).toBeDefined();
      }
    }
  });

  it("give every bomb prompt 3 to 6 examples", () => {
    for (const pack of packs) {
      if (pack.kind !== "prompts" || !pack.games.includes("bomb")) continue;
      for (const item of pack.items) expect(item.examples?.length, `${pack.id}: ${item.text}`).toBeGreaterThanOrEqual(3);
    }
  });

  it.each(LANGUAGES)("give every game enough packs in %s", (language) => {
    for (const game of GAMES) {
      const count = packs.filter((p) => p.language === language && p.games.includes(game.id)).length;
      expect(count, `${game.id} in ${language}`).toBeGreaterThanOrEqual(MIN_PACKS_PER_GAME_AND_LANGUAGE);
    }
  });
});
