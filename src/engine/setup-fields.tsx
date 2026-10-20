import { DISCUSSION_MINUTES_OPTIONS, MIN_PLAYERS } from "../app/constants";
import type { Translate } from "../i18n/use-t";
import { useT } from "../i18n/use-t";
import type { Player } from "./players";
import { unlockAudio } from "./sound";
import { Button, Segmented } from "./ui";

export type DiscussionMinutes = (typeof DISCUSSION_MINUTES_OPTIONS)[number];

export function DiscussionTimerField({ value, onChange }: { value: DiscussionMinutes; onChange: (v: DiscussionMinutes) => void }) {
  const t = useT();
  const options = DISCUSSION_MINUTES_OPTIONS.map((n) => ({ value: n, label: n === 0 ? t("common.off") : t("common.minutes", { n }) }));
  return <Segmented ariaLabel={t("setup.timer")} options={options} value={value} onChange={onChange} />;
}

export function playersProblem(t: Translate, players: readonly Player[]): string | null {
  return players.length < MIN_PLAYERS ? t("players.needMore", { min: MIN_PLAYERS }) : null;
}

export function packsProblem(t: Translate, packIds: readonly string[] | null): string | null {
  return packIds?.length ? null : t("setup.needPacks");
}

export function basicSetupProblems(t: Translate, players: readonly Player[], packIds: readonly string[] | null): string[] {
  return [playersProblem(t, players), packsProblem(t, packIds)].filter((problem) => problem !== null);
}

export function StartFooter({ problems, onStart }: { problems: string[]; onStart: () => void }) {
  const t = useT();
  const start = () => {
    unlockAudio();
    onStart();
  };
  return (
    <div className="flex flex-col gap-2">
      {problems[0] && <p className="text-center text-sm font-semibold text-danger">{problems[0]}</p>}
      <Button disabled={problems.length > 0} onClick={start}>
        {t("setup.start")}
      </Button>
    </div>
  );
}
