import { describe, expect, it } from "vitest";
import { z } from "zod";
import { readStoredConfig } from "./game-config";

const defaults = { mode: "classic" as "classic" | "fingers", fingers: 5, packIds: null as string[] | null };
const fields = { mode: z.enum(["classic", "fingers"]), fingers: z.number().int().min(3).max(10) };

describe("remembered game options", () => {
  it("restores valid stored options and pack choices", () => {
    expect(readStoredConfig({ mode: "fingers", fingers: 7, packIds: ["a"] }, defaults, fields)).toEqual({ mode: "fingers", fingers: 7, packIds: ["a"] });
    expect(readStoredConfig({ packIds: null }, defaults, fields)).toEqual({ packIds: null });
  });

  it("drops invalid or unknown fields one by one so the rest still loads", () => {
    expect(readStoredConfig({ mode: "chaos", fingers: 99, packIds: "x", extra: 1 }, defaults, fields)).toEqual({});
    expect(readStoredConfig({ mode: "chaos", fingers: 4 }, defaults, fields)).toEqual({ fingers: 4 });
  });

  it("ignores storage that is missing or not an object", () => {
    expect(readStoredConfig(undefined, defaults, fields)).toEqual({});
    expect(readStoredConfig("garbage", defaults, fields)).toEqual({});
  });
});
