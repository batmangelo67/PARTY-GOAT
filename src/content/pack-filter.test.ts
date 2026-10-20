import { describe, expect, it } from "vitest";
import { withItemIds } from "./items";
import { filterPackList, type PackListFilters } from "./pack-filter";

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
