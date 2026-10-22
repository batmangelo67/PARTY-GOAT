import { describe, expect, it } from "vitest";
import { ALL_FOLDERS, folderChips, inFolder, normalizeSelection, pickerRows, toggleSelection } from "./picker-selection";
import { defaultPacks, resolvePacks } from "./resolve-packs";
import type { Pack } from "./schema";

const make = (id: string, title: string, language: "en" | "it" = "en", spice = 0, games = ["nhie"]) =>
  ({ id, title, language, spice, kind: "prompts", games, source: "builtin", items: [] }) as unknown as Pack;

describe("pack resolution", () => {
  const packs = [make("a", "Alpha"), make("b", "Beta", "en", 2), make("c", "Ciao", "it"), make("d", "Delta", "en", 0, ["other"])];
  const scope = { gameId: "nhie", kinds: ["prompts"] as const, language: "en" as const, maxSpice: 1 };

  it("mixes every pack of the game in the app language within the spice limit by default", () => {
    expect(resolvePacks(packs, scope, null).map((p) => p.id)).toEqual(["a"]);
  });

  it("falls back to any language when the app language has no packs", () => {
    expect(defaultPacks(packs, { ...scope, language: "it" }).map((p) => p.id)).toEqual(["c"]);
    expect(defaultPacks([make("c", "Ciao", "it")], scope).map((p) => p.id)).toEqual(["c"]);
  });

  it("keeps an explicit choice across languages but drops deleted, foreign-game or too-spicy packs", () => {
    expect(resolvePacks(packs, scope, ["c", "b", "d", "gone"]).map((p) => p.id)).toEqual(["c"]);
  });
});

describe("picker selection", () => {
  const defaults = ["a", "b", "c"];

  it("starts from the default mix when nothing was chosen", () => {
    expect(toggleSelection(null, defaults, "b")).toEqual(["a", "c"]);
    expect(toggleSelection(null, defaults, "x")).toEqual(["a", "b", "c", "x"]);
  });

  it("returns to the mix when the choice equals the defaults", () => {
    expect(toggleSelection(["a", "c"], defaults, "b")).toBeNull();
    expect(normalizeSelection(["c", "b", "a"], defaults)).toBeNull();
    expect(normalizeSelection([], defaults)).toEqual([]);
  });
});

describe("picker rows", () => {
  const packs = [make("a", "Zoo"), make("b", "Città"), make("c", "Apple")];
  const base = { filter: "all" as const, query: "", recentIds: [] as string[], favoriteIds: [] as string[] };

  it("lists starred packs first, then by title", () => {
    expect(pickerRows(packs, { ...base, favoriteIds: ["a"] }).map((p) => p.id)).toEqual(["a", "c", "b"]);
  });

  it("searches titles ignoring case and accents, across every filter", () => {
    expect(pickerRows(packs, { ...base, filter: "starred", query: "CITTA" }).map((p) => p.id)).toEqual(["b"]);
  });

  it("keeps recents in play order and skips packs that no longer exist", () => {
    expect(pickerRows(packs, { ...base, filter: "recent", recentIds: ["c", "gone", "a"] }).map((p) => p.id)).toEqual(["c", "a"]);
  });

  it("shows only starred packs on the starred filter", () => {
    expect(pickerRows(packs, { ...base, filter: "starred", favoriteIds: ["b"] }).map((p) => p.id)).toEqual(["b"]);
  });
});

describe("picker folders", () => {
  const inGroup = (id: string, group?: string, section?: string) => ({ ...make(id, id.toUpperCase()), group, section }) as Pack;
  const packs = [
    inGroup("film", "entertainment"),
    inGroup("calcio", "sports", "football"),
    inGroup("nba", "sports", "basketball"),
    inGroup("odd", "other"),
    inGroup("mine"),
  ];
  const labels = { group: (id: string) => id, section: (id: string) => id };

  it("lists every group, sorted by label, with other last", () => {
    expect(folderChips(packs, ALL_FOLDERS, labels).groups).toEqual(["entertainment", "sports", "other"]);
  });

  it("shows sections only for the chosen group", () => {
    expect(folderChips(packs, ALL_FOLDERS, labels).sections).toEqual([]);
    expect(folderChips(packs, { group: "sports", section: null }, labels).sections).toEqual(["basketball", "football"]);
  });

  it("hides a row with a single choice", () => {
    const one = [inGroup("a", "sports", "football"), inGroup("b", "sports", "football")];
    expect(folderChips(one, { group: "sports", section: "football" }, labels)).toEqual({
      groups: [],
      sections: [],
      active: ALL_FOLDERS,
    });
  });

  it("falls back to all when the chosen folder is gone", () => {
    expect(folderChips(packs, { group: "gaming", section: "retro" }, labels).active).toEqual(ALL_FOLDERS);
    expect(folderChips(packs, { group: "sports", section: "retro" }, labels).active).toEqual({ group: "sports", section: null });
  });

  it("puts packs without a group in other", () => {
    expect(inFolder(inGroup("mine"), { group: "other", section: null })).toBe(true);
  });

  it("limits the rows to the folder, but search still covers every pack", () => {
    const rows = (folder = ALL_FOLDERS, query = "") => pickerRows(packs, { filter: "all", query, recentIds: [], favoriteIds: [], folder }).map((p) => p.id);
    expect(rows({ group: "sports", section: null })).toEqual(["calcio", "nba"]);
    expect(rows({ group: "sports", section: "basketball" })).toEqual(["nba"]);
    expect(rows({ group: "sports", section: null }, "film")).toEqual(["film"]);
  });
});
