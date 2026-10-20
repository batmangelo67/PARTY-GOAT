import { describe, expect, it } from "vitest";
import { slugify } from "./custom-pack-id";
import { withItemIds } from "./items";
import { parsePacks } from "./loader";
import { packsToJson, PackImportError, planImport, readImportText, type ExistingPack } from "./pack-import";
import type { PackFile } from "./schema";

const wordsPack: PackFile = {
  id: "custom-friends-a1b2c3",
  title: "Our friends",
  language: "it",
  spice: 0,
  kind: "words",
  games: ["impostor", "bomb"],
  items: [{ word: "Vespa", hint: "Scooter" }, { word: "Moka" }],
};
const pairsPack: PackFile = {
  id: "custom-pairs-d4e5f6",
  title: "Pairs",
  language: "en",
  spice: 1,
  kind: "question-pairs",
  games: ["whos-the-liar"],
  items: [{ question: "Best pizza topping?", liarQuestion: "Worst pizza topping?" }],
};
const promptsPack: PackFile = {
  id: "custom-nights-g7h8i9",
  title: "Nights out",
  language: "en",
  spice: 2,
  kind: "prompts",
  games: ["never-have-i-ever"],
  items: [{ text: "Never have I ever missed the last train" }, { text: "Truth: who was your first crush?", type: "truth" }],
};

const errorCode = (fn: () => unknown) => {
  try {
    fn();
  } catch (error) {
    return error instanceof PackImportError ? error.code : "other";
  }
  return null;
};

describe("reading import text", () => {
  it("accepts a single pack object", () => {
    const read = readImportText(JSON.stringify(wordsPack));
    expect(read.candidates.map((c) => c.pack)).toEqual([wordsPack]);
    expect(read.rejected).toEqual([]);
  });

  it("accepts an array and rejects bad entries with a reason", () => {
    const read = readImportText(JSON.stringify([wordsPack, { title: "Broken", kind: "words" }, pairsPack]));
    expect(read.candidates.map((c) => c.index)).toEqual([0, 2]);
    expect(read.rejected).toHaveLength(1);
    expect(read.rejected[0]).toMatchObject({ index: 1, label: "Broken" });
    expect(read.rejected[0]?.field).toMatch(/^(id|language|spice|games|items)$/);
  });

  it("forces imported packs to drop any claimed source", () => {
    const read = readImportText(JSON.stringify({ ...wordsPack, source: "builtin" }));
    expect(read.candidates[0]?.pack).not.toHaveProperty("source");
  });

  it("fails with a clear code for invalid JSON, empty input and non-pack JSON", () => {
    expect(errorCode(() => readImportText("{ nope"))).toBe("invalidJson");
    expect(errorCode(() => readImportText("   "))).toBe("empty");
    expect(errorCode(() => readImportText("[]"))).toBe("empty");
    expect(errorCode(() => readImportText("42"))).toBe("notPacks");
  });
});

describe("planning an import", () => {
  const existing: ExistingPack[] = [
    { id: wordsPack.id, source: "custom" },
    { id: "en-food", source: "builtin" },
  ];

  it("adds packs without collisions", () => {
    const plan = planImport(readImportText(JSON.stringify(pairsPack)), existing, {});
    expect(plan.toSave).toEqual([pairsPack]);
    expect(plan.summary.added).toEqual(["Pairs"]);
  });

  it("applies overwrite, keep both and skip per pack", () => {
    const read = readImportText(JSON.stringify([wordsPack, wordsPack, wordsPack]));
    const plan = planImport(read, existing, { 0: "overwrite", 1: "keepBoth", 2: "skip" });
    expect(plan.toSave[0]?.id).toBe(wordsPack.id);
    expect(plan.toSave[1]?.id).toMatch(/^custom-our-friends-[0-9a-f]{6}$/);
    expect(plan.toSave[1]?.id).not.toBe(wordsPack.id);
    expect(plan.summary).toMatchObject({ replaced: ["Our friends"], added: ["Our friends"], skipped: ["Our friends"] });
  });

  it("never overwrites a builtin pack", () => {
    const plan = planImport(readImportText(JSON.stringify({ ...wordsPack, id: "en-food" })), existing, { 0: "overwrite" });
    expect(plan.toSave[0]?.id).not.toBe("en-food");
    expect(plan.summary.replaced).toEqual([]);
  });

  it("gives a duplicate id inside the same import its own id", () => {
    const plan = planImport(readImportText(JSON.stringify([pairsPack, pairsPack])), existing, {});
    expect(new Set(plan.toSave.map((p) => p.id)).size).toBe(2);
  });

  it("carries rejections into the summary", () => {
    const plan = planImport(readImportText(JSON.stringify([{ id: "x" }])), existing, {});
    expect(plan.toSave).toEqual([]);
    expect(plan.summary.rejected).toHaveLength(1);
  });
});

describe("custom pack round trip", () => {
  it.each([wordsPack, pairsPack, promptsPack])("$kind survives storage, export and import", (file) => {
    const stored = JSON.parse(JSON.stringify({ ...file, source: "custom" }));
    const loaded = parsePacks([["stored", stored]], "custom").packs[0]!;
    expect(loaded).toEqual(withItemIds(file, "custom"));

    const exported = packsToJson([loaded], false);
    const plan = planImport(readImportText(exported), [], {});
    expect(plan.toSave).toEqual([file]);
    expect(withItemIds(plan.toSave[0]!, "custom")).toEqual(loaded);
  });

  it("exports several packs as an array", () => {
    const packs = [withItemIds(wordsPack, "custom"), withItemIds(promptsPack, "custom")];
    expect(readImportText(packsToJson(packs, true)).candidates).toHaveLength(2);
  });
});

describe("custom pack ids", () => {
  it("slugify strips accents and symbols", () => {
    expect(slugify("Città & Caffè!")).toBe("citta-caffe");
    expect(slugify("!!!")).toBe("pack");
  });
});
