import { describe, expect, it } from "vitest";
import { pickUnused, type UsedByPack } from "./history";

const items = [
  { id: "a1", packId: "a" },
  { id: "a2", packId: "a" },
  { id: "a3", packId: "a" },
  { id: "b1", packId: "b" },
];

describe("no-repeat history", () => {
  it("never repeats an item until its pack is exhausted", () => {
    let used: UsedByPack = {};
    const seen: string[] = [];
    for (let i = 0; i < 3; i++) {
      const result = pickUnused(items.slice(0, 3), used);
      seen.push(result.item.id);
      used = result.usedByPack;
    }
    expect(seen.sort()).toEqual(["a1", "a2", "a3"]);
  });

  it("resets an exhausted pack and starts again", () => {
    const { item, usedByPack } = pickUnused(items.slice(0, 3), { a: ["a1", "a2", "a3"] });
    expect(usedByPack.a).toEqual([item.id]);
  });

  it("keeps other packs' history when one pack is exhausted", () => {
    const { usedByPack } = pickUnused(items, { a: ["a1", "a2", "a3"], b: [] });
    expect(Object.values(usedByPack).flat()).toHaveLength(1);
  });

  it("only picks unused items while some remain", () => {
    for (let i = 0; i < 50; i++) {
      const { item } = pickUnused(items.slice(0, 3), { a: ["a1", "a3"] });
      expect(item.id).toBe("a2");
    }
  });

  it("drops ids that no longer exist in the pack", () => {
    const { usedByPack } = pickUnused(items.slice(0, 3), { a: ["gone", "a1"] });
    expect(usedByPack.a).not.toContain("gone");
  });

  it("fails loudly with no items", () => {
    expect(() => pickUnused([], {})).toThrow(RangeError);
  });
});
