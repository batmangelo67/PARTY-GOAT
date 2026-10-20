import { describe, expect, it } from "vitest";
import { pick, pickMany, randomId, randomInt, shuffle } from "./random";

describe("random", () => {
  it("randomInt stays in range", () => {
    for (let i = 0; i < 1000; i++) {
      const n = randomInt(7);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(7);
    }
  });

  it("randomInt rejects bad ranges", () => {
    expect(() => randomInt(0)).toThrow(RangeError);
    expect(() => randomInt(2.5)).toThrow(RangeError);
  });

  it("shuffle keeps every item and does not mutate the input", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result.sort()).toEqual([1, 2, 3, 4, 5]);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });

  it("pickMany returns distinct items and refuses impossible counts", () => {
    const picked = pickMany(["a", "b", "c", "d"], 3);
    expect(new Set(picked).size).toBe(3);
    expect(() => pickMany(["a"], 2)).toThrow(RangeError);
  });

  it("pick fails loudly on an empty list", () => {
    expect(() => pick([])).toThrow(RangeError);
  });

  it("randomId is 16 hex chars", () => {
    expect(randomId()).toMatch(/^[0-9a-f]{16}$/);
  });
});
