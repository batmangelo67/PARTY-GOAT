import { Celebration } from "../../art/celebration";
import { useState } from "react";
import { Navigate } from "react-router";
import { useSelectedPacks } from "../../content/use-selected-packs";
import { playCue } from "../../engine/sound";
import { BigCard, Button, Notice, Screen, Section } from "../../engine/ui";
import { useCardDeck } from "../../engine/use-card-deck";
import { useLeaveGame } from "../../engine/use-leave-game";
import { useT } from "../../i18n/use-t";
import { useTenConfig } from "./config-store";
import { TEN_ID } from "./constants";
import { MAX_RATING, MIN_RATING, toggleRating, worstCards, type Ratings } from "./logic";

const SETUP_PATH = `/play/${TEN_ID}/setup`;
const RATINGS = Array.from({ length: MAX_RATING - MIN_RATING + 1 }, (_, i) => MIN_RATING + i);

export function TenPlayScreen() {
  const t = useT();
  const leave = useLeaveGame();
  const config = useTenConfig();
  const packs = useSelectedPacks(TEN_ID, "prompts", config.packIds);
  const valid = packs.length > 0;

  const { cards, card, index, drawing, failure, forward, back } = useCardDeck(packs, valid);
  const [ratings, setRatings] = useState<Ratings>({});
  const [ended, setEnded] = useState(false);

  if (!valid) return <Navigate to={SETUP_PATH} replace />;

  const endGame = () => {
    playCue("win");
    setEnded(true);
  };

  const newGame = () => {
    setRatings({});
    setEnded(false);
    void forward();
  };

  if (ended) {
    const worst = worstCards(cards, ratings);
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
        <Celebration mood="party" />
        <h1 className="pt-2 text-center text-4xl font-black">{t("ten.over.title")}</h1>
        <Section title={t("ten.over.worst")}>
          {worst.length === 0 ? (
            <Notice>{t("ten.over.empty")}</Notice>
          ) : (
            <ol className="flex flex-col gap-2">
              {worst.map(({ card: rated, rating }) => (
                <li key={rated.id} className="flex items-center gap-3 rounded-xl bg-panel px-4 py-3">
                  <span className="w-10 shrink-0 text-center text-2xl font-black tabular-nums text-accent">{rating}</span>
                  <span className="font-bold">{rated.text}</span>
                </li>
              ))}
            </ol>
          )}
        </Section>
      </Screen>
    );
  }

  return (
    <Screen
      title={card ? t("ten.play.card", { number: index + 1 }) : undefined}
      footer={
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-[1fr_2fr] gap-2">
            <Button variant="secondary" disabled={index === 0} onClick={back}>
              {t("ten.play.back")}
            </Button>
            <Button disabled={drawing} onClick={() => void forward()}>
              {t("ten.play.next")}
            </Button>
          </div>
          <Button variant="ghost" onClick={() => (config.rate ? endGame() : leave("setup"))}>
            {t("ten.play.end")}
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
      {config.rate && card && (
        <Section title={t("ten.play.help")}>
          <div className="grid grid-cols-5 gap-2">
            {RATINGS.map((value) => {
              const chosen = ratings[index] === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={chosen}
                  onClick={() => {
                    playCue("tap");
                    setRatings(toggleRating(ratings, index, value));
                  }}
                  className={`min-h-14 rounded-2xl text-xl font-black tabular-nums transition active:scale-[0.97] ${
                    chosen ? "bg-accent text-accent-ink" : "bg-panel"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </Section>
      )}
    </Screen>
  );
}
