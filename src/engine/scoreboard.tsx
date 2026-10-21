import { useT } from "../i18n/use-t";
import { usePlayersStore } from "./players-store";
import { ScoreList } from "./score-list";
import { useScoreboardStore } from "./scoreboard-store";
import { Notice } from "./ui";

export function Scoreboard({ roundPoints }: { roundPoints?: Record<string, number> }) {
  const t = useT();
  const players = usePlayersStore((state) => state.players);
  const scores = useScoreboardStore((state) => state.scores);
  const rows = players
    .map((player) => ({ ...player, total: scores[player.id] ?? 0, gained: roundPoints?.[player.id] ?? 0 }))
    .sort((a, b) => b.total - a.total);

  if (!roundPoints && rows.every((row) => row.total === 0)) return <Notice>{t("scoreboard.empty")}</Notice>;

  return (
    <ScoreList
      rows={rows.map((row) => ({
        id: row.id,
        name: row.name,
        rank: rows.findIndex((other) => other.total === row.total) + 1,
        gained: row.gained > 0 ? `+${row.gained}` : undefined,
        value: t("scoreboard.points", { points: row.total }),
      }))}
    />
  );
}
