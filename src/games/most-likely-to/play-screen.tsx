import { useState } from "react";
import { Navigate } from "react-router";
import { MIN_PLAYERS } from "../../app/constants";
import { useSelectedPacks } from "../../content/use-selected-packs";
import { countMarks, isMarked, toggleMark, type CardMarks } from "../../engine/card-marks";
import { usePlayersStore } from "../../engine/players-store";
import { rankByScore } from "../../engine/ranking";
import { ScoreList } from "../../engine/score-list";
import { playCue } from "../../engine/sound";
import { BigCard, Button, Notice, Screen, Section } from "../../engine/ui";
import { useCardDeck } from "../../engine/use-card-deck";
import { useLeaveGame } from "../../engine/use-leave-game";
import { useT } from "../../i18n/use-t";
import { useMltConfig } from "./config-store";
import { MLT_ID } from "./constants";

const SETUP_PATH = `/play/${MLT_ID}/setup`;

export function MltPlayScreen() {
  const t = useT();
  const leave = useLeaveGame();
  const players = usePlayersStore((state) => state.players);
  const config = useMltConfig();
  const packs = useSelectedPacks(MLT_ID, "prompts", config.packIds);
  const valid = packs.length > 0 && (!config.tally || players.length >= MIN_PLAYERS);

  const { card, index, drawing, failure, forward, back } = useCardDeck(packs, valid);
  const [picks, setPicks] = useState<CardMarks>([]);
  const [ended, setEnded] = useState(false);

  if (!valid) return <Navigate to={SETUP_PATH} replace />;

  const endGame = () => {
    playCue("win");
    setEnded(true);
  };

  const newGame = () => {
    setPicks([]);
    setEnded(false);
    void forward();
  };

  if (ended) {
    const ranking = rankByScore(players, countMarks(picks, players.map((p) => p.id)));
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
        <h1 className="pt-8 text-4xl font-black">{t("mlt.over.title")}</h1>
        <p className="mt-2 text-lg text-muted">{t("mlt.over.help")}</p>
        <Section title={t("scoreboard.title")}>
          <ScoreList
            rows={ranking.map((row) => ({
              id: row.player.id,
              name: row.player.name,
              rank: row.rank,
              value: t("mlt.over.picked", { count: row.score }),
              dimmed: row.score === 0,
            }))}
          />
        </Section>
      </Screen>
    );
  }

  return (
    <Screen
      title={card ? t("mlt.play.card", { number: index + 1 }) : undefined}
      footer={
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-[1fr_2fr] gap-2">
            <Button variant="secondary" disabled={index === 0} onClick={back}>
              {t("mlt.play.back")}
            </Button>
            <Button disabled={drawing} onClick={() => void forward()}>
              {t("mlt.play.next")}
            </Button>
          </div>
          <Button variant="ghost" onClick={() => (config.tally ? endGame() : leave("setup"))}>
            {t("mlt.play.end")}
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
      {config.tally && card && (
        <Section title={t("mlt.play.help")}>
          <div className="grid grid-cols-2 gap-2">
            {players.map((player) => {
              const picked = isMarked(picks, index, player.id);
              return (
                <button
                  key={player.id}
                  type="button"
                  aria-pressed={picked}
                  onClick={() => {
                    playCue("tap");
                    setPicks(toggleMark(picks, index, player.id));
                  }}
                  className={`flex min-h-16 items-center rounded-2xl px-4 text-left transition active:scale-[0.98] ${
                    picked ? "bg-accent/20 ring-2 ring-accent" : "bg-panel"
                  }`}
                >
                  <span className="w-full truncate text-lg font-bold">{player.name}</span>
                </button>
              );
            })}
          </div>
        </Section>
      )}
    </Screen>
  );
}
