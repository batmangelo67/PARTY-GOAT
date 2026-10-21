import { Suspense, useState, type ReactNode } from "react";
import { Navigate, useParams } from "react-router";
import { findGame } from "../games/registry";
import { GameShell } from "../engine/game-shell";
import { isSessionLive } from "../engine/game-session";
import { useWakeLock } from "../engine/use-wake-lock";

// Game screens load as their own chunks (precached for offline); the gap is a few milliseconds.
function GameChunk({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div className="h-[100dvh] bg-ink" />}>{children}</Suspense>;
}

export function GameSetupRoute() {
  const game = findGame(useParams().gameId);
  if (!game) return <Navigate to="/" replace />;
  return (
    <GameChunk>
      <game.SetupScreen />
    </GameChunk>
  );
}

// Only a game started from its setup (or the home quick start) is playable. After a reload the
// round is gone, so the group lands back on setup instead of a silently re-dealt round.
export function GamePlayRoute() {
  const game = findGame(useParams().gameId);
  const [live] = useState(() => Boolean(game) && isSessionLive(game!.id));
  useWakeLock(live);
  if (!game) return <Navigate to="/" replace />;
  if (!live) return <Navigate to={`/play/${game.id}/setup`} replace />;
  return (
    <GameShell>
      <GameChunk>
        <game.PlayScreen />
      </GameChunk>
    </GameShell>
  );
}
