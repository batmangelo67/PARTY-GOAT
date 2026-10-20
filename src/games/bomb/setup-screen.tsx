import { useNavigate } from "react-router";
import { ContentPicker } from "../../engine/content-picker";
import { PlayerEditor } from "../../engine/player-editor";
import { usePlayersStore } from "../../engine/players-store";
import { basicSetupProblems, StartFooter } from "../../engine/setup-fields";
import { Screen, Section, Segmented, Toggle } from "../../engine/ui";
import { useT } from "../../i18n/use-t";
import { useBombConfig } from "./config-store";
import { BOMB_ID, BOMB_KINDS } from "./constants";
import { CATEGORY_MODES, FUSE_LENGTHS, FUSE_RANGES_SECONDS } from "./logic";

export function BombSetupScreen() {
  const t = useT();
  const navigate = useNavigate();
  const players = usePlayersStore((state) => state.players);
  const config = useBombConfig();
  const [min, max] = FUSE_RANGES_SECONDS[config.fuseLength];

  return (
    <Screen
      title={t("bomb.name")}
      backTo="/"
      footer={<StartFooter problems={basicSetupProblems(t, players, config.packIds)} onStart={() => navigate(`/play/${BOMB_ID}`)} />}
    >
      <Section title={t("setup.players")}>
        <PlayerEditor />
      </Section>
      <Section title={t("picker.title")} aside={t("picker.selected", { count: config.packIds?.length ?? 0 })}>
        <ContentPicker gameId={BOMB_ID} kinds={BOMB_KINDS} selectedIds={config.packIds} onChange={config.setPackIds} />
      </Section>
      <Section title={t("bomb.setup.fuse")}>
        <Segmented
          ariaLabel={t("bomb.setup.fuse")}
          options={FUSE_LENGTHS.map((length) => ({ value: length, label: t(`bomb.fuse.${length}`) }))}
          value={config.fuseLength}
          onChange={(fuseLength) => config.update({ fuseLength })}
        />
        <p className="mt-2 text-sm text-muted">{t("bomb.fuse.range", { min, max })}</p>
      </Section>
      <Section title={t("bomb.setup.categoryMode")}>
        <Segmented
          ariaLabel={t("bomb.setup.categoryMode")}
          options={CATEGORY_MODES.map((mode) => ({ value: mode, label: t(`bomb.category.${mode}`) }))}
          value={config.categoryMode}
          onChange={(categoryMode) => config.update({ categoryMode })}
        />
        <p className="mt-2 text-sm text-muted">{t(`bomb.category.${config.categoryMode}Help`)}</p>
      </Section>
      <div className="mt-6">
        <Toggle label={t("bomb.setup.showExample")} checked={config.showExample} onChange={(showExample) => config.update({ showExample })} />
      </div>
    </Screen>
  );
}
