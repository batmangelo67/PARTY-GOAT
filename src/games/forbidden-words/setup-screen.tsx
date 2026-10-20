import { useNavigate } from "react-router";
import { ContentPicker } from "../../engine/content-picker";
import { PlayerEditor } from "../../engine/player-editor";
import type { Player } from "../../engine/players";
import { usePlayersStore } from "../../engine/players-store";
import { packsProblem, StartFooter } from "../../engine/setup-fields";
import { Screen, Section, Segmented, Stepper } from "../../engine/ui";
import type { Translate } from "../../i18n/use-t";
import { useT } from "../../i18n/use-t";
import { useForbiddenConfig, type ForbiddenConfig } from "./config-store";
import { FORBIDDEN_ID, FORBIDDEN_KINDS } from "./constants";
import { MAX_TURNS_PER_TEAM, MIN_FORBIDDEN_PLAYERS, MIN_TURNS_PER_TEAM, TURN_SECONDS_OPTIONS } from "./logic";

export function forbiddenSetupProblems(t: Translate, players: readonly Player[], config: ForbiddenConfig): string[] {
  const playersProblem = players.length < MIN_FORBIDDEN_PLAYERS ? t("forbidden.needPlayers", { min: MIN_FORBIDDEN_PLAYERS }) : null;
  return [playersProblem, packsProblem(t, config.packIds)].filter((problem) => problem !== null);
}

export function ForbiddenSetupScreen() {
  const t = useT();
  const navigate = useNavigate();
  const players = usePlayersStore((state) => state.players);
  const config = useForbiddenConfig();

  return (
    <Screen
      title={t("forbidden.name")}
      backTo="/"
      footer={<StartFooter problems={forbiddenSetupProblems(t, players, config)} onStart={() => navigate(`/play/${FORBIDDEN_ID}`)} />}
    >
      <Section title={t("setup.players")}>
        <PlayerEditor />
        <p className="mt-2 text-sm text-muted">{t("forbidden.setup.teamsHelp")}</p>
      </Section>
      <Section title={t("forbidden.setup.seconds")}>
        <Segmented
          ariaLabel={t("forbidden.setup.seconds")}
          options={TURN_SECONDS_OPTIONS.map((n) => ({ value: n, label: t("forbidden.setup.secondsOption", { n }) }))}
          value={config.seconds}
          onChange={(seconds) => config.update({ seconds })}
        />
      </Section>
      <Section title={t("forbidden.setup.turns")}>
        <Stepper
          label={t("forbidden.setup.turns")}
          value={config.turnsPerTeam}
          min={MIN_TURNS_PER_TEAM}
          max={MAX_TURNS_PER_TEAM}
          onChange={(turnsPerTeam) => config.update({ turnsPerTeam })}
        />
      </Section>
      <Section title={t("picker.title")} aside={t("picker.selected", { count: config.packIds?.length ?? 0 })}>
        <ContentPicker gameId={FORBIDDEN_ID} kinds={FORBIDDEN_KINDS} selectedIds={config.packIds} onChange={config.setPackIds} />
      </Section>
    </Screen>
  );
}
