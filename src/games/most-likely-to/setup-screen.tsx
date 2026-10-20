import { useNavigate } from "react-router";
import { ContentPicker } from "../../engine/content-picker";
import { PlayerEditor } from "../../engine/player-editor";
import type { Player } from "../../engine/players";
import { usePlayersStore } from "../../engine/players-store";
import { packsProblem, playersProblem, StartFooter } from "../../engine/setup-fields";
import { Screen, Section, Toggle } from "../../engine/ui";
import type { Translate } from "../../i18n/use-t";
import { useT } from "../../i18n/use-t";
import { useMltConfig, type MltConfig } from "./config-store";
import { MLT_ID, MLT_KINDS } from "./constants";

// Without the tally the cards are all that is needed, so players only matter when votes are counted.
export function mltSetupProblems(t: Translate, players: readonly Player[], config: MltConfig): string[] {
  const problems = [config.tally ? playersProblem(t, players) : null, packsProblem(t, config.packIds)];
  return problems.filter((problem) => problem !== null);
}

export function MltSetupScreen() {
  const t = useT();
  const navigate = useNavigate();
  const players = usePlayersStore((state) => state.players);
  const config = useMltConfig();

  return (
    <Screen
      title={t("mlt.name")}
      backTo="/"
      footer={<StartFooter problems={mltSetupProblems(t, players, config)} onStart={() => navigate(`/play/${MLT_ID}`)} />}
    >
      <Section title={t("mlt.setup.tally")}>
        <Toggle label={t("mlt.setup.tallyLabel")} checked={config.tally} onChange={(tally) => config.update({ tally })} />
        <p className="mt-2 text-sm text-muted">{t("mlt.setup.tallyHelp")}</p>
      </Section>
      {config.tally && (
        <Section title={t("setup.players")}>
          <PlayerEditor />
        </Section>
      )}
      <Section title={t("picker.title")} aside={t("picker.selected", { count: config.packIds?.length ?? 0 })}>
        <ContentPicker gameId={MLT_ID} kinds={MLT_KINDS} selectedIds={config.packIds} onChange={config.setPackIds} />
      </Section>
    </Screen>
  );
}
