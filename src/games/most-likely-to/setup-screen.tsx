import { useSelectedPacks } from "../../content/use-selected-packs";
import type { Player } from "../../engine/players";
import { usePlayersStore } from "../../engine/players-store";
import { SetupLayout, SetupPlayers } from "../../engine/setup-blocks";
import { packsProblem, playersProblem } from "../../engine/setup-fields";
import { Section, Toggle } from "../../engine/ui";
import type { Translate } from "../../i18n/use-t";
import { useT } from "../../i18n/use-t";
import { useMltConfig, type MltConfig } from "./config-store";
import { MLT_ID } from "./constants";

// Without the tally the cards are all that is needed, so players only matter when votes are counted.
export function mltSetupProblems(t: Translate, players: readonly Player[], config: MltConfig, packCount: number): string[] {
  const problems = [config.tally ? playersProblem(t, players) : null, packsProblem(t, packCount)];
  return problems.filter((problem) => problem !== null);
}

export function MltSetupScreen() {
  const t = useT();
  const players = usePlayersStore((state) => state.players);
  const config = useMltConfig();
  const packs = useSelectedPacks(MLT_ID, "prompts", config.packIds);

  return (
    <SetupLayout
      title={t("mlt.name")}
      gameId={MLT_ID}
      problems={mltSetupProblems(t, players, config, packs.length)}
      packs={packs}
      isMix={config.packIds === null}
      players={config.tally ? <SetupPlayers /> : undefined}
    >
      <Section title={t("mlt.setup.tally")}>
        <Toggle label={t("mlt.setup.tallyLabel")} checked={config.tally} onChange={(tally) => config.update({ tally })} />
        <p className="mt-2 text-sm text-muted">{t("mlt.setup.tallyHelp")}</p>
      </Section>
    </SetupLayout>
  );
}
