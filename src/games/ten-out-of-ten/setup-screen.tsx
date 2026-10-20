import { useNavigate } from "react-router";
import { ContentPicker } from "../../engine/content-picker";
import { packsProblem, StartFooter } from "../../engine/setup-fields";
import { Screen, Section, Toggle } from "../../engine/ui";
import { useT } from "../../i18n/use-t";
import { useTenConfig } from "./config-store";
import { TEN_ID, TEN_KINDS } from "./constants";

export function TenSetupScreen() {
  const t = useT();
  const navigate = useNavigate();
  const config = useTenConfig();
  const problems = [packsProblem(t, config.packIds)].filter((problem) => problem !== null);

  return (
    <Screen title={t("ten.name")} backTo="/" footer={<StartFooter problems={problems} onStart={() => navigate(`/play/${TEN_ID}`)} />}>
      <Section title={t("ten.setup.rate")}>
        <Toggle label={t("ten.setup.rateLabel")} checked={config.rate} onChange={(rate) => config.update({ rate })} />
        <p className="mt-2 text-sm text-muted">{t("ten.setup.rateHelp")}</p>
      </Section>
      <Section title={t("picker.title")} aside={t("picker.selected", { count: config.packIds?.length ?? 0 })}>
        <ContentPicker gameId={TEN_ID} kinds={TEN_KINDS} selectedIds={config.packIds} onChange={config.setPackIds} />
      </Section>
    </Screen>
  );
}
