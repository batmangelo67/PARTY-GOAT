import { useCallback, useEffect, useRef, useState } from "react";
import { errorMessage, logError } from "./logger";

export type LoadState = "loading" | "ready" | "failed";

// Runs an async round builder on mount and on demand ("play again"), tracking loading and failure.
export function useRoundLoader<R>(enabled: boolean, buildRound: () => Promise<R>) {
  const [round, setRound] = useState<R | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [failure, setFailure] = useState("");
  const started = useRef(false);
  const builder = useRef(buildRound);
  builder.current = buildRound;

  const load = useCallback(async () => {
    setState("loading");
    try {
      setRound(await builder.current());
      setState("ready");
    } catch (error) {
      logError("Starting a round", error);
      setFailure(errorMessage(error));
      setState("failed");
    }
  }, []);

  useEffect(() => {
    if (!enabled || started.current) return;
    started.current = true;
    void load();
  }, [enabled, load]);

  return { round, state, failure, reload: load };
}
