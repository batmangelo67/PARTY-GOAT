import { useState } from "react";
import { Navigate } from "react-router";
import { MIN_PLAYERS } from "../../app/constants";
import { useSelectedPacks } from "../../content/use-selected-packs";
import { isMarked, toggleMark, type CardMarks } from "../../engine/card-marks";
import { usePlayersStore } from "../../engine/players-store";
import { rankByScore } from "../../engine/ranking";
import { ScoreList } from "../../engine/score-list";
import { playCue } from "../../engine/sound";
import { BigCard, Button, Notice, Screen, Section } from "../../engine/ui";
import { useCardDeck } from "../../engine/use-card-deck";
import { useLeaveGame } from "../../engine/use-leave-game";
import { useT } from "../../i18n/use-t";
import { useNhieConfig } from "./config-store";
import { NHIE_ID } from "./constants";
import { canTap, fingersLeft, isGameOver } from "./logic";

const SETUP_PATH = `/play/${NHIE_ID}/setup`;

export function NhiePlayScreen() {
  const t = useT();
  const leave = useLeaveGame();
  const players = usePlayersStore((state) => state.players);
  const config = useNhieConfig();
  const packs = useSelectedPacks(NHIE_ID, "prompts", config.packIds);
  const fingersMode = config.mode === "fingers";
  const valid = packs.length > 0 && (!fingersMode || players.length >= MIN_PLAYERS);

  const { card, index, drawing, failure, forward, back } = useCardDeck(packs, valid);
  const [taps, setTaps] = useState<CardMarks>([]);
  const [ended, setEnded] = useState(false);

  if (!valid) return <Navigate to={SETUP_PATH} replace />;

  const playerIds = players.map((p) => p.id);
  const fingers = fingersLeft(config.fingers, playerIds, taps);

  const tap = (playerId: string) => {
    playCue("tap");
    const next = toggleMark(taps, index, playerId);
    setTaps(next);
    if (isGameOver(fingersLeft(config.fingers, playerIds, next))) {
      playCue("win");
      setEnded(true);
    }
  };

  const newGame = () => {
    setTaps([]);
    setEnded(false);
    void forward();
  };

  if (ended) {
    const ranking = rankByScore(players, fingers);
    const leaders = ranking.filter((row) => row.rank === 1);
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
        <h1 className="pt-8 text-4xl font-black">{t("nhie.over.title")}</h1>
        <p className="mt-2 text-xl font-bold text-accent">
          {leaders.length === 1 ? t("nhie.over.winner", { name: leaders[0]!.player.name }) : t("nhie.over.draw")}
        </p>
        <Section title={t("scoreboard.title")}>
          <ScoreList
            rows={ranking.map((row) => ({
              id: row.player.id,
              name: row.player.name,
              rank: row.rank,
              value: t("nhie.over.fingers", { count: row.score }),
              dimmed: row.score === 0,
            }))}
          />
        </Section>
      </Screen>
    );
  }

  return (
    <Screen
      title={card ? t("nhie.play.card", { number: index + 1 }) : undefined}
      footer={
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-[1fr_2fr] gap-2">
            <Button variant="secondary" disabled={index === 0} onClick={back}>
              {t("nhie.play.back")}
            </Button>
            <Button disabled={drawing} onClick={() => void forward()}>
              {t("nhie.play.next")}
            </Button>
          </div>
          <Button variant="ghost" onClick={() => (fingersMode ? setEnded(true) : leave("setup"))}>
            {t("nhie.play.end")}
          </Button>
        </div>
      }
    >
      {failure && <Notice tone="error">❌ {failure}</Notice>}
      {card ? (
        <BigCard key={card.id} className="mt-2">
          <p className="text-3xl font-black leading-tight">{card.text}</p>
        </BigCard>
      ) : (
        !failure && <p className="py-20 text-center text-muted">{t("common.loading")}</p>
      )}
      {fingersMode && card && (
        <Section title={t("nhie.play.help")}>
          <div className="grid grid-cols-2 gap-2">
            {players.map((player) => {
              const tapped = isMarked(taps, index, player.id);
              const out = (fingers[player.id] ?? 0) === 0 && !tapped;
              return (
                <button
                  key={player.id}
                  type="button"
                  aria-pressed={tapped}
                  disabled={!canTap(fingers, taps, index, player.id)}
                  onClick={() => tap(player.id)}
                  className={`flex min-h-16 flex-col items-start justify-center rounded-2xl px-4 text-left transition active:scale-[0.98] disabled:opacity-40 ${
                    tapped ? "bg-danger/20 ring-2 ring-danger" : "bg-panel"
                  }`}
                >
                  <span className="w-full truncate text-lg font-bold">{player.name}</span>
                  <span className="text-sm text-muted">
                    {out ? t("nhie.play.out") : t("nhie.play.fingers", { count: fingers[player.id] ?? 0 })}
                  </span>
                </button>
              );
            })}
          </div>
        </Section>
      )}
    </Screen>
  );
}
