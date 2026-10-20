import { Navigate, useParams } from "react-router";
import { findGame } from "../games/registry";
import { useWakeLock } from "../engine/use-wake-lock";

export function GameSetupRoute() {
  const game = findGame(useParams().gameId);
  if (!game) return <Navigate to="/" replace />;
  return <game.SetupScreen />;
}

export function GamePlayRoute() {
  const game = findGame(useParams().gameId);
  useWakeLock(Boolean(game));
  if (!game) return <Navigate to="/" replace />;
  return <game.PlayScreen />;
}
