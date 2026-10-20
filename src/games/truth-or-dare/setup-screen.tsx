import { useNavigate } from "react-router";
import { ContentPicker } from "../../engine/content-picker";
import { PlayerEditor } from "../../engine/player-editor";
import { usePlayersStore } from "../../engine/players-store";
import { basicSetupProblems, StartFooter } from "../../engine/setup-fields";
import { Screen, Section, Toggle } from "../../engine/ui";
import { useT } from "../../i18n/use-t";
import { useTodConfig } from "./config-store";
import { TOD_ID, TOD_KINDS } from "./constants";

export function TodSetupScreen() {
  const t = useT();
  const navigate = useNavigate();
  const players = usePlayersStore((state) => state.players);
  const config = useTodConfig();

  return (
    <Screen
      title={t("tod.name")}
      backTo="/"
      footer={<StartFooter problems={basicSetupProblems(t, players, config.packIds)} onStart={() => navigate(`/play/${TOD_ID}`)} />}
    >
      <Section title={t("setup.players")}>
        <PlayerEditor />
      </Section>
      <Section title={t("tod.setup.skip")}>
        <Toggle label={t("tod.setup.skipLabel")} checked={config.allowSkip} onChange={(allowSkip) => config.update({ allowSkip })} />
        <p className="mt-2 text-sm text-muted">{t("tod.setup.skipHelp")}</p>
      </Section>
      <Section title={t("picker.title")} aside={t("picker.selected", { count: config.packIds?.length ?? 0 })}>
        <ContentPicker gameId={TOD_ID} kinds={TOD_KINDS} selectedIds={config.packIds} onChange={config.setPackIds} />
      </Section>
    </Screen>
  );
}
