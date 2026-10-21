import { useSelectedPacks } from "../../content/use-selected-packs";
import type { Player } from "../../engine/players";
import { usePlayersStore } from "../../engine/players-store";
import { SetupLayout, SetupPlayers } from "../../engine/setup-blocks";
import { packsProblem, playersProblem } from "../../engine/setup-fields";
import { Section, Segmented } from "../../engine/ui";
import type { Translate } from "../../i18n/use-t";
import { useT } from "../../i18n/use-t";
import { useMindConfig, type MindConfig } from "./config-store";
import { MIND_ID } from "./constants";
import { MIND_MODES } from "./logic";

// Saying words out loud needs no players in the app; typing them needs everyone's name.
export function mindSetupProblems(t: Translate, players: readonly Player[], config: MindConfig, packCount: number): string[] {
  const problems = [config.mode === "typed" ? playersProblem(t, players) : null, packsProblem(t, packCount)];
  return problems.filter((problem) => problem !== null);
}

export function MindSetupScreen() {
  const t = useT();
  const players = usePlayersStore((state) => state.players);
  const config = useMindConfig();
  const packs = useSelectedPacks(MIND_ID, "words", config.packIds);

  return (
    <SetupLayout
      title={t("mind.name")}
      gameId={MIND_ID}
      problems={mindSetupProblems(t, players, config, packs.length)}
      packs={packs}
      isMix={config.packIds === null}
      players={config.mode === "typed" ? <SetupPlayers /> : undefined}
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
    </SetupLayout>
  );
}
