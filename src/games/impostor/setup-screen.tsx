import { useSelectedPacks } from "../../content/use-selected-packs";
import { usePlayersStore } from "../../engine/players-store";
import { clampHiddenRoleCount, maxHiddenRoles } from "../../engine/roles";
import { SetupLayout, SetupPlayers } from "../../engine/setup-blocks";
import { basicSetupProblems, DiscussionTimerField } from "../../engine/setup-fields";
import { Section, Segmented, Stepper, Toggle } from "../../engine/ui";
import { useT } from "../../i18n/use-t";
import { useImpostorConfig } from "./config-store";
import { IMPOSTOR_ID } from "./constants";
import { CLUE_MODES, countHints } from "./logic";

export function ImpostorSetupScreen() {
  const t = useT();
  const players = usePlayersStore((state) => state.players);
  const config = useImpostorConfig();
  const packs = useSelectedPacks(IMPOSTOR_ID, "words", config.packIds);
  const impostorCount = clampHiddenRoleCount(config.impostorCount, players.length);
  const hints = countHints(packs);
  const clueOptions = CLUE_MODES.map((mode) => ({ value: mode, label: t(`impostor.clue.${mode}`) }));

  return (
    <SetupLayout
      title={t("impostor.name")}
      gameId={IMPOSTOR_ID}
      problems={basicSetupProblems(t, players, packs.length)}
      packs={packs}
      isMix={config.packIds === null}
      onBeforeStart={() => config.update({ impostorCount })}
      players={<SetupPlayers />}
      more={
        <>
          <Section title={t("impostor.setup.clueMode")}>
            <Segmented
              ariaLabel={t("impostor.setup.clueMode")}
              options={clueOptions}
              value={config.clueMode}
              onChange={(clueMode) => config.update({ clueMode })}
            />
            <p className="mt-2 text-sm text-muted">{t(`impostor.clue.${config.clueMode}Help`)}</p>
            {hints.total > 0 && <p className="mt-1 text-sm text-muted">{t("impostor.setup.hintCoverage", hints)}</p>}
          </Section>
          <div className="mt-6 flex flex-col gap-2">
            <Toggle
              label={t("impostor.setup.knowEachOther")}
              checked={config.knowEachOther}
              onChange={(knowEachOther) => config.update({ knowEachOther })}
            />
            <Toggle label={t("impostor.setup.canGuess")} checked={config.canGuess} onChange={(canGuess) => config.update({ canGuess })} />
          </div>
        </>
      }
    >
      <Section title={t("impostor.setup.impostorCount")}>
        <Stepper
          label={t("impostor.setup.impostorCount")}
          value={impostorCount}
          min={1}
          max={maxHiddenRoles(players.length)}
          onChange={(value) => config.update({ impostorCount: value })}
        />
      </Section>
      <Section title={t("setup.timer")}>
        <DiscussionTimerField value={config.minutes} onChange={(minutes) => config.update({ minutes })} />
      </Section>
    </SetupLayout>
  );
}
