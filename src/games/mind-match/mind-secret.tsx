import { MAX_ANSWER_LENGTH } from "../../app/constants";
import { useT } from "../../i18n/use-t";
import { PromptWords } from "./prompt-words";

interface MindSecretProps {
  words: readonly string[];
  answer: string;
  onAnswer: (text: string) => void;
}

export function MindSecret({ words, answer, onAnswer }: MindSecretProps) {
  const t = useT();
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <PromptWords words={words} />
      <label className="mt-2 flex w-full flex-col gap-2 text-left">
        <span className="text-sm font-bold text-muted">{t("mind.secret.label")}</span>
        <input
          value={answer}
          maxLength={MAX_ANSWER_LENGTH}
          placeholder={t("mind.secret.placeholder")}
          enterKeyHint="done"
          autoComplete="off"
          autoCapitalize="none"
          onChange={(e) => onAnswer(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          className="min-h-tap w-full rounded-2xl border-2 border-line bg-ink px-4 text-lg font-bold outline-none focus:border-accent"
        />
      </label>
    </div>
  );
}
