import { useState } from "react";
import { useT } from "../i18n/use-t";
import type { Player } from "./players";
import { playCue } from "./sound";
import { Button, Notice, Screen } from "./ui";
import { tallyVotes, type VoteCounts } from "./vote-tally";

interface VotingProps {
  candidates: readonly Player[];
  voterCount: number;
  onResult: (accusedId: string) => void;
}

export function Voting({ candidates, voterCount, onResult }: VotingProps) {
  const t = useT();
  const [round, setRound] = useState(1);
  const [candidateIds, setCandidateIds] = useState(() => candidates.map((p) => p.id));
  const [counts, setCounts] = useState<VoteCounts>({});
  const totalVotes = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const visible = candidates.filter((p) => candidateIds.includes(p.id));

  const changeVotes = (id: string, delta: number) =>
    setCounts((current) => ({ ...current, [id]: Math.max(0, (current[id] ?? 0) + delta) }));

  const confirm = () => {
    const outcome = tallyVotes(counts);
    if (outcome.kind === "winner") {
      onResult(outcome.playerId);
    } else if (outcome.kind === "tie") {
      playCue("tie");
      setCandidateIds(outcome.playerIds);
      setCounts({});
      setRound(round + 1);
    }
  };

  return (
    <Screen
      title={round === 1 ? t("vote.title") : t("vote.revote", { round: round - 1 })}
      footer={
        <Button disabled={totalVotes === 0} onClick={confirm}>
          {totalVotes === 0 ? t("vote.needVotes") : t("vote.confirm")}
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        {round > 1 ? <Notice tone="error">{t("vote.tie")}</Notice> : <Notice>{t("vote.help")}</Notice>}
        {visible.map((player) => {
          const votes = counts[player.id] ?? 0;
          return (
            <div key={player.id} className="flex items-stretch gap-2">
              <button
                type="button"
                aria-label={t("vote.addFor", { name: player.name })}
                disabled={totalVotes >= voterCount}
                onClick={() => changeVotes(player.id, 1)}
                className={`flex min-h-16 flex-1 items-center justify-between rounded-2xl px-5 text-left text-xl font-bold transition active:scale-[0.98] ${
                  votes > 0 ? "bg-danger/20 ring-2 ring-danger" : "bg-panel"
                }`}
              >
                <span className="truncate">{player.name}</span>
                <span className="text-2xl font-black tabular-nums" aria-label={t("vote.votes", { count: votes })}>
                  {votes}
                </span>
              </button>
              <button
                type="button"
                aria-label={t("vote.removeFor", { name: player.name })}
                disabled={votes === 0}
                onClick={() => changeVotes(player.id, -1)}
                className="w-14 rounded-2xl bg-panel text-2xl font-bold text-muted active:bg-raised disabled:opacity-30"
              >
                −
              </button>
            </div>
          );
        })}
      </div>
    </Screen>
  );
}
