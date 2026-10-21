import { useSelectedPacks } from "../../content/use-selected-packs";
import { SetupLayout } from "../../engine/setup-blocks";
import { packsProblem } from "../../engine/setup-fields";
import { Section, Toggle } from "../../engine/ui";
import { useT } from "../../i18n/use-t";
import { useTenConfig } from "./config-store";
import { TEN_ID } from "./constants";

export function TenSetupScreen() {
  const t = useT();
  const config = useTenConfig();
  const packs = useSelectedPacks(TEN_ID, "prompts", config.packIds);
  const problems = [packsProblem(t, packs.length)].filter((problem) => problem !== null);

  return (
    <SetupLayout title={t("ten.name")} gameId={TEN_ID} problems={problems} packs={packs} isMix={config.packIds === null}>
      <Section title={t("ten.setup.rate")}>
        <Toggle label={t("ten.setup.rateLabel")} checked={config.rate} onChange={(rate) => config.update({ rate })} />
        <p className="mt-2 text-sm text-muted">{t("ten.setup.rateHelp")}</p>
      </Section>
    </SetupLayout>
  );
}
