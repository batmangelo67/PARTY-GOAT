import { useState } from "react";
import type { Pack } from "../../content/schema";
import { Button } from "../../engine/ui";
import { useT } from "../../i18n/use-t";

const PAGE_SIZE = 50;

function ItemLine({ pack, index }: { pack: Pack; index: number }) {
  const t = useT();
  switch (pack.kind) {
    case "words": {
      const item = pack.items[index]!;
      return (
        <>
          <span className="font-bold">{item.word}</span>
          {item.hint && <span className="text-muted"> · {item.hint}</span>}
        </>
      );
    }
    case "question-pairs": {
      const item = pack.items[index]!;
      return (
        <>
          <span className="block font-bold">{item.question}</span>
          <span className="block text-muted">
            {t("pack.liar")}: {item.liarQuestion}
          </span>
        </>
      );
    }
    case "prompts":
      return <span className="font-bold">{pack.items[index]!.text}</span>;
  }
}

export function PackItemsPreview({ pack }: { pack: Pack }) {
  const t = useT();
  const [shown, setShown] = useState(PAGE_SIZE);
  const remaining = pack.items.length - shown;
  return (
    <>
      <ol className="flex flex-col gap-1">
        {pack.items.slice(0, shown).map((item, index) => (
          <li key={item.id} className="rounded-xl bg-panel px-4 py-2">
            <ItemLine pack={pack} index={index} />
          </li>
        ))}
      </ol>
      {remaining > 0 && (
        <Button variant="ghost" className="mt-2" onClick={() => setShown(shown + PAGE_SIZE)}>
          {t("pack.showMore", { count: Math.min(remaining, PAGE_SIZE) })}
        </Button>
      )}
    </>
  );
}
