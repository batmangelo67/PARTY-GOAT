import type { Player } from "../../engine/players";
import { useSelectedPacks } from "../../content/use-selected-packs";
import { usePlayersStore } from "../../engine/players-store";
import { SetupLayout, SetupPlayers } from "../../engine/setup-blocks";
import { packsProblem, playersProblem } from "../../engine/setup-fields";
import { Section, Segmented, Stepper } from "../../engine/ui";
import type { Translate } from "../../i18n/use-t";
import { useT } from "../../i18n/use-t";
import type { NhieConfig } from "./config-store";
import { useNhieConfig } from "./config-store";
import { NHIE_ID } from "./constants";
import { MAX_FINGERS, MIN_FINGERS, NHIE_MODES } from "./logic";

// Classic mode is just cards, so it only needs players when fingers are counted.
export function nhieSetupProblems(t: Translate, players: readonly Player[], config: NhieConfig, packCount: number): string[] {
  const problems = [config.mode === "fingers" ? playersProblem(t, players) : null, packsProblem(t, packCount)];
  return problems.filter((problem) => problem !== null);
}

export function NhieSetupScreen() {
  const t = useT();
  const players = usePlayersStore((state) => state.players);
  const config = useNhieConfig();
  const packs = useSelectedPacks(NHIE_ID, "prompts", config.packIds);
  const fingers = config.mode === "fingers";

  return (
    <SetupLayout
      title={t("nhie.name")}
      gameId={NHIE_ID}
      problems={nhieSetupProblems(t, players, config, packs.length)}
      packs={packs}
      isMix={config.packIds === null}
      players={fingers ? <SetupPlayers /> : undefined}
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
      {fingers && (
        <Section title={t("nhie.setup.fingers")}>
          <Stepper
            label={t("nhie.setup.fingers")}
            value={config.fingers}
            min={MIN_FINGERS}
            max={MAX_FINGERS}
            onChange={(value) => config.update({ fingers: value })}
          />
        </Section>
      )}
    </SetupLayout>
  );
}
