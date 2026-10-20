import type { ReactNode } from "react";
import { useT } from "../i18n/use-t";
import { BigCard, Button, Screen } from "./ui";

interface StarterScreenProps {
  starterName: string;
  help: ReactNode;
  actionLabel: string;
  onNext: () => void;
}

export function StarterScreen({ starterName, help, actionLabel, onNext }: StarterScreenProps) {
  const t = useT();
  return (
    <Screen footer={<Button onClick={onNext}>{actionLabel}</Button>}>
      <div className="flex h-full flex-col justify-center gap-4">
        <BigCard>
          <p className="text-5xl font-black tracking-tight text-accent">{t("round.starts", { name: starterName })}</p>
          <div className="mt-4 text-lg text-muted">{help}</div>
        </BigCard>
      </div>
    </Screen>
  );
}
