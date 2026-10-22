import { useSelectedPacks } from "../../content/use-selected-packs";
import type { Player } from "../../engine/players";
import { usePlayersStore } from "../../engine/players-store";
import { SetupLayout, SetupPlayers } from "../../engine/setup-blocks";
import { packsProblem } from "../../engine/setup-fields";
import { Section, Segmented, Stepper } from "../../engine/ui";
import type { Translate } from "../../i18n/use-t";
import { useT } from "../../i18n/use-t";
import { useForbiddenConfig } from "./config-store";
import { FORBIDDEN_ID } from "./constants";
import { MAX_TURNS_PER_TEAM, MIN_FORBIDDEN_PLAYERS, MIN_TURNS_PER_TEAM, TURN_SECONDS_OPTIONS } from "./logic";

export function forbiddenSetupProblems(t: Translate, players: readonly Player[], packCount: number): string[] {
  const playersProblem = players.length < MIN_FORBIDDEN_PLAYERS ? t("forbidden.needPlayers", { min: MIN_FORBIDDEN_PLAYERS }) : null;
  return [playersProblem, packsProblem(t, packCount)].filter((problem) => problem !== null);
}

export function ForbiddenSetupScreen() {
  const t = useT();
  const players = usePlayersStore((state) => state.players);
  const config = useForbiddenConfig();
  const packs = useSelectedPacks(FORBIDDEN_ID, "cards", config.packIds);

  return (
    <SetupLayout
      title={t("forbidden.name")}
      gameId={FORBIDDEN_ID}
      problems={forbiddenSetupProblems(t, players, packs.length)}
      packs={packs}
      isMix={config.packIds === null}
      players={<SetupPlayers min={MIN_FORBIDDEN_PLAYERS} hint={t("forbidden.setup.teamsHelp")} />}
      more={
        <Section title={t("forbidden.setup.turns")}>
          <Stepper
            label={t("forbidden.setup.turns")}
            value={config.turnsPerTeam}
            min={MIN_TURNS_PER_TEAM}
            max={MAX_TURNS_PER_TEAM}
            onChange={(turnsPerTeam) => config.update({ turnsPerTeam })}
          />
        </Section>
      }
    >
      <Section title={t("forbidden.setup.seconds")}>
        <Segmented
          ariaLabel={t("forbidden.setup.seconds")}
          options={TURN_SECONDS_OPTIONS.map((n) => ({ value: n, label: t("forbidden.setup.secondsOption", { n }) }))}
          value={config.seconds}
          onChange={(seconds) => config.update({ seconds })}
        />
      </Section>
    </SetupLayout>
  );
}
