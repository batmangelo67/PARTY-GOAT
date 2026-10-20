import { describe, expect, it } from "vitest";
import { withItemIds } from "./items";
import { filterPackList, filterPickerPacks, type PackListFilters } from "./pack-filter";
import type { Pack } from "./schema";

const base = { spice: 0, kind: "words" as const, games: ["impostor"], items: [{ word: "A" }] };
const packs = [
  withItemIds({ ...base, id: "en-food", title: "Food", language: "en" as const }, "builtin"),
  withItemIds({ ...base, id: "it-citta", title: "Città italiane", language: "it" as const, spice: 2 }, "builtin"),
  withItemIds({ ...base, id: "custom-x-1", title: "Our jokes", language: "en" as const }, "custom"),
];
const all: PackListFilters = { language: "all", kind: "all", maxSpice: 3, source: "all", query: "" };

describe("pack list filters", () => {
  it("filters by language, spice and source", () => {
    expect(filterPackList(packs, { ...all, language: "it" }).map((p) => p.id)).toEqual(["it-citta"]);
    expect(filterPackList(packs, { ...all, maxSpice: 1 })).toHaveLength(2);
    expect(filterPackList(packs, { ...all, source: "custom" }).map((p) => p.id)).toEqual(["custom-x-1"]);
    expect(filterPackList(packs, { ...all, kind: "prompts" })).toEqual([]);
  });

  it("searches titles ignoring case and accents", () => {
    expect(filterPackList(packs, { ...all, query: "CITTA" }).map((p) => p.id)).toEqual(["it-citta"]);
  });
});

describe("filterPickerPacks", () => {
  const make = (id: string, spice: number, language: "en" | "it", games: string[]) =>
    ({ id, title: id, language, spice, kind: "prompts", games, source: "builtin", items: [] }) as unknown as Pack;
  const packs = [make("a", 0, "en", ["nhie"]), make("b", 2, "en", ["nhie"]), make("c", 1, "it", ["nhie"]), make("d", 0, "en", ["other"])];
  const base = { gameId: "nhie", kinds: ["prompts"] as const, language: "en" as const, allLanguages: false };

  it("hides packs above the spice limit and from other games or languages", () => {
    expect(filterPickerPacks(packs, { ...base, maxSpice: 1 }).map((p) => p.id)).toEqual(["a"]);
    expect(filterPickerPacks(packs, { ...base, maxSpice: 3 }).map((p) => p.id)).toEqual(["a", "b"]);
  });

  it("includes other languages on request", () => {
    expect(filterPickerPacks(packs, { ...base, allLanguages: true, maxSpice: 1 }).map((p) => p.id)).toEqual(["a", "c"]);
  });
});
