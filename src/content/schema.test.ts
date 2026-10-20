import { describe, expect, it } from "vitest";
import { parseBackup } from "../storage/backup";
import { itemId, toPackFile, withItemIds } from "./items";
import { mergePacks, parsePackFile, parsePacks } from "./loader";
import type { PackFile } from "./schema";

const customPack: PackFile = {
  id: "custom-friends",
  title: "Our friends",
  language: "it",
  spice: 1,
  kind: "words",
  games: ["impostor"],
  items: [{ word: "Tiramisù", hint: "Dolce" }, { word: "Vespa" }],
};

describe("pack schema", () => {
  it("rejects a pack with an unknown kind", () => {
    expect(() => parsePackFile({ ...customPack, kind: "riddles" }, "bad")).toThrow(/bad/);
  });

  it("rejects items of the wrong shape for their kind", () => {
    expect(() => parsePackFile({ ...customPack, items: [{ question: "Hi there?" }] }, "bad")).toThrow();
  });

  it("rejects unknown item fields", () => {
    expect(() => parsePackFile({ ...customPack, items: [{ word: "A", extra: 1 }] }, "bad")).toThrow();
  });

  it("collects invalid packs as errors instead of crashing", () => {
    const result = parsePacks([["ok", customPack], ["broken", { id: "x" }]], "custom");
    expect(result.packs).toHaveLength(1);
    expect(result.errors[0]).toMatch(/broken/);
  });
});

describe("item ids", () => {
  it("are stable when items are reordered", () => {
    const reordered = { ...customPack, items: [...customPack.items].reverse() };
    expect(itemId(customPack, 0)).toBe(itemId(reordered, 1));
  });

  it("are unique per pack", () => {
    const pack = withItemIds(customPack, "custom");
    expect(new Set(pack.items.map((i) => i.id)).size).toBe(2);
    expect(pack.items[0]?.id.startsWith("custom-friends#")).toBe(true);
  });
});

describe("custom packs", () => {
  it("survive a save and load round trip", () => {
    const loaded = withItemIds(customPack, "custom");
    const stored = JSON.parse(JSON.stringify({ ...toPackFile(loaded), source: "custom" }));
    const reloaded = parsePacks([["stored", stored]], "custom").packs[0];
    expect(reloaded).toEqual(loaded);
  });

  it("never override a builtin pack with the same id", () => {
    const builtin = withItemIds({ ...customPack, id: "it-cibo" }, "builtin");
    const clash = withItemIds({ ...customPack, id: "it-cibo", title: "Fake" }, "custom");
    const merged = mergePacks([builtin], [clash, withItemIds(customPack, "custom")]);
    expect(merged.map((p) => `${p.id}:${p.source}`)).toEqual(["it-cibo:builtin", "custom-friends:custom"]);
  });
});

describe("backup", () => {
  const backup = {
    app: "party-goat",
    version: 1,
    exportedAt: "2026-10-20T00:00:00.000Z",
    settings: { language: "it", sound: true, animations: true, theme: "lime", maxSpice: 1 },
    players: [{ id: "1", name: "Giulia" }],
    customPacks: [customPack],
    history: { "it-cibo": ["it-cibo#abc"] },
  };

  it("accepts a valid backup after a JSON round trip", () => {
    expect(parseBackup(JSON.parse(JSON.stringify(backup)))).toEqual(backup);
  });

  it("rejects files from other apps with a readable reason", () => {
    expect(() => parseBackup({ ...backup, app: "something-else" })).toThrow(/app/);
    expect(() => parseBackup({ ...backup, customPacks: [{ id: "x" }] })).toThrow(/customPacks/);
  });
});
