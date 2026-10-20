import { describe, expect, it } from "vitest";
import { DEFAULT_MAX_SPICE, DEFAULT_THEME } from "../app/constants";
import { THEME_NAMES, THEMES } from "../app/themes";
import { settingsSchema } from "./backup";

describe("settings schema", () => {
  it("fills in defaults for settings saved before the new options existed", () => {
    expect(settingsSchema.parse({ language: "it" })).toEqual({
      language: "it",
      sound: true,
      animations: true,
      theme: DEFAULT_THEME,
      maxSpice: DEFAULT_MAX_SPICE,
    });
  });

  it("keeps saved values and rejects unknown themes or spice levels", () => {
    const saved = { language: "en", sound: false, animations: false, theme: "sky", maxSpice: 3 };
    expect(settingsSchema.parse(saved)).toEqual(saved);
    expect(settingsSchema.safeParse({ ...saved, theme: "neon" }).success).toBe(false);
    expect(settingsSchema.safeParse({ ...saved, maxSpice: 4 }).success).toBe(false);
  });
});

describe("themes", () => {
  it.each(THEME_NAMES)("%s has RGB channel triples for accent and accent-ink", (name) => {
    for (const channels of [THEMES[name].accent, THEMES[name].accentInk]) {
      const values = channels.split(" ").map(Number);
      expect(values).toHaveLength(3);
      expect(values.every((v) => Number.isInteger(v) && v >= 0 && v <= 255)).toBe(true);
    }
  });

  it("includes the default theme", () => {
    expect(THEME_NAMES).toContain(DEFAULT_THEME);
  });
});
