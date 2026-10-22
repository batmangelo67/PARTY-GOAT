import { useEffect } from "react";
import { changeTimers, useGameSession } from "./game-session";

// Timers, fuses and turns register while they run, so backgrounding the app pauses the game.
export function useRunningTimer(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    changeTimers(1);
    return () => changeTimers(-1);
  }, [active]);
}

export function useMenuOpen(): boolean {
  return useGameSession((state) => state.menuOpen);
}
