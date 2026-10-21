import { useEffect, useRef, useState } from "react";
import { TIMER_BONUS_SECONDS, TIMER_WARNING_SECONDS } from "../app/constants";
import { useT } from "../i18n/use-t";
import { playCue } from "./sound";
import { Button, Screen } from "./ui";
import { useMenuOpen, useRunningTimer } from "./use-game-session";

const TICK_MS = 200;
const TICK_SOUND_SECONDS = 5;

interface TimerProps {
  seconds: number;
  onFinish: () => void;
}

export function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  return `${minutes}:${String(totalSeconds % 60).padStart(2, "0")}`;
}

// Countdown based on a deadline so it stays correct when the tab is throttled. It also stops
// while the game's pause menu is open (the exit button, the back gesture, the app going to the background).
export function useCountdown(seconds: number) {
  const [deadline, setDeadline] = useState(() => Date.now() + seconds * 1000);
  const [pausedLeftMs, setPausedLeftMs] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const menuOpen = useMenuOpen();
  const pausedByMenu = useRef(false);

  const leftMs = pausedLeftMs ?? Math.max(0, deadline - now);
  const pause = () => setPausedLeftMs(leftMs);
  const resume = (left: number) => {
    setDeadline(Date.now() + left);
    setNow(Date.now());
    setPausedLeftMs(null);
  };

  useEffect(() => {
    if (pausedLeftMs !== null) return;
    const id = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(id);
  }, [pausedLeftMs]);

  useEffect(() => {
    if (menuOpen && pausedLeftMs === null) {
      pausedByMenu.current = true;
      pause();
    } else if (!menuOpen && pausedByMenu.current && pausedLeftMs !== null) {
      pausedByMenu.current = false;
      resume(pausedLeftMs);
    }
  }, [menuOpen]);

  useRunningTimer(pausedLeftMs === null && leftMs > 0);

  return {
    secondsLeft: Math.ceil(leftMs / 1000),
    paused: pausedLeftMs !== null,
    togglePause: () => {
      pausedByMenu.current = false;
      if (pausedLeftMs === null) pause();
      else resume(pausedLeftMs);
    },
    addSeconds: (extra: number) => {
      if (pausedLeftMs !== null) setPausedLeftMs(pausedLeftMs + extra * 1000);
      else setDeadline(Math.max(deadline, Date.now()) + extra * 1000);
    },
  };
}

// Ticks over the last seconds and a closing sound at zero.
export function useCountdownCues(secondsLeft: number): void {
  const lastSecond = useRef(secondsLeft);
  useEffect(() => {
    if (secondsLeft === lastSecond.current) return;
    lastSecond.current = secondsLeft;
    if (secondsLeft === 0) playCue("end");
    else if (secondsLeft <= TICK_SOUND_SECONDS) playCue("tick");
  }, [secondsLeft]);
}

const RING_RADIUS = 54;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

// The time left as a ring that drains in the game's colour and turns red at the end.
function TimerRing({ fraction, alarm }: { fraction: number; alarm: boolean }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className="absolute inset-0 h-full w-full -rotate-90">
      <circle cx="60" cy="60" r={RING_RADIUS} fill="none" strokeWidth="7" className="stroke-line" />
      <circle
        cx="60"
        cy="60"
        r={RING_RADIUS}
        fill="none"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={RING_LENGTH}
        strokeDashoffset={RING_LENGTH * (1 - Math.min(1, Math.max(0, fraction)))}
        className={`transition-[stroke-dashoffset] duration-200 ease-linear ${alarm ? "stroke-danger" : "stroke-game"}`}
      />
    </svg>
  );
}

export function Timer({ seconds, onFinish }: TimerProps) {
  const t = useT();
  const { secondsLeft, paused, togglePause, addSeconds } = useCountdown(seconds);
  const finished = secondsLeft === 0;
  useCountdownCues(secondsLeft);
  // Added time grows the ring's total instead of overfilling it.
  const total = useRef(seconds);
  total.current = Math.max(total.current, secondsLeft);

  const warning = !finished && secondsLeft <= TIMER_WARNING_SECONDS;

  return (
    <Screen
      title={t("timer.title")}
      className={finished ? "flash-end" : ""}
      footer={
        <div className="flex flex-col gap-2">
          {!finished && (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={togglePause}>
                {paused ? t("timer.resume") : t("timer.pause")}
              </Button>
              <Button variant="secondary" onClick={() => addSeconds(TIMER_BONUS_SECONDS)}>
                {t("timer.addTime")}
              </Button>
            </div>
          )}
          <Button variant={finished ? "primary" : "ghost"} onClick={onFinish}>
            {t("timer.skip")}
          </Button>
        </div>
      }
    >
      <div className="flex h-full flex-col items-center justify-center">
        <div className="relative grid h-[min(18rem,72vw)] w-[min(18rem,72vw)] place-items-center">
          <TimerRing fraction={secondsLeft / Math.max(total.current, 1)} alarm={warning || finished} />
          <p
            role="timer"
            aria-live={warning ? "assertive" : "off"}
            className={`text-[4.75rem] font-black leading-none tabular-nums tracking-tighter ${warning ? "pulse-warning" : ""} ${finished ? "text-danger" : ""}`}
          >
            {formatClock(secondsLeft)}
          </p>
        </div>
        {finished && <p className="pop-in mt-4 text-3xl font-black">{t("timer.timeUp")}</p>}
      </div>
    </Screen>
  );
}
