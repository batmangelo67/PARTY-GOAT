import { useEffect, useRef, useState } from "react";
import type { CardItem } from "../../content/schema";
import { playCue } from "../../engine/sound";
import { formatClock, useCountdown, useCountdownCues } from "../../engine/timer";
import { BigCard, Button, Notice, Screen } from "../../engine/ui";
import { useT } from "../../i18n/use-t";
import { TIMER_WARNING_SECONDS } from "../../app/constants";

export interface TurnTally {
  correct: number;
  banned: number;
}

interface TurnPlayProps {
  seconds: number;
  firstCard: CardItem;
  drawCard: () => Promise<CardItem>;
  onFinish: (tally: TurnTally) => void;
}

// One timed turn: the describer sees the card, taps Correct or Skip, and the other team can flag a banned word.
export function TurnPlay({ seconds, firstCard, drawCard, onFinish }: TurnPlayProps) {
  const t = useT();
  const { secondsLeft } = useCountdown(seconds);
  const [card, setCard] = useState(firstCard);
  const [tally, setTally] = useState<TurnTally>({ correct: 0, banned: 0 });
  const [drawing, setDrawing] = useState(false);
  const [failure, setFailure] = useState("");
  const finished = useRef(false);
  useCountdownCues(secondsLeft);

  useEffect(() => {
    if (secondsLeft > 0 || finished.current) return;
    finished.current = true;
    onFinish(tally);
  }, [secondsLeft, tally, onFinish]);

  const next = async (change: Partial<TurnTally>) => {
    setTally((current) => ({ correct: current.correct + (change.correct ?? 0), banned: current.banned + (change.banned ?? 0) }));
    setDrawing(true);
    try {
      setCard(await drawCard());
      setFailure("");
    } catch (error) {
      setFailure(error instanceof Error ? error.message : String(error));
    } finally {
      setDrawing(false);
    }
  };

  const warning = secondsLeft <= TIMER_WARNING_SECONDS;
  return (
    <Screen
      footer={
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-[1fr_2fr] gap-2">
            <Button variant="secondary" disabled={drawing} onClick={() => void next({})}>
              {t("forbidden.play.skip")}
            </Button>
            <Button
              disabled={drawing}
              onClick={() => {
                playCue("tap");
                void next({ correct: 1 });
              }}
            >
              {t("forbidden.play.correct")}
            </Button>
          </div>
          <Button
            variant="danger"
            disabled={drawing}
            onClick={() => {
              playCue("tie");
              void next({ banned: 1 });
            }}
          >
            {t("forbidden.play.buzz")}
          </Button>
        </div>
      }
    >
      <p role="timer" className={`pt-4 text-center text-5xl font-black tabular-nums ${warning ? "pulse-warning" : ""}`}>
        {formatClock(secondsLeft)}
      </p>
      {failure && <Notice tone="error">❌ {failure}</Notice>}
      <BigCard key={card.word} className="mt-4">
        <p className="break-words text-5xl font-black leading-tight text-accent">{card.word}</p>
        <p className="mt-6 text-sm font-bold uppercase tracking-widest text-muted">{t("forbidden.play.banned")}</p>
        <ul className="mt-2 flex flex-col gap-1">
          {card.banned.map((word) => (
            <li key={word} className="text-2xl font-black text-danger">
              {word}
            </li>
          ))}
        </ul>
      </BigCard>
    </Screen>
  );
}
