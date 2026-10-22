import { useSelectedPacks } from "../../content/use-selected-packs";
import { usePlayersStore } from "../../engine/players-store";
import { SetupLayout, SetupPlayers } from "../../engine/setup-blocks";
import { basicSetupProblems } from "../../engine/setup-fields";
import { Section, Segmented, Toggle } from "../../engine/ui";
import { useT } from "../../i18n/use-t";
import { useBombConfig } from "./config-store";
import { BOMB_ID } from "./constants";
import { CATEGORY_MODES, FUSE_LENGTHS, FUSE_RANGES_SECONDS } from "./logic";

export function BombSetupScreen() {
  const t = useT();
  const players = usePlayersStore((state) => state.players);
  const config = useBombConfig();
  const packs = useSelectedPacks(BOMB_ID, "prompts", config.packIds);
  const [min, max] = FUSE_RANGES_SECONDS[config.fuseLength];

  return (
    <SetupLayout
      title={t("bomb.name")}
      gameId={BOMB_ID}
      problems={basicSetupProblems(t, players, packs.length)}
      packs={packs}
      isMix={config.packIds === null}
      players={<SetupPlayers />}
      more={
        <>
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
        </>
      }
    >
      <Section title={t("bomb.setup.fuse")}>
        <Segmented
          ariaLabel={t("bomb.setup.fuse")}
          options={FUSE_LENGTHS.map((length) => ({ value: length, label: t(`bomb.fuse.${length}`) }))}
          value={config.fuseLength}
          onChange={(fuseLength) => config.update({ fuseLength })}
        />
        <p className="mt-2 text-sm text-muted">{t("bomb.fuse.range", { min, max })}</p>
      </Section>
    </SetupLayout>
  );
}
