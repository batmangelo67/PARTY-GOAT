import { describe, expect, it } from "vitest";
import { formatItemLines, parseItemLines } from "./pack-text";
import { ITEM_LIMITS } from "./schema";

describe("editor line parser: words", () => {
  it("parses words with and without hints and skips blank lines", () => {
    const { items, errors } = parseItemLines("words", "Pizza | Italian\n\n  Sushi  \nTaco|Mexican");
    expect(errors).toEqual([]);
    expect(items).toEqual([{ word: "Pizza", hint: "Italian" }, { word: "Sushi" }, { word: "Taco", hint: "Mexican" }]);
  });

  it("flags empty parts, extra separators, duplicates and long words with line numbers", () => {
    const text = ["| hint", "Pizza |", "A | B | C", "Pizza", "pizza", "x".repeat(ITEM_LIMITS.word + 1)].join("\n");
    const { items, errors } = parseItemLines("words", text);
    expect(items).toEqual([{ word: "Pizza" }]);
    expect(errors).toEqual([
      { line: 1, code: "empty" },
      { line: 2, code: "empty" },
      { line: 3, code: "extraSeparator" },
      { line: 5, code: "duplicate" },
      { line: 6, code: "tooLong" },
    ]);
  });
});

describe("editor line parser: question pairs", () => {
  it("parses question | liarQuestion", () => {
    const { items, errors } = parseItemLines("question-pairs", "Best age to marry? | Best age to have kids?");
    expect(errors).toEqual([]);
    expect(items).toEqual([{ question: "Best age to marry?", liarQuestion: "Best age to have kids?" }]);
  });

  it("flags a missing separator, empty side, short questions and duplicates", () => {
    const text = ["Only one question here?", "Question one? |", "Hi | Fine question?", "Same one? | Other one?", "same one? | other one?"].join("\n");
    expect(parseItemLines("question-pairs", text).errors).toEqual([
      { line: 1, code: "missingSeparator" },
      { line: 2, code: "empty" },
      { line: 3, code: "tooShort" },
      { line: 5, code: "duplicate" },
    ]);
  });
});

describe("editor line parser: prompts", () => {
  it("keeps the separator as part of the text", () => {
    expect(parseItemLines("prompts", "Never have I ever said yes | no").items).toEqual([{ text: "Never have I ever said yes | no" }]);
  });

  it("flags short, long and duplicate prompts", () => {
    const text = ["ok", "x".repeat(ITEM_LIMITS.prompt + 1), "Danced on a table", "danced on a  table"].join("\n");
    expect(parseItemLines("prompts", text).errors).toEqual([
      { line: 1, code: "tooShort" },
      { line: 2, code: "tooLong" },
      { line: 4, code: "duplicate" },
    ]);
  });
});

describe("formatItemLines", () => {
  it("round-trips through the parser for every kind", () => {
    const words = [{ word: "Pizza", hint: "Italian" }, { word: "Sushi" }];
    const pairs = [{ question: "Question one?", liarQuestion: "Question two?" }];
    const prompts = [{ text: "Never have I ever lied" }];
    expect(parseItemLines("words", formatItemLines("words", words)).items).toEqual(words);
    expect(parseItemLines("question-pairs", formatItemLines("question-pairs", pairs)).items).toEqual(pairs);
    expect(parseItemLines("prompts", formatItemLines("prompts", prompts)).items).toEqual(prompts);
  });
});

describe("editor line parser: cards", () => {
  it("parses word | banned list and trims each banned word", () => {
    const { items, errors } = parseItemLines("cards", "Pizza | cheese, Italy ,slice, tomato");
    expect(errors).toEqual([]);
    expect(items).toEqual([{ word: "Pizza", banned: ["cheese", "Italy", "slice", "tomato"] }]);
  });

  it("flags a missing list, empty entries, the wrong number of banned words and extra separators", () => {
    const text = ["Pizza", "Pizza | a, , c, d", "Sushi | a, b", "Taco | a, b, c, d, e, f, g", "Soup | a, b, c | d"].join("\n");
    expect(parseItemLines("cards", text).errors).toEqual([
      { line: 1, code: "missingSeparator" },
      { line: 2, code: "empty" },
      { line: 3, code: "wrongCount" },
      { line: 4, code: "wrongCount" },
      { line: 5, code: "extraSeparator" },
    ]);
  });
});

describe("editor line parser: numeric", () => {
  it("parses a question with answer and unit, with or without a decoy", () => {
    const text = ["How many bones? | 206 | bones", "How tall is it? | 3,5 | metres | How wide is it? | 2 "].join("\n");
    const { items, errors } = parseItemLines("numeric", text);
    expect(errors).toEqual([]);
    expect(items).toEqual([
      { question: "How many bones?", answer: 206, unit: "bones" },
      { question: "How tall is it?", answer: 3.5, unit: "metres", decoyQuestion: "How wide is it?", decoyAnswer: 2 },
    ]);
  });

  it("flags bad numbers, wrong part counts, missing parts and duplicates", () => {
    const text = ["How many? | lots | things", "How many? | 5", "How many? | 5 | a | b", "How many? | 5 | a | | 3", "Same one? | 1 | a", "same one? | 2 | a"].join("\n");
    expect(parseItemLines("numeric", text).errors).toEqual([
      { line: 1, code: "badNumber" },
      { line: 2, code: "missingSeparator" },
      { line: 3, code: "wrongCount" },
      { line: 4, code: "empty" },
      { line: 6, code: "duplicate" },
    ]);
  });

  it("round trips through the editor text", () => {
    const text = "How many bones? | 206 | bones | How many teeth? | 32";
    const { items } = parseItemLines("numeric", text);
    expect(formatItemLines("numeric", items)).toBe(text);
  });
});
