import { MAX_ANSWER_LENGTH } from "../../app/constants";
import type { Player } from "../../engine/players";
import { useT } from "../../i18n/use-t";
import { questionFor, type LiarRound } from "./logic";

interface LiarSecretProps {
  player: Player;
  round: LiarRound;
  liarKnows: boolean;
  answer?: string;
  onAnswer?: (text: string) => void;
}

export function LiarSecret({ player, round, liarKnows, answer, onAnswer }: LiarSecretProps) {
  const t = useT();
  const showLiarRole = liarKnows && round.liarIds.has(player.id);
  return (
    <div className="flex w-full flex-col items-center gap-4">
      {showLiarRole && <p className="text-lg font-bold text-danger">{t("liar.secret.youAreLiar")}</p>}
      <p className="text-sm font-bold uppercase tracking-widest text-muted">{t("liar.secret.question")}</p>
      <p className="text-3xl font-black leading-tight">{questionFor(round, player.id)}</p>
      {onAnswer && (
        <label className="mt-2 flex w-full flex-col gap-2 text-left">
          <span className="text-sm font-bold text-muted">{t("liar.secret.answerLabel")}</span>
          <input
            value={answer ?? ""}
            maxLength={MAX_ANSWER_LENGTH}
            placeholder={t("liar.secret.answerPlaceholder")}
            enterKeyHint="done"
            autoComplete="off"
            onChange={(e) => onAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            className="min-h-tap w-full rounded-2xl border-2 border-line bg-ink px-4 text-lg font-bold outline-none focus:border-accent"
          />
        </label>
      )}
    </div>
  );
}
