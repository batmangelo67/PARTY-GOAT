import { useNavigate } from "react-router";
import type { PackOf } from "../../content/schema";
import { useSelectedPacks } from "../../content/use-selected-packs";
import { ContentPicker } from "../../engine/content-picker";
import { PlayerEditor } from "../../engine/player-editor";
import type { Player } from "../../engine/players";
import { usePlayersStore } from "../../engine/players-store";
import { DiscussionTimerField, packsProblem, playersProblem, StartFooter } from "../../engine/setup-fields";
import { Screen, Section, Toggle } from "../../engine/ui";
import type { Translate } from "../../i18n/use-t";
import { useT } from "../../i18n/use-t";
import { useCircaConfig, type CircaConfig } from "./config-store";
import { CIRCA_ID, CIRCA_KINDS } from "./constants";
import { packsWithDecoys } from "./logic";

export function circaSetupProblems(t: Translate, players: readonly Player[], config: CircaConfig, packs: readonly PackOf<"numeric">[]): string[] {
  const decoyProblem = config.impostor && packs.length > 0 && packsWithDecoys(packs).length === 0 ? t("circa.needDecoys") : null;
  return [playersProblem(t, players), packsProblem(t, config.packIds), decoyProblem].filter((problem) => problem !== null);
}

export function CircaSetupScreen() {
  const t = useT();
  const navigate = useNavigate();
  const players = usePlayersStore((state) => state.players);
  const config = useCircaConfig();
  const packs = useSelectedPacks("numeric", config.packIds);

  return (
    <Screen
      title={t("circa.name")}
      backTo="/"
      footer={<StartFooter problems={circaSetupProblems(t, players, config, packs)} onStart={() => navigate(`/play/${CIRCA_ID}`)} />}
    >
      <Section title={t("setup.players")}>
        <PlayerEditor />
      </Section>
      <Section title={t("circa.setup.impostor")}>
        <Toggle label={t("circa.setup.impostorLabel")} checked={config.impostor} onChange={(impostor) => config.update({ impostor })} />
        <p className="mt-2 text-sm text-muted">{t("circa.setup.impostorHelp")}</p>
      </Section>
      {config.impostor && (
        <Section title={t("setup.timer")}>
          <DiscussionTimerField value={config.minutes} onChange={(minutes) => config.update({ minutes })} />
        </Section>
      )}
      <Section title={t("picker.title")} aside={t("picker.selected", { count: config.packIds?.length ?? 0 })}>
        <ContentPicker gameId={CIRCA_ID} kinds={CIRCA_KINDS} selectedIds={config.packIds} onChange={config.setPackIds} />
      </Section>
    </Screen>
  );
}
