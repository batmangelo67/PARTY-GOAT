import { MAX_ANSWER_LENGTH } from "../../app/constants";
import type { QuestionPairItem } from "../../content/schema";
import { pick } from "../../engine/random";
import { assignHiddenRoles } from "../../engine/roles";

export const ANSWER_MODES = ["typed", "spoken"] as const;
export type AnswerMode = (typeof ANSWER_MODES)[number];

export interface LiarRound {
  question: string;
  liarQuestion: string;
  liarIds: Set<string>;
  starterId: string;
}

export function buildLiarRound(item: QuestionPairItem, playerIds: readonly string[], liarCount: number): LiarRound {
  return {
    question: item.question,
    liarQuestion: item.liarQuestion,
    liarIds: assignHiddenRoles(playerIds, liarCount),
    starterId: pick(playerIds),
  };
}

export function questionFor(round: LiarRound, playerId: string): string {
  return round.liarIds.has(playerId) ? round.liarQuestion : round.question;
}

export function cleanAnswer(text: string): string {
  return text.replace(/\s+/g, " ").trim().slice(0, MAX_ANSWER_LENGTH);
}
