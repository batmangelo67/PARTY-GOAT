import { beforeEach, describe, expect, it } from "vitest";
import {
  changeTimers,
  endSession,
  exitNeedsConfirm,
  isSessionLive,
  leaveStep,
  markProgress,
  quickStartAction,
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

describe("leaving a game", () => {
  it("steps back when leaving to where the game was started", () => {
    expect(leaveStep("setup", "setup", "bomb")).toEqual({ kind: "back" });
    expect(leaveStep("home", "home", "bomb")).toEqual({ kind: "back" });
  });

  it("replaces the game entry when leaving somewhere else", () => {
    expect(leaveStep("setup", "home", "bomb")).toEqual({ kind: "replace", path: "/" });
    expect(leaveStep("home", "setup", "bomb")).toEqual({ kind: "replace", path: "/play/bomb/setup" });
  });
});

describe("quick start from the home card", () => {
  it("starts at once when setup is complete", () => {
    expect(quickStartAction(true, false, [])).toBe("start");
  });

  it("shows setup when something is missing", () => {
    expect(quickStartAction(true, false, ["You need at least 3 players."])).toBe("show-setup");
  });

  it("does nothing without the flag or after it was handled", () => {
    expect(quickStartAction(false, false, [])).toBe("none");
    expect(quickStartAction(true, true, [])).toBe("none");
  });
});
