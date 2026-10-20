import { useCallback, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { useSelectedPacks } from "../../content/use-selected-packs";
import type { CardItem } from "../../content/schema";
import { drawItem } from "../../engine/draw-item";
import { errorMessage, logError } from "../../engine/logger";
import { usePlayersStore } from "../../engine/players-store";
import { ScoreList } from "../../engine/score-list";
import { playCue } from "../../engine/sound";
import { BigCard, Button, Notice, Screen, Section } from "../../engine/ui";
import { useT } from "../../i18n/use-t";
import { useForbiddenConfig } from "./config-store";
import { FORBIDDEN_ID } from "./constants";
import { addTurnScore, MIN_FORBIDDEN_PLAYERS, planTurn, splitTeams, totalTurns, turnScore, winningTeam, type Scores } from "./logic";
import { TurnPlay, type TurnTally } from "./turn-play";

const SETUP_PATH = `/play/${FORBIDDEN_ID}/setup`;

type Phase = "ready" | "playing" | "summary" | "over";

export function ForbiddenPlayScreen() {
  const t = useT();
  const navigate = useNavigate();
  const players = usePlayersStore((state) => state.players);
  const config = useForbiddenConfig();
  const packs = useSelectedPacks("cards", config.packIds);
  const valid = players.length >= MIN_FORBIDDEN_PLAYERS && packs.length > 0;

  const [teams, setTeams] = useState(() => splitTeams(players.map((p) => p.id)));
  const [phase, setPhase] = useState<Phase>("ready");
  const [turn, setTurn] = useState(0);
  const [scores, setScores] = useState<Scores>([0, 0]);
  const [lastTurnPoints, setLastTurnPoints] = useState(0);
  const [firstCard, setFirstCard] = useState<CardItem | null>(null);
  const [failure, setFailure] = useState("");

  const draw = useCallback(async () => (await drawItem<"cards">(packs)).item, [packs]);
  const finishTurn = useCallback(
    (tally: TurnTally) => {
      const points = turnScore(tally.correct, tally.banned);
      setLastTurnPoints(points);
      setScores((current) => addTurnScore(current, planTurn(teams, turn).team, points));
      setPhase("summary");
    },
    [teams, turn],
  );

  if (!valid) return <Navigate to={SETUP_PATH} replace />;

  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? "?";
  const teamName = (team: 0 | 1) => t(`forbidden.team.${team}`);
  const plan = planTurn(teams, turn);
  const turnsTotal = totalTurns(config.turnsPerTeam);

  const startTurn = async () => {
    try {
      setFirstCard(await draw());
      setFailure("");
      playCue("reveal");
      setPhase("playing");
    } catch (error) {
      logError("Drawing a card", error);
      setFailure(t("error.drawFailed", { reason: errorMessage(error) }));
    }
  };

  const nextTurn = () => {
    setTurn(turn + 1);
    setPhase(turn + 1 >= turnsTotal ? "over" : "ready");
    if (turn + 1 >= turnsTotal) playCue("win");
  };

  const newGame = () => {
    setTeams(splitTeams(players.map((p) => p.id)));
    setTurn(0);
    setScores([0, 0]);
    setPhase("ready");
  };

  if (phase === "playing" && firstCard) {
    return <TurnPlay key={turn} seconds={config.seconds} firstCard={firstCard} drawCard={draw} onFinish={finishTurn} />;
  }

  if (phase === "summary") {
    const last = turn + 1 >= turnsTotal;
    return (
      <Screen footer={<Button onClick={nextTurn}>{last ? t("forbidden.turn.finish") : t("forbidden.turn.next")}</Button>}>
        <div className="flex h-full flex-col justify-center gap-4">
          <BigCard>
            <p className="text-4xl font-black">{t("forbidden.turn.over")}</p>
            <p className="mt-3 text-xl text-muted">{t("forbidden.turn.score", { team: teamName(plan.team), points: lastTurnPoints })}</p>
            <p className="mt-4 text-2xl font-black tabular-nums text-accent">
              {scores[0]} – {scores[1]}
            </p>
          </BigCard>
        </div>
      </Screen>
    );
  }

  if (phase === "over") {
    const winner = winningTeam(scores);
    const rows = ([0, 1] as const)
      .map((team) => ({
        id: String(team),
        name: `${teamName(team)} · ${teams[team].map(nameOf).join(", ")}`,
        points: scores[team],
      }))
      .sort((a, b) => b.points - a.points);
    return (
      <Screen
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => navigate(SETUP_PATH)}>
              {t("common.backToSetup")}
            </Button>
            <Button onClick={newGame}>{t("common.newGame")}</Button>
          </div>
        }
      >
        <h1 className="pop-in pt-8 text-4xl font-black">{t("forbidden.over.title")}</h1>
        <p className="mt-2 text-xl font-bold text-accent">
          {winner === null ? t("forbidden.over.draw") : t("forbidden.over.winner", { team: teamName(winner) })}
        </p>
        <Section title={t("scoreboard.title")}>
          <ScoreList
            rows={rows.map((row, index) => ({
              id: row.id,
              name: row.name,
              rank: winner === null ? 1 : index + 1,
              value: t("forbidden.over.points", { points: row.points }),
            }))}
          />
        </Section>
      </Screen>
    );
  }

  return (
    <Screen backTo={SETUP_PATH} footer={<Button onClick={() => void startTurn()}>{t("forbidden.ready.start")}</Button>}>
      <div className="flex h-full flex-col justify-center gap-4">
        {failure && <Notice tone="error">❌ {failure}</Notice>}
        <BigCard key={turn}>
          <p className="text-sm font-bold uppercase tracking-widest text-muted">{teamName(plan.team)}</p>
          <p className="mt-2 break-words text-5xl font-black tracking-tight text-accent">{nameOf(plan.describerId)}</p>
          <p className="mt-4 text-lg text-muted">{t("forbidden.ready.help", { name: nameOf(plan.describerId) })}</p>
        </BigCard>
      </div>
    </Screen>
  );
}
