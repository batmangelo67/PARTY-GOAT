import { shuffle } from "../../engine/random";

export const TURN_SECONDS_OPTIONS = [30, 60, 90] as const;
export type TurnSeconds = (typeof TURN_SECONDS_OPTIONS)[number];
export const DEFAULT_TURN_SECONDS: TurnSeconds = 60;

export const MIN_FORBIDDEN_PLAYERS = 4;
export const MIN_TURNS_PER_TEAM = 1;
export const MAX_TURNS_PER_TEAM = 5;
export const DEFAULT_TURNS_PER_TEAM = 2;

export const CORRECT_POINTS = 1;
export const BANNED_POINTS = -1;

export type TeamIndex = 0 | 1;
export type Teams = readonly [readonly string[], readonly string[]];
export type Scores = readonly [number, number];

export interface TurnPlan {
  team: TeamIndex;
  describerId: string;
}

// Random split into two teams; the first team gets the extra player when the count is odd.
export function splitTeams(playerIds: readonly string[]): Teams {
  const mixed = shuffle(playerIds);
  const firstSize = Math.ceil(mixed.length / 2);
  return [mixed.slice(0, firstSize), mixed.slice(firstSize)];
}

export function totalTurns(turnsPerTeam: number): number {
  return turnsPerTeam * 2;
}

// Teams alternate; inside a team the describer rotates so everyone gets a go.
export function planTurn(teams: Teams, turn: number): TurnPlan {
  const team: TeamIndex = turn % 2 === 0 ? 0 : 1;
  const members = teams[team];
  return { team, describerId: members[Math.floor(turn / 2) % members.length]! };
}

export function turnScore(correct: number, banned: number): number {
  return correct * CORRECT_POINTS + banned * BANNED_POINTS;
}

export function addTurnScore(scores: Scores, team: TeamIndex, points: number): Scores {
  return team === 0 ? [scores[0] + points, scores[1]] : [scores[0], scores[1] + points];
}

export function winningTeam(scores: Scores): TeamIndex | null {
  if (scores[0] === scores[1]) return null;
  return scores[0] > scores[1] ? 0 : 1;
}
