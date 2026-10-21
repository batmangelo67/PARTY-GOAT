import { hydrateContent } from "../content/content-store";
import { hydrateGameConfigs } from "../engine/game-config";
import { hydratePlayLog } from "../engine/play-log-store";
import { hydratePlayers } from "../engine/players-store";
import { installAudioUnlock } from "../engine/sound";
import "../games/registry";
import { hydrateSettings } from "./settings-store";

export async function bootstrap(): Promise<void> {
  await Promise.all([hydrateSettings(), hydratePlayers(), hydrateContent(), hydrateGameConfigs(), hydratePlayLog()]);
  installAudioUnlock();
}
