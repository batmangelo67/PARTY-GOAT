import { useNavigate } from "react-router";
import { ContentPicker } from "../../engine/content-picker";
import { PlayerEditor } from "../../engine/player-editor";
import type { Player } from "../../engine/players";
import { usePlayersStore } from "../../engine/players-store";
import { packsProblem, playersProblem, StartFooter } from "../../engine/setup-fields";
import { Screen, Section, Segmented } from "../../engine/ui";
import type { Translate } from "../../i18n/use-t";
import { useT } from "../../i18n/use-t";
import { useMindConfig, type MindConfig } from "./config-store";
import { MIND_ID, MIND_KINDS } from "./constants";
import { MIND_MODES } from "./logic";

// Saying words out loud needs no players in the app; typing them needs everyone's name.
export function mindSetupProblems(t: Translate, players: readonly Player[], config: MindConfig): string[] {
  const problems = [config.mode === "typed" ? playersProblem(t, players) : null, packsProblem(t, config.packIds)];
  return problems.filter((problem) => problem !== null);
}

export function MindSetupScreen() {
  const t = useT();
  const navigate = useNavigate();
  const players = usePlayersStore((state) => state.players);
  const config = useMindConfig();

  return (
    <Screen
      title={t("mind.name")}
      backTo="/"
      footer={<StartFooter problems={mindSetupProblems(t, players, config)} onStart={() => navigate(`/play/${MIND_ID}`)} />}
    >
      <Section title={t("mind.setup.mode")}>
        <Segmented
          ariaLabel={t("mind.setup.mode")}
          options={MIND_MODES.map((mode) => ({ value: mode, label: t(`mind.mode.${mode}`) }))}
          value={config.mode}
          onChange={(mode) => config.update({ mode })}
        />
        <p className="mt-2 text-sm text-muted">{t(`mind.mode.${config.mode}Help`)}</p>
      </Section>
      {config.mode === "typed" && (
        <Section title={t("setup.players")}>
          <PlayerEditor />
        </Section>
      )}
      <Section title={t("picker.title")} aside={t("picker.selected", { count: config.packIds?.length ?? 0 })}>
        <ContentPicker gameId={MIND_ID} kinds={MIND_KINDS} selectedIds={config.packIds} onChange={config.setPackIds} />
      </Section>
    </Screen>
  );
}
