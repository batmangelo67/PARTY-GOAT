import { useEffect, useMemo, type MouseEvent, type ReactNode } from "react";
import { useBlocker } from "react-router";
import { useT } from "../i18n/use-t";
import { closeMenu, exitNeedsConfirm, markProgress, openMenu, useGameSession } from "./game-session";
import { InGameContext } from "./in-game-context";
import { Button } from "./ui";
import { useLeaveGame, type LeaveTarget } from "./use-leave-game";

const EXIT_UI_ATTRIBUTE = "data-exit-ui";

// Wraps every running game: tracks whether leaving would lose a round, turns the system back
// gesture into the pause menu, pauses timers when the app goes to the background.
export function GameShell({ children }: { children: ReactNode }) {
  const leave = useLeaveGame();
  const menuOpen = useGameSession((state) => state.menuOpen);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation, historyAction }) =>
      historyAction === "POP" && currentLocation.pathname !== nextLocation.pathname && exitNeedsConfirm(useGameSession.getState()),
  );

  useEffect(() => {
    if (blocker.state === "blocked") openMenu();
  }, [blocker.state]);

  useEffect(() => {
    const onVisibilityChange = () => {
      const { timers, menuOpen: open } = useGameSession.getState();
      if (document.visibilityState === "hidden" && timers > 0 && !open) openMenu();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  const controls = useMemo(
    () => ({
      requestExit: () => {
        if (exitNeedsConfirm(useGameSession.getState())) openMenu();
        else leave("setup");
      },
    }),
    [leave],
  );

  const resume = () => {
    if (blocker.state === "blocked") blocker.reset();
    closeMenu();
  };
  const leaveTo = (target: LeaveTarget) => {
    if (blocker.state === "blocked") blocker.reset();
    leave(target);
  };

  const trackProgress = (event: MouseEvent) => {
    const target = event.target as Element;
    if (target.closest("button") && !target.closest(`[${EXIT_UI_ATTRIBUTE}]`)) markProgress();
  };

  return (
    <InGameContext.Provider value={controls}>
      <div className="contents" onClickCapture={trackProgress}>
        {children}
      </div>
      {menuOpen && <PauseMenu onResume={resume} onLeave={leaveTo} />}
    </InGameContext.Provider>
  );
}

function PauseMenu({ onResume, onLeave }: { onResume: () => void; onLeave: (target: LeaveTarget) => void }) {
  const t = useT();
  const progress = useGameSession((state) => exitNeedsConfirm(state));
  return (
    <div {...{ [EXIT_UI_ATTRIBUTE]: "" }} className="fixed inset-0 z-40 flex items-end bg-ink">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pause-title"
        className="sheet-in pb-safe px-safe w-full rounded-t-card border-t border-line bg-panel pt-6"
      >
        <h2 id="pause-title" className="text-3xl font-black tracking-tight">
          {t("game.paused")}
        </h2>
        {progress && <p className="mt-1 text-muted">{t("game.lostWarning")}</p>}
        <div className="mt-5 flex flex-col gap-2">
          <Button autoFocus onClick={onResume}>
            {t("game.resume")}
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => onLeave("setup")}>
              {t("game.toSetup")}
            </Button>
            <Button variant="secondary" onClick={() => onLeave("home")}>
              {t("common.home")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
