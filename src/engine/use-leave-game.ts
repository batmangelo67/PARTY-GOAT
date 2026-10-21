import { useNavigate, useParams } from "react-router";
import { endSession, leaveStep, useGameSession, type LeaveTarget } from "./game-session";

export type { LeaveTarget } from "./game-session";

// Leaves the running game for its setup screen or home (see leaveStep for the history rule).
export function useLeaveGame(): (target: LeaveTarget) => void {
  const navigate = useNavigate();
  const { gameId = "" } = useParams();
  return (target) => {
    const step = leaveStep(useGameSession.getState().origin, target, gameId);
    endSession();
    if (step.kind === "back") void navigate(-1);
    else void navigate(step.path, { replace: true });
  };
}
