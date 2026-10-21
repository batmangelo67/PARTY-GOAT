import { useState } from "react";
import { Navigate } from "react-router";
import { MIN_PLAYERS } from "../../app/constants";
import { useSelectedPacks } from "../../content/use-selected-packs";
import { drawItem } from "../../engine/draw-item";
import { errorMessage, logError } from "../../engine/logger";
import { usePlayersStore } from "../../engine/players-store";
import { rankByScore } from "../../engine/ranking";
import { ScoreList } from "../../engine/score-list";
import { playCue } from "../../engine/sound";
import { BigCard, Button, Notice, Screen, Section } from "../../engine/ui";
import { useLeaveGame } from "../../engine/use-leave-game";
import { useT } from "../../i18n/use-t";
import { useTodConfig } from "./config-store";
import { TOD_ID } from "./constants";
import { braveryScores, nextPlayerIndex, packsForChoice, recordOutcome, TOD_CHOICES, type TodChoice, type TodOutcome, type TodStats } from "./logic";

const SETUP_PATH = `/play/${TOD_ID}/setup`;

interface DrawnCard {
  id: string;
  text: string;
  choice: TodChoice;
}

export function TodPlayScreen() {
  const t = useT();
  const leave = useLeaveGame();
  const players = usePlayersStore((state) => state.players);
  const config = useTodConfig();
  const packs = useSelectedPacks(TOD_ID, "prompts", config.packIds);
  const valid = packs.length > 0 && players.length >= MIN_PLAYERS;

  const [turn, setTurn] = useState(0);
  const [card, setCard] = useState<DrawnCard | null>(null);
  const [stats, setStats] = useState<TodStats>({});
  const [drawing, setDrawing] = useState(false);
  const [failure, setFailure] = useState("");
  const [ended, setEnded] = useState(false);

  if (!valid) return <Navigate to={SETUP_PATH} replace />;

  const player = players[turn % players.length]!;

  const choose = async (choice: TodChoice) => {
    setDrawing(true);
    try {
      const { item } = await drawItem<"prompts">(packsForChoice(packs, choice));
      playCue("reveal");
      setCard({ id: item.id, text: item.text, choice });
      setFailure("");
    } catch (error) {
      logError("Drawing a card", error);
      setFailure(t("error.drawFailed", { reason: errorMessage(error) }));
    } finally {
      setDrawing(false);
    }
  };

  const finishTurn = (outcome: TodOutcome) => {
    playCue("tap");
    setStats(recordOutcome(stats, player.id, outcome));
    setCard(null);
    setTurn(nextPlayerIndex(turn, players.length));
  };

  const endGame = () => {
    playCue("win");
    setEnded(true);
  };

  const newGame = () => {
    setStats({});
    setCard(null);
    setTurn(0);
    setEnded(false);
  };

  if (ended) {
    const ranking = rankByScore(players, braveryScores(stats, players.map((p) => p.id)));
    return (
      <Screen settled
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => leave("setup")}>
              {t("common.backToSetup")}
            </Button>
            <Button onClick={newGame}>{t("common.newGame")}</Button>
          </div>
        }
      >
        <h1 className="pt-8 text-4xl font-black">{t("tod.over.title")}</h1>
        <p className="mt-2 text-lg text-muted">{t("tod.over.help")}</p>
        <Section title={t("scoreboard.title")}>
          <ScoreList
            rows={ranking.map((row) => ({
              id: row.player.id,
              name: row.player.name,
              rank: row.rank,
              value: t("tod.over.record", { done: stats[row.player.id]?.done ?? 0, skipped: stats[row.player.id]?.skipped ?? 0 }),
            }))}
          />
        </Section>
      </Screen>
    );
  }

  if (!card) {
    return (
      <Screen
        footer={
          <Button variant="ghost" onClick={endGame}>
            {t("tod.play.end")}
          </Button>
        }
      >
        <div className="flex h-full flex-col justify-center gap-6">
          {failure && <Notice tone="error">❌ {failure}</Notice>}
          <BigCard>
            <p className="text-sm font-bold uppercase tracking-widest text-muted">{t("tod.play.turn")}</p>
            <p className="mt-2 break-words text-5xl font-black tracking-tight text-accent">{player.name}</p>
          </BigCard>
          <div className="grid grid-cols-2 gap-3">
            {TOD_CHOICES.map((choice) => (
              <Button
                key={choice}
                variant={choice === "truth" ? "primary" : "secondary"}
                disabled={drawing || packsForChoice(packs, choice).length === 0}
                onClick={() => void choose(choice)}
              >
                {t(`tod.choice.${choice}`)}
              </Button>
            ))}
          </div>
        </div>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <div className={`grid gap-2 ${config.allowSkip ? "grid-cols-[1fr_2fr]" : "grid-cols-1"}`}>
          {config.allowSkip && (
            <Button variant="secondary" onClick={() => finishTurn("skipped")}>
              {t("tod.play.skip")}
            </Button>
          )}
          <Button onClick={() => finishTurn("done")}>{t("tod.play.done")}</Button>
        </div>
      }
    >
      <BigCard key={card.id} className="mt-2">
        <p className="text-sm font-bold uppercase tracking-widest text-accent">
          {player.name} · {t(`tod.choice.${card.choice}`)}
        </p>
        <p className="mt-4 text-3xl font-black leading-tight">{card.text}</p>
      </BigCard>
    </Screen>
  );
}
