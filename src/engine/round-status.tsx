import { useT } from "../i18n/use-t";
import { Button, Notice, Screen } from "./ui";
import type { LoadState } from "./use-round-loader";

export function RoundStatus({ state, failure, onRetry, backTo }: { state: LoadState; failure: string; onRetry: () => void; backTo: string }) {
  const t = useT();
  if (state === "loading") {
    return (
      <Screen>
        <p className="flex h-full items-center justify-center text-xl text-muted">{t("common.loading")}</p>
      </Screen>
    );
  }
  return (
    <Screen backTo={backTo} footer={<Button onClick={onRetry}>{t("common.playAgain")}</Button>}>
      <Notice tone="error">❌ {t("error.drawFailed", { reason: failure })}</Notice>
    </Screen>
  );
}
