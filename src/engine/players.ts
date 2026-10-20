import { z } from "zod";
import { MAX_PLAYER_NAME_LENGTH, MAX_PLAYERS } from "../app/constants";

export const playerSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(MAX_PLAYER_NAME_LENGTH),
});
export type Player = z.infer<typeof playerSchema>;

export type PlayerNameProblem = "empty" | "duplicate" | "full";

export function cleanPlayerName(name: string): string {
  return name.replace(/\s+/g, " ").trim().slice(0, MAX_PLAYER_NAME_LENGTH);
}

export function checkPlayerName(players: readonly Player[], name: string, ignoreId?: string): PlayerNameProblem | null {
  const clean = cleanPlayerName(name);
  if (!clean) return "empty";
  const taken = players.some((p) => p.id !== ignoreId && p.name.toLowerCase() === clean.toLowerCase());
  if (taken) return "duplicate";
  if (!ignoreId && players.length >= MAX_PLAYERS) return "full";
  return null;
}
