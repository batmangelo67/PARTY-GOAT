import { useNavigate } from "react-router";
import { ContentPicker } from "../../engine/content-picker";
import { PlayerEditor } from "../../engine/player-editor";
import type { Player } from "../../engine/players";
import { usePlayersStore } from "../../engine/players-store";
import { packsProblem, playersProblem, StartFooter } from "../../engine/setup-fields";
import { Screen, Section, Segmented, Stepper } from "../../engine/ui";
import type { Translate } from "../../i18n/use-t";
import { useT } from "../../i18n/use-t";
import { useNhieConfig, type NhieConfig } from "./config-store";
import { NHIE_ID, NHIE_KINDS } from "./constants";
import { MAX_FINGERS, MIN_FINGERS, NHIE_MODES } from "./logic";

// Classic mode is just cards, so it only needs players when fingers are counted.
export function nhieSetupProblems(t: Translate, players: readonly Player[], config: NhieConfig): string[] {
  const problems = [config.mode === "fingers" ? playersProblem(t, players) : null, packsProblem(t, config.packIds)];
  return problems.filter((problem) => problem !== null);
}

export function NhieSetupScreen() {
  const t = useT();
  const navigate = useNavigate();
  const players = usePlayersStore((state) => state.players);
  const config = useNhieConfig();

  return (
    <Screen
      title={t("nhie.name")}
      backTo="/"
      footer={<StartFooter problems={nhieSetupProblems(t, players, config)} onStart={() => navigate(`/play/${NHIE_ID}`)} />}
    >
      <Section title={t("nhie.setup.mode")}>
        <Segmented
          ariaLabel={t("nhie.setup.mode")}
          options={NHIE_MODES.map((mode) => ({ value: mode, label: t(`nhie.mode.${mode}`) }))}
          value={config.mode}
          onChange={(mode) => config.update({ mode })}
        />
        <p className="mt-2 text-sm text-muted">{t(`nhie.mode.${config.mode}Help`)}</p>
      </Section>
      {config.mode === "fingers" && (
        <>
          <Section title={t("nhie.setup.fingers")}>
            <Stepper
              label={t("nhie.setup.fingers")}
              value={config.fingers}
              min={MIN_FINGERS}
              max={MAX_FINGERS}
              onChange={(fingers) => config.update({ fingers })}
            />
          </Section>
          <Section title={t("setup.players")}>
            <PlayerEditor />
          </Section>
        </>
      )}
      <Section title={t("picker.title")} aside={t("picker.selected", { count: config.packIds?.length ?? 0 })}>
        <ContentPicker gameId={NHIE_ID} kinds={NHIE_KINDS} selectedIds={config.packIds} onChange={config.setPackIds} />
      </Section>
    </Screen>
  );
}
