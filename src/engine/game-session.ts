import { create } from "zustand";

export type SessionOrigin = "setup" | "home";

// The game currently being played. Lives only in memory on purpose: after a reload or an app kill
// there is no half-finished round in storage, the play route just sends the group back to setup.
interface GameSessionState {
  liveGameId: string | null;
  // Where the game was started from, so leaving can step back in history instead of piling entries.
  origin: SessionOrigin;
  // Something happened in this round that leaving would throw away.
  progress: boolean;
  // A result screen is showing: leaving loses nothing.
  settled: boolean;
  // The pause / exit menu is open; every game timer is paused while it is.
  menuOpen: boolean;
  // How many timers, fuses or turns are running right now.
  timers: number;
}

export const useGameSession = create<GameSessionState>(() => ({
  liveGameId: null,
  origin: "setup",
  progress: false,
  settled: false,
  menuOpen: false,
  timers: 0,
}));

export function startSession(gameId: string, origin: SessionOrigin): void {
  useGameSession.setState({ liveGameId: gameId, origin, progress: false, settled: false, menuOpen: false });
}

export function endSession(): void {
  useGameSession.setState({ liveGameId: null, progress: false, settled: false, menuOpen: false });
}

export function isSessionLive(gameId: string): boolean {
  return useGameSession.getState().liveGameId === gameId;
}

export function markProgress(): void {
  if (!useGameSession.getState().progress) useGameSession.setState({ progress: true });
}

export function setSettled(settled: boolean): void {
  useGameSession.setState(settled ? { settled, progress: false } : { settled });
}

export function openMenu(): void {
  useGameSession.setState({ menuOpen: true });
}

export function closeMenu(): void {
  useGameSession.setState({ menuOpen: false });
}

export function changeTimers(delta: 1 | -1): void {
  useGameSession.setState(({ timers }) => ({ timers: Math.max(0, timers + delta) }));
}

// Leaving needs a confirm only when a round is under way and not on a result screen.
export function exitNeedsConfirm(state: Pick<GameSessionState, "progress" | "settled">): boolean {
  return state.progress && !state.settled;
}

export type LeaveTarget = "setup" | "home";
export type LeaveStep = { kind: "back" } | { kind: "replace"; path: string };

// Leaving steps back in history when the target is where the game was started from, so the back
// gesture afterwards does not land inside a finished game; otherwise it replaces the game entry.
export function leaveStep(origin: SessionOrigin, target: LeaveTarget, gameId: string): LeaveStep {
  if (origin === target) return { kind: "back" };
  return { kind: "replace", path: target === "home" ? "/" : `/play/${gameId}/setup` };
}

export type QuickStartAction = "none" | "start" | "show-setup";

// The home "play again" card opens setup with a flag: start at once when setup is complete,
// otherwise drop the flag and let the group see what is missing.
export function quickStartAction(flagged: boolean, alreadyHandled: boolean, problems: readonly string[]): QuickStartAction {
  if (!flagged || alreadyHandled) return "none";
  return problems.length === 0 ? "start" : "show-setup";
}
