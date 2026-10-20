import { hydrateContent } from "../content/content-store";
import { hydratePlayers } from "../engine/players-store";
import { installAudioUnlock } from "../engine/sound";
import { hydrateSettings } from "./settings-store";

export async function bootstrap(): Promise<void> {
  await Promise.all([hydrateSettings(), hydratePlayers(), hydrateContent()]);
  installAudioUnlock();
}
