import type { Player } from "../../engine/players";
import { useT } from "../../i18n/use-t";
import { questionFor, type CircaRound } from "./logic";

interface CircaSecretProps {
  player: Player;
  round: CircaRound;
  answer: string;
  onAnswer: (text: string) => void;
}

export function CircaSecret({ player, round, answer, onAnswer }: CircaSecretProps) {
  const t = useT();
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <p className="text-sm font-bold uppercase tracking-widest text-muted">{t("circa.secret.question")}</p>
      <p className="text-3xl font-black leading-tight">{questionFor(round, player.id)}</p>
      <label className="mt-2 flex w-full flex-col gap-2 text-left">
        <span className="text-sm font-bold text-muted">{t("circa.secret.answerLabel")}</span>
        <input
          value={answer}
          inputMode="decimal"
          maxLength={20}
          placeholder={t("circa.secret.answerPlaceholder")}
          enterKeyHint="done"
          autoComplete="off"
          onChange={(e) => onAnswer(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          className="min-h-tap w-full rounded-2xl border-2 border-line bg-ink px-4 text-lg font-bold outline-none focus:border-accent"
        />
      </label>
    </div>
  );
}
