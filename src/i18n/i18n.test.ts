import { describe, expect, it as test } from "vitest";
import { en } from "./en";
import { it } from "./it";
import { detectLanguage } from "./languages";
import { translate } from "./use-t";

describe("i18n", () => {
  test("detects Italian only from it-* browser languages", () => {
    expect(detectLanguage("it-IT")).toBe("it");
    expect(detectLanguage("IT")).toBe("it");
    expect(detectLanguage("en-GB")).toBe("en");
    expect(detectLanguage(undefined)).toBe("en");
  });

  test("fills placeholders and keeps unknown ones", () => {
    expect(translate("en", "round.starts", { name: "Sara" })).toBe("Sara starts");
    expect(translate("it", "round.starts", { name: "Sara" })).toBe("Inizia Sara");
    expect(translate("en", "round.starts")).toBe("{name} starts");
  });

  test("Italian uses the same placeholders as English", () => {
    const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    for (const key of Object.keys(en) as (keyof typeof en)[]) {
      expect(placeholders(it[key]), key).toEqual(placeholders(en[key]));
    }
  });
});
