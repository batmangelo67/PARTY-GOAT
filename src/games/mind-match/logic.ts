import { MAX_ANSWER_LENGTH } from "../../app/constants";

export const MIND_MODES = ["spoken", "typed"] as const;
export type MindMode = (typeof MIND_MODES)[number];

export const MATCH_POINTS = 1;

export function cleanWord(text: string): string {
  return text.replace(/\s+/g, " ").trim().slice(0, MAX_ANSWER_LENGTH);
}

// Case, accents and spacing never decide whether two words match.
export function normalizeWord(text: string): string {
  return cleanWord(text)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export interface MatchGroup {
  word: string;
  playerIds: string[];
}

// Groups of two or more players who wrote the same word.
export function findMatches(playerIds: readonly string[], answers: Readonly<Record<string, string>>): MatchGroup[] {
  const groups = new Map<string, MatchGroup>();
  for (const id of playerIds) {
    const word = cleanWord(answers[id] ?? "");
    const key = normalizeWord(word);
    if (!key) continue;
    const group = groups.get(key) ?? { word, playerIds: [] };
    group.playerIds.push(id);
    groups.set(key, group);
  }
  return [...groups.values()].filter((group) => group.playerIds.length >= 2);
}

// The distinct words of a round, in table order, become the next round's prompt.
export function nextPromptWords(playerIds: readonly string[], answers: Readonly<Record<string, string>>): string[] {
  const seen = new Set<string>();
  const words: string[] = [];
  for (const id of playerIds) {
    const word = cleanWord(answers[id] ?? "");
    const key = normalizeWord(word);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    words.push(word);
  }
  return words;
}

export function matchPoints(group: MatchGroup): Record<string, number> {
  return Object.fromEntries(group.playerIds.map((id) => [id, MATCH_POINTS]));
}
