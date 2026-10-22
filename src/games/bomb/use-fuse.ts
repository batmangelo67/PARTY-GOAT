import { useEffect, useRef, useState } from "react";
import { playCue } from "../../engine/sound";
import { useMenuOpen, useRunningTimer } from "../../engine/use-game-session";
import { hasExploded, remainingMs, tickIntervalMs, TICK_SLOWEST_MS, type Fuse } from "./logic";

// Ticks with a speeding-up beat and re-checks the clock whenever the app comes back to the foreground.
// The fuse stops burning while the pause menu is open (exit button, back gesture, app in background).
export function useFuse(fuse: Fuse | null, onExplode: () => void): number {
  const [tickMs, setTickMs] = useState(TICK_SLOWEST_MS);
  const explode = useRef(onExplode);
  explode.current = onExplode;
  const menuOpen = useMenuOpen();
  const pausedAt = useRef<number | null>(null);
  const pausedTotal = useRef(0);
  useRunningTimer(Boolean(fuse) && !menuOpen);

  useEffect(() => {
    pausedAt.current = null;
    pausedTotal.current = 0;
  }, [fuse]);

  useEffect(() => {
    if (!fuse) return;
    if (menuOpen) {
      pausedAt.current ??= performance.now();
      return;
    }
    if (pausedAt.current !== null) {
      pausedTotal.current += performance.now() - pausedAt.current;
      pausedAt.current = null;
    }
    let timer: number | undefined;
    let finished = false;

    const step = () => {
      window.clearTimeout(timer);
      if (finished) return;
      const now = performance.now() - pausedTotal.current;
      if (hasExploded(fuse, now)) {
        finished = true;
        explode.current();
        return;
      }
      playCue("tick");
      const interval = tickIntervalMs(fuse, now);
      setTickMs(interval);
      timer = window.setTimeout(step, Math.min(interval, remainingMs(fuse, now)));
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") step();
    };

    step();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      finished = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [fuse, menuOpen]);

  return tickMs;
}
