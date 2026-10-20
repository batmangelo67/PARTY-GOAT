import { ITEM_LIMITS, type ItemOf, type PackKind } from "./schema";

export const ITEM_SEPARATOR = "|";
export const MIN_CUSTOM_ITEMS = 5;

export type LineErrorCode = "empty" | "missingSeparator" | "extraSeparator" | "duplicate" | "tooLong" | "tooShort";

export interface LineError {
  line: number;
  code: LineErrorCode;
}

export interface ParsedLines<K extends PackKind> {
  items: ItemOf<K>[];
  errors: LineError[];
}

type LineResult<K extends PackKind> = { item: ItemOf<K>; key: string } | { error: LineErrorCode };

function lengthProblem(text: string, min: number, max: number): LineErrorCode | null {
  if (text.length > max) return "tooLong";
  if (text.length < min) return "tooShort";
  return null;
}

function splitParts(line: string): string[] {
  return line.split(ITEM_SEPARATOR).map((part) => part.replace(/\s+/g, " ").trim());
}

function parseWordLine(line: string): LineResult<"words"> {
  const parts = splitParts(line);
  if (parts.length > 2) return { error: "extraSeparator" };
  const [word = "", hint] = parts;
  if (!word || hint === "") return { error: "empty" };
  const problem = lengthProblem(word, 1, ITEM_LIMITS.word) ?? (hint ? lengthProblem(hint, 1, ITEM_LIMITS.hint) : null);
  if (problem) return { error: problem };
  return { item: hint ? { word, hint } : { word }, key: word };
}

function parseQuestionPairLine(line: string): LineResult<"question-pairs"> {
  const parts = splitParts(line);
  if (parts.length < 2) return { error: "missingSeparator" };
  if (parts.length > 2) return { error: "extraSeparator" };
  const [question = "", liarQuestion = ""] = parts;
  if (!question || !liarQuestion) return { error: "empty" };
  const problem =
    lengthProblem(question, ITEM_LIMITS.minQuestion, ITEM_LIMITS.question) ??
    lengthProblem(liarQuestion, ITEM_LIMITS.minQuestion, ITEM_LIMITS.question);
  if (problem) return { error: problem };
  return { item: { question, liarQuestion }, key: `${question}|${liarQuestion}` };
}

function parsePromptLine(line: string): LineResult<"prompts"> {
  const text = line.replace(/\s+/g, " ").trim();
  const problem = lengthProblem(text, ITEM_LIMITS.minPrompt, ITEM_LIMITS.prompt);
  if (problem) return { error: problem };
  return { item: { text }, key: text };
}

function parseLine<K extends PackKind>(kind: K, line: string): LineResult<K> {
  switch (kind) {
    case "words":
      return parseWordLine(line) as LineResult<K>;
    case "question-pairs":
      return parseQuestionPairLine(line) as LineResult<K>;
    case "prompts":
      return parsePromptLine(line) as LineResult<K>;
  }
  throw new Error(`Unknown pack kind "${kind}"`);
}

// Parses the editor textarea: one item per line, blank lines ignored, line numbers are 1-based.
export function parseItemLines<K extends PackKind>(kind: K, text: string): ParsedLines<K> {
  const result: ParsedLines<K> = { items: [], errors: [] };
  const seen = new Set<string>();
  text.split(/\r?\n/).forEach((raw, index) => {
    if (!raw.trim()) return;
    const parsed = parseLine(kind, raw);
    if ("error" in parsed) {
      result.errors.push({ line: index + 1, code: parsed.error });
      return;
    }
    const key = parsed.key.toLowerCase();
    if (seen.has(key)) {
      result.errors.push({ line: index + 1, code: "duplicate" });
      return;
    }
    seen.add(key);
    result.items.push(parsed.item);
  });
  return result;
}

function formatItem(kind: PackKind, item: ItemOf<PackKind>): string {
  switch (kind) {
    case "words": {
      const { word, hint } = item as ItemOf<"words">;
      return hint ? `${word} ${ITEM_SEPARATOR} ${hint}` : word;
    }
    case "question-pairs": {
      const { question, liarQuestion } = item as ItemOf<"question-pairs">;
      return `${question} ${ITEM_SEPARATOR} ${liarQuestion}`;
    }
    case "prompts":
      return (item as ItemOf<"prompts">).text;
  }
}

export function formatItemLines(kind: PackKind, items: readonly ItemOf<PackKind>[]): string {
  return items.map((item) => formatItem(kind, item)).join("\n");
}
