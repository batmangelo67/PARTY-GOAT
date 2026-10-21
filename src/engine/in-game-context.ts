import { createContext, useContext } from "react";

export interface InGameControls {
  requestExit: () => void;
}

// Present on every screen inside a running game; Screen uses it to show the exit button.
export const InGameContext = createContext<InGameControls | null>(null);

export function useInGame(): InGameControls | null {
  return useContext(InGameContext);
}
