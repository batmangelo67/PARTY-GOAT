import { useT } from "../../i18n/use-t";

export function PromptWords({ words }: { words: readonly string[] }) {
  const t = useT();
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <p className="text-sm font-bold uppercase tracking-widest text-muted">{t("mind.play.prompt")}</p>
      <ul className="flex flex-wrap justify-center gap-2">
        {words.map((word) => (
          <li key={word} className="rounded-2xl bg-raised px-4 py-2 text-3xl font-black text-accent">
            {word}
          </li>
        ))}
      </ul>
    </div>
  );
}
