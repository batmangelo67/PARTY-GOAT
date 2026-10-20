import { create } from "zustand";
import { logError } from "../engine/logger";
import { deleteCustomPack, saveCustomPacks } from "../storage/custom-packs";
import { runStorageTask } from "../storage/status-store";
import { loadBuiltinPacks, loadCustomPacks, mergePacks } from "./loader";
import type { Pack, PackFile } from "./schema";

interface ContentState {
  packs: Pack[];
  errors: string[];
}

export const useContentStore = create<ContentState>(() => ({ packs: [], errors: [] }));

export async function hydrateContent(): Promise<void> {
  const [builtin, custom] = await Promise.all([
    loadBuiltinPacks(),
    runStorageTask("Loading custom packs", loadCustomPacks).then((result) => result ?? { packs: [], errors: [] }),
  ]);
  const errors = [...builtin.errors, ...custom.errors];
  errors.forEach((message) => logError("Loading packs", message));
  useContentStore.setState({ packs: mergePacks(builtin.packs, custom.packs), errors });
}

// Throws on storage failure so the screen can tell the user nothing was saved.
export async function storeCustomPacks(packs: readonly PackFile[]): Promise<void> {
  await saveCustomPacks(packs);
  await hydrateContent();
}

export async function removeCustomPack(packId: string): Promise<void> {
  await deleteCustomPack(packId);
  await hydrateContent();
}
