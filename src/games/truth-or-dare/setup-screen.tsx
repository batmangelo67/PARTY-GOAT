import { useSelectedPacks } from "../../content/use-selected-packs";
import { usePlayersStore } from "../../engine/players-store";
import { SetupLayout, SetupPlayers } from "../../engine/setup-blocks";
import { basicSetupProblems } from "../../engine/setup-fields";
import { Toggle } from "../../engine/ui";
import { useT } from "../../i18n/use-t";
import { useTodConfig } from "./config-store";
import { TOD_ID } from "./constants";

export function TodSetupScreen() {
  const t = useT();
  const players = usePlayersStore((state) => state.players);
  const config = useTodConfig();
  const packs = useSelectedPacks(TOD_ID, "prompts", config.packIds);

  return (
    <SetupLayout
      title={t("tod.name")}
      gameId={TOD_ID}
      problems={basicSetupProblems(t, players, packs.length)}
      packs={packs}
      isMix={config.packIds === null}
      players={<SetupPlayers />}
      more={
        <div className="mt-4">
          <Toggle label={t("tod.setup.skipLabel")} checked={config.allowSkip} onChange={(allowSkip) => config.update({ allowSkip })} />
          <p className="mt-2 text-sm text-muted">{t("tod.setup.skipHelp")}</p>
        </div>
      }
    />
  );
}
