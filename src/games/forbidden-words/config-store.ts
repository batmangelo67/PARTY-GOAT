import { create } from "zustand";
import { DEFAULT_TURNS_PER_TEAM, DEFAULT_TURN_SECONDS, type TurnSeconds } from "./logic";

export interface ForbiddenConfig {
  seconds: TurnSeconds;
  turnsPerTeam: number;
  packIds: string[] | null;
}

interface ForbiddenConfigState extends ForbiddenConfig {
  update: (changes: Partial<ForbiddenConfig>) => void;
  setPackIds: (packIds: string[]) => void;
}

export const useForbiddenConfig = create<ForbiddenConfigState>((set) => ({
  seconds: DEFAULT_TURN_SECONDS,
  turnsPerTeam: DEFAULT_TURNS_PER_TEAM,
  packIds: null,
  update: (changes) => set(changes),
  setPackIds: (packIds) => set({ packIds }),
}));
