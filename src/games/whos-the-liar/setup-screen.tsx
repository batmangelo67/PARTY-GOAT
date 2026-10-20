import { useNavigate } from "react-router";
import { ContentPicker } from "../../engine/content-picker";
import { PlayerEditor } from "../../engine/player-editor";
import { usePlayersStore } from "../../engine/players-store";
import { clampHiddenRoleCount, maxHiddenRoles } from "../../engine/roles";
import { basicSetupProblems, DiscussionTimerField, StartFooter } from "../../engine/setup-fields";
import { Screen, Section, Segmented, Stepper, Toggle } from "../../engine/ui";
import { useT } from "../../i18n/use-t";
import { useLiarConfig } from "./config-store";
import { LIAR_ID, LIAR_KINDS } from "./constants";
import { ANSWER_MODES } from "./logic";

export function LiarSetupScreen() {
  const t = useT();
  const navigate = useNavigate();
  const players = usePlayersStore((state) => state.players);
  const config = useLiarConfig();
  const liarCount = clampHiddenRoleCount(config.liarCount, players.length);
  const answerOptions = ANSWER_MODES.map((mode) => ({ value: mode, label: t(`liar.answer.${mode}`) }));

  const start = () => {
    config.update({ liarCount });
    navigate(`/play/${LIAR_ID}`);
  };

  return (
    <Screen
      title={t("liar.name")}
      backTo="/"
      footer={<StartFooter problems={basicSetupProblems(t, players, config.packIds)} onStart={start} />}
    >
      <Section title={t("setup.players")}>
        <PlayerEditor />
      </Section>
      <Section title={t("liar.setup.liarCount")}>
        <Stepper
          label={t("liar.setup.liarCount")}
          value={liarCount}
          min={1}
          max={maxHiddenRoles(players.length)}
          onChange={(value) => config.update({ liarCount: value })}
        />
      </Section>
      <Section title={t("picker.title")} aside={t("picker.selected", { count: config.packIds?.length ?? 0 })}>
        <ContentPicker gameId={LIAR_ID} kinds={LIAR_KINDS} selectedIds={config.packIds} onChange={config.setPackIds} />
      </Section>
      <Section title={t("liar.setup.answerMode")}>
        <Segmented
          ariaLabel={t("liar.setup.answerMode")}
          options={answerOptions}
          value={config.answerMode}
          onChange={(answerMode) => config.update({ answerMode })}
        />
        <p className="mt-2 text-sm text-muted">{t(`liar.answer.${config.answerMode}Help`)}</p>
      </Section>
      <Section title={t("setup.timer")}>
        <DiscussionTimerField value={config.minutes} onChange={(minutes) => config.update({ minutes })} />
      </Section>
      <div className="mt-6">
        <Toggle label={t("liar.setup.liarKnows")} checked={config.liarKnows} onChange={(liarKnows) => config.update({ liarKnows })} />
      </div>
    </Screen>
  );
}
