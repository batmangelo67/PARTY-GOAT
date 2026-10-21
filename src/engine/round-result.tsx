import type { ReactNode } from "react";
import { useT } from "../i18n/use-t";
import { Scoreboard } from "./scoreboard";
import { Button, Screen, Section } from "./ui";

interface RoundResultProps {
  headline: string;
  caught: boolean;
  children: ReactNode;
  roundPoints: Record<string, number>;
  onPlayAgain: () => void;
  onBackToSetup: () => void;
}

export function RoundResult({ headline, caught, children, roundPoints, onPlayAgain, onBackToSetup }: RoundResultProps) {
  const t = useT();
  return (
    <Screen
      settled
      footer={
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={onBackToSetup}>
            {t("common.backToSetup")}
          </Button>
          <Button onClick={onPlayAgain}>{t("common.playAgain")}</Button>
        </div>
      }
    >
      <h1 className={`pop-in pt-8 text-5xl font-black leading-tight tracking-tight ${caught ? "text-accent" : "text-danger"}`}>
        {headline}
      </h1>
      <div className="mt-6 flex flex-col gap-4">{children}</div>
      <Section title={t("round.scores")}>
        <Scoreboard roundPoints={roundPoints} />
      </Section>
    </Screen>
  );
}

export function RevealBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-panel px-5 py-4">
      <p className="text-sm font-bold uppercase tracking-widest text-muted">{label}</p>
      <div className="mt-1 text-2xl font-black">{children}</div>
    </div>
  );
}
