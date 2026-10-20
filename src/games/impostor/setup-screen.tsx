import { useNavigate } from "react-router";
import { useSelectedPacks } from "../../content/use-selected-packs";
import { ContentPicker } from "../../engine/content-picker";
import { PlayerEditor } from "../../engine/player-editor";
import { usePlayersStore } from "../../engine/players-store";
import { clampHiddenRoleCount, maxHiddenRoles } from "../../engine/roles";
import { basicSetupProblems, DiscussionTimerField, StartFooter } from "../../engine/setup-fields";
import { Screen, Section, Segmented, Stepper, Toggle } from "../../engine/ui";
import { useT } from "../../i18n/use-t";
import { useImpostorConfig } from "./config-store";
import { IMPOSTOR_ID, IMPOSTOR_KINDS } from "./constants";
import { CLUE_MODES, countHints } from "./logic";

export function ImpostorSetupScreen() {
  const t = useT();
  const navigate = useNavigate();
  const players = usePlayersStore((state) => state.players);
  const config = useImpostorConfig();
  const packs = useSelectedPacks("words", config.packIds);
  const impostorCount = clampHiddenRoleCount(config.impostorCount, players.length);
  const hints = countHints(packs);
  const clueOptions = CLUE_MODES.map((mode) => ({ value: mode, label: t(`impostor.clue.${mode}`) }));

  const start = () => {
    config.update({ impostorCount });
    navigate(`/play/${IMPOSTOR_ID}`);
  };

  return (
    <Screen
      title={t("impostor.name")}
      backTo="/"
      footer={<StartFooter problems={basicSetupProblems(t, players, config.packIds)} onStart={start} />}
    >
      <Section title={t("setup.players")}>
        <PlayerEditor />
      </Section>
      <Section title={t("impostor.setup.impostorCount")}>
        <Stepper
          label={t("impostor.setup.impostorCount")}
          value={impostorCount}
          min={1}
          max={maxHiddenRoles(players.length)}
          onChange={(value) => config.update({ impostorCount: value })}
        />
      </Section>
      <Section title={t("picker.title")} aside={t("picker.selected", { count: config.packIds?.length ?? 0 })}>
        <ContentPicker gameId={IMPOSTOR_ID} kinds={IMPOSTOR_KINDS} selectedIds={config.packIds} onChange={config.setPackIds} />
      </Section>
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
      <Section title={t("setup.timer")}>
        <DiscussionTimerField value={config.minutes} onChange={(minutes) => config.update({ minutes })} />
      </Section>
      <div className="mt-6 flex flex-col gap-2">
        <Toggle
          label={t("impostor.setup.knowEachOther")}
          checked={config.knowEachOther}
          onChange={(knowEachOther) => config.update({ knowEachOther })}
        />
        <Toggle label={t("impostor.setup.canGuess")} checked={config.canGuess} onChange={(canGuess) => config.update({ canGuess })} />
      </div>
    </Screen>
  );
}
