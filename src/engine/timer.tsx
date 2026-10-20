import { useEffect, useRef, useState } from "react";
import { TIMER_BONUS_SECONDS, TIMER_WARNING_SECONDS } from "../app/constants";
import { useT } from "../i18n/use-t";
import { playCue } from "./sound";
import { Button, Screen } from "./ui";
import { useWakeLock } from "./use-wake-lock";

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

// Countdown based on a deadline so it stays correct when the tab is throttled.
export function useCountdown(seconds: number) {
  const [deadline, setDeadline] = useState(() => Date.now() + seconds * 1000);
  const [pausedLeftMs, setPausedLeftMs] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (pausedLeftMs !== null) return;
    const id = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(id);
  }, [pausedLeftMs]);

  const leftMs = pausedLeftMs ?? Math.max(0, deadline - now);
  return {
    secondsLeft: Math.ceil(leftMs / 1000),
    paused: pausedLeftMs !== null,
    togglePause: () => {
      if (pausedLeftMs === null) setPausedLeftMs(leftMs);
      else {
        setDeadline(Date.now() + pausedLeftMs);
        setNow(Date.now());
        setPausedLeftMs(null);
      }
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

export function Timer({ seconds, onFinish }: TimerProps) {
  const t = useT();
  const { secondsLeft, paused, togglePause, addSeconds } = useCountdown(seconds);
  const finished = secondsLeft === 0;
  useWakeLock(true);
  useCountdownCues(secondsLeft);

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
        <p
          role="timer"
          aria-live={warning ? "assertive" : "off"}
          className={`text-[7rem] font-black leading-none tabular-nums tracking-tighter ${warning ? "pulse-warning" : ""} ${finished ? "text-danger" : ""}`}
        >
          {formatClock(secondsLeft)}
        </p>
        {finished && <p className="mt-4 text-3xl font-black">{t("timer.timeUp")}</p>}
      </div>
    </Screen>
  );
}
