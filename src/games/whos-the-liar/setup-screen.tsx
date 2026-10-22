import { useSelectedPacks } from "../../content/use-selected-packs";
import { usePlayersStore } from "../../engine/players-store";
import { clampHiddenRoleCount, maxHiddenRoles } from "../../engine/roles";
import { SetupLayout, SetupPlayers } from "../../engine/setup-blocks";
import { basicSetupProblems, DiscussionTimerField } from "../../engine/setup-fields";
import { Section, Segmented, Stepper, Toggle } from "../../engine/ui";
import { useT } from "../../i18n/use-t";
import { useLiarConfig } from "./config-store";
import { LIAR_ID } from "./constants";
import { ANSWER_MODES } from "./logic";

export function LiarSetupScreen() {
  const t = useT();
  const players = usePlayersStore((state) => state.players);
  const config = useLiarConfig();
  const packs = useSelectedPacks(LIAR_ID, "question-pairs", config.packIds);
  const liarCount = clampHiddenRoleCount(config.liarCount, players.length);
  const answerOptions = ANSWER_MODES.map((mode) => ({ value: mode, label: t(`liar.answer.${mode}`) }));

  return (
    <SetupLayout
      title={t("liar.name")}
      gameId={LIAR_ID}
      problems={basicSetupProblems(t, players, packs.length)}
      packs={packs}
      isMix={config.packIds === null}
      onBeforeStart={() => config.update({ liarCount })}
      players={<SetupPlayers />}
      more={
        <>
          <Section title={t("liar.setup.liarCount")}>
            <Stepper
              label={t("liar.setup.liarCount")}
              value={liarCount}
              min={1}
              max={maxHiddenRoles(players.length)}
              onChange={(value) => config.update({ liarCount: value })}
            />
          </Section>
          <Section title={t("setup.timer")}>
            <DiscussionTimerField value={config.minutes} onChange={(minutes) => config.update({ minutes })} />
          </Section>
          <div className="mt-6">
            <Toggle label={t("liar.setup.liarKnows")} checked={config.liarKnows} onChange={(liarKnows) => config.update({ liarKnows })} />
          </div>
        </>
      }
    >
      <Section title={t("liar.setup.answerMode")}>
        <Segmented
          ariaLabel={t("liar.setup.answerMode")}
          options={answerOptions}
          value={config.answerMode}
          onChange={(answerMode) => config.update({ answerMode })}
        />
        <p className="mt-2 text-sm text-muted">{t(`liar.answer.${config.answerMode}Help`)}</p>
      </Section>
    </SetupLayout>
  );
}
