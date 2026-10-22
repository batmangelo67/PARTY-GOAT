import { Goat } from "../art/goat";
import { useT } from "../i18n/use-t";
import { Button, Notice, Screen } from "./ui";
import type { LoadState } from "./use-round-loader";

export function RoundStatus({ state, failure, onRetry }: { state: LoadState; failure: string; onRetry: () => void }) {
  const t = useT();
  if (state === "loading") {
    return (
      <Screen>
        <div className="flex h-full flex-col items-center justify-center gap-3">
          <Goat mood="sleepy" size={96} className="float text-accent" />
          <p className="text-xl text-muted">{t("common.loading")}</p>
        </div>
      </Screen>
    );
  }
  return (
    <Screen footer={<Button onClick={onRetry}>{t("common.playAgain")}</Button>}>
      <Notice tone="error">❌ {t("error.drawFailed", { reason: failure })}</Notice>
    </Screen>
  );
}
