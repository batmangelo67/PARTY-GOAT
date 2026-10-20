import { ITEM_LIMITS, type ItemOf, type PackKind } from "./schema";

export const ITEM_SEPARATOR = "|";
const BANNED_SEPARATOR = ",";
export const MIN_CUSTOM_ITEMS = 5;

export type LineErrorCode =
  | "empty"
  | "missingSeparator"
  | "extraSeparator"
  | "duplicate"
  | "tooLong"
  | "tooShort"
  | "badNumber"
  | "wrongCount";

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

function parseCardLine(line: string): LineResult<"cards"> {
  const parts = splitParts(line);
  if (parts.length < 2) return { error: "missingSeparator" };
  if (parts.length > 2) return { error: "extraSeparator" };
  const [word = "", bannedText = ""] = parts;
  const banned = bannedText.split(BANNED_SEPARATOR).map((entry) => entry.trim());
  if (!word || banned.some((entry) => entry === "")) return { error: "empty" };
  if (banned.length < ITEM_LIMITS.minBanned || banned.length > ITEM_LIMITS.maxBanned) return { error: "wrongCount" };
  const problem = lengthProblem(word, 1, ITEM_LIMITS.word) ?? banned.map((entry) => lengthProblem(entry, 1, ITEM_LIMITS.bannedWord)).find(Boolean);
  if (problem) return { error: problem };
  return { item: { word, banned }, key: word };
}

// Accepts "1234.5" and "1234,5"; anything else (units, thousands separators) is rejected.
export function parseNumber(text: string): number | null {
  const normalized = text.trim().replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return null;
  return Number(normalized);
}

function parseNumericLine(line: string): LineResult<"numeric"> {
  const parts = splitParts(line);
  if (parts.length < 3) return { error: "missingSeparator" };
  if (parts.length !== 3 && parts.length !== 5) return { error: "wrongCount" };
  const [question = "", answerText = "", unit = "", decoyQuestion, decoyAnswerText] = parts;
  if (!question || !unit || (parts.length === 5 && !decoyQuestion)) return { error: "empty" };
  const answer = parseNumber(answerText);
  const decoyAnswer = decoyAnswerText === undefined ? undefined : parseNumber(decoyAnswerText);
  if (answer === null || decoyAnswer === null) return { error: "badNumber" };
  const problem =
    lengthProblem(question, ITEM_LIMITS.minQuestion, ITEM_LIMITS.question) ??
    lengthProblem(unit, 1, ITEM_LIMITS.unit) ??
    (decoyQuestion ? lengthProblem(decoyQuestion, ITEM_LIMITS.minQuestion, ITEM_LIMITS.question) : null);
  if (problem) return { error: problem };
  const item = decoyQuestion === undefined ? { question, answer, unit } : { question, answer, unit, decoyQuestion, decoyAnswer };
  return { item: item as ItemOf<"numeric">, key: question };
}

function parseLine<K extends PackKind>(kind: K, line: string): LineResult<K> {
  switch (kind) {
    case "words":
      return parseWordLine(line) as LineResult<K>;
    case "question-pairs":
      return parseQuestionPairLine(line) as LineResult<K>;
    case "prompts":
      return parsePromptLine(line) as LineResult<K>;
    case "cards":
      return parseCardLine(line) as LineResult<K>;
    case "numeric":
      return parseNumericLine(line) as LineResult<K>;
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
    case "cards": {
      const { word, banned } = item as ItemOf<"cards">;
      return `${word} ${ITEM_SEPARATOR} ${banned.join(`${BANNED_SEPARATOR} `)}`;
    }
    case "numeric": {
      const { question, answer, unit, decoyQuestion, decoyAnswer } = item as ItemOf<"numeric">;
      const base = [question, String(answer), unit];
      return (decoyQuestion === undefined ? base : [...base, decoyQuestion, String(decoyAnswer)]).join(` ${ITEM_SEPARATOR} `);
    }
  }
}

export function formatItemLines(kind: PackKind, items: readonly ItemOf<PackKind>[]): string {
  return items.map((item) => formatItem(kind, item)).join("\n");
}
