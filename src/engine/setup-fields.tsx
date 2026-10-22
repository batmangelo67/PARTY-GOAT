import { useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { DISCUSSION_MINUTES_OPTIONS, MIN_PLAYERS, QUICK_START_PARAM } from "../app/constants";
import { DIFFICULTY_FILTERS, type DifficultyFilter } from "../content/difficulty";
import type { Translate } from "../i18n/use-t";
import { useT } from "../i18n/use-t";
import type { DiscussionMinutes } from "./discussion-minutes";
import { quickStartAction, startSession, type SessionOrigin } from "./game-session";
import { usePlayLogStore } from "./play-log-store";
import type { Player } from "./players";
import { unlockAudio } from "./sound";
import { Button, Segmented } from "./ui";

export function DiscussionTimerField({ value, onChange }: { value: DiscussionMinutes; onChange: (v: DiscussionMinutes) => void }) {
  const t = useT();
  const options = DISCUSSION_MINUTES_OPTIONS.map((n) => ({ value: n, label: n === 0 ? t("common.off") : t("common.minutes", { n }) }));
  return <Segmented ariaLabel={t("setup.timer")} options={options} value={value} onChange={onChange} />;
}

export function DifficultyField({ value, onChange }: { value: DifficultyFilter; onChange: (v: DifficultyFilter) => void }) {
  const t = useT();
  const options = DIFFICULTY_FILTERS.map((level) => ({ value: level, label: t(`difficulty.${level}`) }));
  return <Segmented ariaLabel={t("setup.difficulty")} options={options} value={value} onChange={onChange} />;
}

// Only speaks up when packs are chosen but none of their items is at the chosen level.
export function difficultyProblem(t: Translate, packCount: number, matchingItems: number): string | null {
  return packCount > 0 && matchingItems === 0 ? t("setup.noItemsAtDifficulty") : null;
}

export function playersProblem(t: Translate, players: readonly Player[]): string | null {
  return players.length < MIN_PLAYERS ? t("players.needMore", { min: MIN_PLAYERS }) : null;
}

export function packsProblem(t: Translate, packCount: number): string | null {
  return packCount > 0 ? null : t("setup.needPacks");
}

export function basicSetupProblems(t: Translate, players: readonly Player[], packCount: number): string[] {
  return [playersProblem(t, players), packsProblem(t, packCount)].filter((problem) => problem !== null);
}

interface StartFooterProps {
  problems: string[];
  packIds: readonly string[];
  onBeforeStart?: () => void;
}

// Starts the game. With ?go=1 (the home "play again" card) it starts straight away when nothing
// is missing, so a repeat game is one tap from home.
export function StartFooter({ problems, packIds, onBeforeStart }: StartFooterProps) {
  const t = useT();
  const navigate = useNavigate();
  const gameId = useParams().gameId ?? "";
  const [params, setParams] = useSearchParams();
  const logPlay = usePlayLogStore((state) => state.logPlay);
  const quickStarted = useRef(false);

  const start = (origin: SessionOrigin) => {
    unlockAudio();
    onBeforeStart?.();
    logPlay(gameId, packIds);
    startSession(gameId, origin);
    void navigate(`/play/${gameId}`, { replace: origin === "home" });
  };

  useEffect(() => {
    const action = quickStartAction(params.get(QUICK_START_PARAM) === "1", quickStarted.current, problems);
    if (action === "none") return;
    quickStarted.current = true;
    if (action === "start") start("home");
    else setParams({}, { replace: true });
  });

  return (
    <div className="flex flex-col gap-2">
      {problems[0] && <p className="text-center text-sm font-semibold text-danger">{problems[0]}</p>}
      <Button disabled={problems.length > 0} onClick={() => start("setup")}>
        {t("setup.start")}
      </Button>
    </div>
  );
}
