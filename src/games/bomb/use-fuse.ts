import { useEffect, useRef, useState } from "react";
import { playCue } from "../../engine/sound";
import { hasExploded, remainingMs, tickIntervalMs, TICK_SLOWEST_MS, type Fuse } from "./logic";

// Ticks with a speeding-up beat and re-checks the clock whenever the app comes back to the foreground.
export function useFuse(fuse: Fuse | null, onExplode: () => void): number {
  const [tickMs, setTickMs] = useState(TICK_SLOWEST_MS);
  const explode = useRef(onExplode);
  explode.current = onExplode;

  useEffect(() => {
    if (!fuse) return;
    let timer: number | undefined;
    let finished = false;

    const step = () => {
      window.clearTimeout(timer);
      if (finished) return;
      const now = performance.now();
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
  }, [fuse]);

  return tickMs;
}
