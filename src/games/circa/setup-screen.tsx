import type { PackOf } from "../../content/schema";
import { useSelectedPacks } from "../../content/use-selected-packs";
import type { Player } from "../../engine/players";
import { usePlayersStore } from "../../engine/players-store";
import { SetupLayout, SetupPlayers } from "../../engine/setup-blocks";
import { DiscussionTimerField, packsProblem, playersProblem } from "../../engine/setup-fields";
import { Section, Toggle } from "../../engine/ui";
import type { Translate } from "../../i18n/use-t";
import { useT } from "../../i18n/use-t";
import { useCircaConfig, type CircaConfig } from "./config-store";
import { CIRCA_ID } from "./constants";
import { packsWithDecoys } from "./logic";

export function circaSetupProblems(t: Translate, players: readonly Player[], config: CircaConfig, packs: readonly PackOf<"numeric">[]): string[] {
  const decoyProblem = config.impostor && packs.length > 0 && packsWithDecoys(packs).length === 0 ? t("circa.needDecoys") : null;
  return [playersProblem(t, players), packsProblem(t, packs.length), decoyProblem].filter((problem) => problem !== null);
}

export function CircaSetupScreen() {
  const t = useT();
  const players = usePlayersStore((state) => state.players);
  const config = useCircaConfig();
  const packs = useSelectedPacks(CIRCA_ID, "numeric", config.packIds);

  return (
    <SetupLayout
      title={t("circa.name")}
      gameId={CIRCA_ID}
      problems={circaSetupProblems(t, players, config, packs)}
      packs={packs}
      isMix={config.packIds === null}
      players={<SetupPlayers />}
    >
      <Section title={t("circa.setup.impostor")}>
        <Toggle label={t("circa.setup.impostorLabel")} checked={config.impostor} onChange={(impostor) => config.update({ impostor })} />
        <p className="mt-2 text-sm text-muted">{t("circa.setup.impostorHelp")}</p>
      </Section>
      {config.impostor && (
        <Section title={t("setup.timer")}>
          <DiscussionTimerField value={config.minutes} onChange={(minutes) => config.update({ minutes })} />
        </Section>
      )}
    </SetupLayout>
  );
}
