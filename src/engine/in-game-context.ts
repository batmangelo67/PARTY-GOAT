import { createContext, useContext, type ComponentType } from "react";

export interface InGameControls {
  requestExit: () => void;
}

// Present on every screen inside a running game; Screen uses it to show the exit button.
export const InGameContext = createContext<InGameControls | null>(null);

export function useInGame(): InGameControls | null {
  return useContext(InGameContext);
}

export interface GameIdentity {
  accent: string;
  Glyph: ComponentType;
}

// The game a screen belongs to (setup, picker, play): Screen shows its badge in the header.
export const GameIdentityContext = createContext<GameIdentity | null>(null);

export function useGameIdentity(): GameIdentity | null {
  return useContext(GameIdentityContext);
}
