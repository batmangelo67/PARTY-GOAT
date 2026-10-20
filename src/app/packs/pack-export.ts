import { packsToJson } from "../../content/pack-import";
import type { Pack } from "../../content/schema";
import { datedFileName, saveJsonFile } from "../../storage/json-file";

export async function exportPacks(packs: readonly Pack[], fileStem: string, asArray: boolean): Promise<void> {
  await saveJsonFile(datedFileName(`party-goat-${fileStem}`), packsToJson(packs, asArray));
}
