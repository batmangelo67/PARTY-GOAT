import { describe, expect, it } from "vitest";
import { GAMES } from "../games/registry";
import { LANGUAGES } from "../i18n/languages";
import { importBuiltinPacks, loadBuiltinPacks, parsePackFile } from "./loader";

const MIN_WORD_PACKS_PER_LANGUAGE = 8;
const MIN_PAIR_PACKS_PER_LANGUAGE = 3;
const MIN_PROMPT_PACKS_PER_LANGUAGE = 3;
const MIN_BOMB_PACKS_PER_LANGUAGE = 6;
const MAX_HINT_WORDS = 3;

const { entries } = await importBuiltinPacks();
const { packs, errors } = await loadBuiltinPacks();

describe("builtin packs", () => {
  it("are found by the loader", () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it.each(entries)("%s matches the schema", (path, raw) => {
    expect(() => parsePackFile(raw, path)).not.toThrow();
  });

  it("all load without errors", () => {
    expect(errors).toEqual([]);
  });

  it.each(entries)("%s id matches its folder and file name", (path, raw) => {
    const [, language, slug] = path.match(/packs\/(\w+)\/([\w-]+)\.json$/) ?? [];
    expect(raw).toMatchObject({ id: `${language}-${slug}`, language });
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

  it.each(LANGUAGES)("cover the starter set in %s", (language) => {
    const ofLanguage = packs.filter((p) => p.language === language);
    expect(ofLanguage.filter((p) => p.kind === "words").length).toBeGreaterThanOrEqual(MIN_WORD_PACKS_PER_LANGUAGE);
    expect(ofLanguage.filter((p) => p.kind === "question-pairs").length).toBeGreaterThanOrEqual(MIN_PAIR_PACKS_PER_LANGUAGE);
    expect(ofLanguage.filter((p) => p.kind === "prompts").length).toBeGreaterThanOrEqual(MIN_PROMPT_PACKS_PER_LANGUAGE);
    expect(ofLanguage.filter((p) => p.games.includes("bomb")).length).toBeGreaterThanOrEqual(MIN_BOMB_PACKS_PER_LANGUAGE);
  });
});
