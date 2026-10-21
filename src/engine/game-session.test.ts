import { beforeEach, describe, expect, it } from "vitest";
import {
  changeTimers,
  endSession,
  exitNeedsConfirm,
  isSessionLive,
  markProgress,
  setSettled,
  startSession,
  useGameSession,
} from "./game-session";

describe("game session", () => {
  beforeEach(() => endSession());

  it("is live only for the game that was started, and only until it ends", () => {
    expect(isSessionLive("impostor")).toBe(false);
    startSession("impostor", "setup");
    expect(isSessionLive("impostor")).toBe(true);
    expect(isSessionLive("bomb")).toBe(false);
    endSession();
    expect(isSessionLive("impostor")).toBe(false);
  });

  it("asks for a confirm only while a round is under way", () => {
    startSession("impostor", "setup");
    expect(exitNeedsConfirm(useGameSession.getState())).toBe(false);
    markProgress();
    expect(exitNeedsConfirm(useGameSession.getState())).toBe(true);
    setSettled(true);
    expect(exitNeedsConfirm(useGameSession.getState())).toBe(false);
  });

  it("starts each session clean", () => {
    startSession("bomb", "home");
    markProgress();
    useGameSession.setState({ menuOpen: true });
    startSession("bomb", "setup");
    const state = useGameSession.getState();
    expect([state.progress, state.menuOpen, state.origin]).toEqual([false, false, "setup"]);
  });

  it("never counts running timers below zero", () => {
    changeTimers(-1);
    expect(useGameSession.getState().timers).toBe(0);
    changeTimers(1);
    changeTimers(1);
    changeTimers(-1);
    expect(useGameSession.getState().timers).toBe(1);
    changeTimers(-1);
  });
});
