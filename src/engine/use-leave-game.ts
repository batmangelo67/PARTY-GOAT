import { useNavigate, useParams } from "react-router";
import { endSession, useGameSession } from "./game-session";

export type LeaveTarget = "setup" | "home";

// Leaves the running game for its setup screen or home. Steps back in history when that is where
// the game was started from, so the back gesture afterwards doesn't land inside a finished game.
export function useLeaveGame(): (target: LeaveTarget) => void {
  const navigate = useNavigate();
  const { gameId } = useParams();
  return (target) => {
    const { origin } = useGameSession.getState();
    endSession();
    if (origin === target) void navigate(-1);
    else void navigate(target === "home" ? "/" : `/play/${gameId}/setup`, { replace: true });
  };
}
