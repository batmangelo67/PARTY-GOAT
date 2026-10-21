import { useState } from "react";
import { Navigate } from "react-router";
import { MIN_PLAYERS } from "../../app/constants";
import { useSettingsStore } from "../../app/settings-store";
import { parseNumber } from "../../content/pack-text";
import { useSelectedPacks } from "../../content/use-selected-packs";
import { drawItem } from "../../engine/draw-item";
import { PassPhone } from "../../engine/pass-phone";
import { usePlayersStore } from "../../engine/players-store";
import { isCaught } from "../../engine/roles";
import { RevealBlock, RoundResult } from "../../engine/round-result";
import { RoundStatus } from "../../engine/round-status";
import { ScoreList } from "../../engine/score-list";
import { useScoreboardStore } from "../../engine/scoreboard-store";
import { playCue } from "../../engine/sound";
import { Timer } from "../../engine/timer";
import { Button, Screen, Section } from "../../engine/ui";
import { useRoundLoader } from "../../engine/use-round-loader";
import { Voting } from "../../engine/voting";
import { useLeaveGame } from "../../engine/use-leave-game";
import { useT } from "../../i18n/use-t";
import { CircaSecret } from "./circa-secret";
import { useCircaConfig } from "./config-store";
import { CIRCA_ID } from "./constants";
import { buildCircaRound, closestPlayerIds, closestPoints, formatNumber, packsWithDecoys, rankGuesses, scoreImpostorRound } from "./logic";

type Phase = "pass" | "reveal" | "discussion" | "vote" | "result";

const SETUP_PATH = `/play/${CIRCA_ID}/setup`;

export function CircaPlayScreen() {
  const t = useT();
  const leave = useLeaveGame();
  const language = useSettingsStore((state) => state.language);
  const players = usePlayersStore((state) => state.players);
  const addPoints = useScoreboardStore((state) => state.addPoints);
  const config = useCircaConfig();
  const packs = useSelectedPacks(CIRCA_ID, "numeric", config.packIds);
  const pool = config.impostor ? packsWithDecoys(packs) : packs;
  const valid = players.length >= MIN_PLAYERS && pool.length > 0;

  const [phase, setPhase] = useState<Phase>("pass");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [accusedId, setAccusedId] = useState("");
  const [roundPoints, setRoundPoints] = useState<Record<string, number>>({});

  const { round, state, failure, reload } = useRoundLoader(valid, async () => {
    const { item } = await drawItem(pool);
    return buildCircaRound(item, players.map((p) => p.id), config.impostor);
  });

  if (!valid) return <Navigate to={SETUP_PATH} replace />;
  if (state !== "ready" || !round) return <RoundStatus state={state} failure={failure} onRetry={reload} />;

  const playerIds = players.map((p) => p.id);
  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? "?";
  const guesses = Object.fromEntries(playerIds.map((id) => [id, parseNumber(answers[id] ?? "")]).filter(([, value]) => value !== null)) as Record<string, number>;
  const rankedIds = round.impostorId ? playerIds.filter((id) => id !== round.impostorId) : playerIds;
  const ranks = rankGuesses(rankedIds, guesses, round.item.answer);
  const show = (value: number) => formatNumber(value, language);

  const finishClassic = () => {
    const points = closestPoints(ranks);
    addPoints(points);
    setRoundPoints(points);
    setPhase("result");
    playCue("win");
  };

  const onVote = (accused: string) => {
    const points = scoreImpostorRound(round, playerIds, accused, ranks);
    addPoints(points);
    setRoundPoints(points);
    setAccusedId(accused);
    setPhase("result");
    playCue(accused === round.impostorId ? "win" : "end");
  };

  const playAgain = () => {
    setPhase("pass");
    setAnswers({});
    setAccusedId("");
    void reload();
  };

  const rankingRows = ranks.map((entry) => ({
    id: entry.playerId,
    name: nameOf(entry.playerId),
    rank: entry.rank,
    value: (
      <span>
        {show(entry.value)} · {entry.diff === 0 ? t("circa.reveal.exact") : t("circa.reveal.off", { diff: show(entry.diff) })}
      </span>
    ),
  }));

  switch (phase) {
    case "pass":
      return (
        <PassPhone
          players={players}
          renderSecret={(player) => (
            <CircaSecret
              player={player}
              round={round}
              answer={answers[player.id] ?? ""}
              onAnswer={(text) => setAnswers((current) => ({ ...current, [player.id]: text }))}
            />
          )}
          canHide={(player) => parseNumber(answers[player.id] ?? "") !== null}
          onDone={() => (config.impostor ? setPhase("reveal") : finishClassic())}
        />
      );
    case "reveal":
      return (
        <Screen
          title={t("circa.reveal.title")}
          footer={<Button onClick={() => setPhase(config.minutes > 0 ? "discussion" : "vote")}>{config.minutes > 0 ? t("round.toDiscussion") : t("round.toVote")}</Button>}
        >
          <ul className="mt-2 flex flex-col gap-2">
            {players.map((player) => (
              <li key={player.id} className="pop-in rounded-2xl bg-panel px-4 py-3">
                <p className="text-sm font-bold text-muted">{player.name}</p>
                <p className="text-2xl font-black tabular-nums">{show(guesses[player.id] ?? 0)}</p>
              </li>
            ))}
          </ul>
        </Screen>
      );
    case "discussion":
      return <Timer seconds={config.minutes * 60} onFinish={() => setPhase("vote")} />;
    case "vote":
      return <Voting candidates={players} voterCount={players.length} onResult={onVote} />;
    case "result": {
      const winners = closestPlayerIds(ranks).map(nameOf);
      const truth = `${show(round.item.answer)} ${round.item.unit}`;
      if (!config.impostor) {
        return (
          <RoundResult
            headline={winners.length === 1 ? t("circa.result.winner", { name: winners[0]! }) : t("circa.result.tie", { names: winners.join(", ") })}
            caught
            roundPoints={roundPoints}
            onPlayAgain={playAgain}
            onBackToSetup={() => leave("setup")}
          >
            <RevealBlock label={t("circa.result.question")}>{round.item.question}</RevealBlock>
            <RevealBlock label={t("circa.reveal.truth")}>
              <span className="text-accent">{truth}</span>
            </RevealBlock>
            <Section title={t("circa.result.ranking")}>
              <ScoreList rows={rankingRows} />
            </Section>
          </RoundResult>
        );
      }
      const caught = isCaught({ hiddenIds: new Set([round.impostorId!]), accusedId });
      return (
        <RoundResult
          headline={caught ? t("circa.result.caught") : t("circa.result.escaped")}
          caught={caught}
          roundPoints={roundPoints}
          onPlayAgain={playAgain}
          onBackToSetup={() => leave("setup")}
        >
          <p className="text-lg text-muted">{t("round.accused", { name: nameOf(accusedId) })}</p>
          <RevealBlock label={t("circa.result.impostor")}>
            <span className="text-danger">{nameOf(round.impostorId!)}</span>
          </RevealBlock>
          <RevealBlock label={t("circa.result.question")}>{round.item.question}</RevealBlock>
          <RevealBlock label={t("circa.reveal.truth")}>
            <span className="text-accent">{truth}</span>
          </RevealBlock>
          <RevealBlock label={t("circa.result.decoyQuestion")}>
            <span className="text-danger">{round.item.decoyQuestion}</span>
          </RevealBlock>
          <RevealBlock label={t("circa.result.decoyAnswer")}>
            <span className="text-danger">{show(round.item.decoyAnswer!)}</span>
          </RevealBlock>
          <Section title={t("circa.result.ranking")}>
            <ScoreList rows={rankingRows} />
          </Section>
        </RoundResult>
      );
    }
  }
}
