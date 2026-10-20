import { create } from "zustand";
import { logError } from "../engine/logger";

interface StorageStatusState {
  failed: boolean;
  markFailed: () => void;
}

export const useStorageStatus = create<StorageStatusState>((set) => ({
  failed: false,
  markFailed: () => set({ failed: true }),
}));

// Storage problems must not break the game: log them and show the banner.
export async function runStorageTask<T>(context: string, task: () => Promise<T>): Promise<T | undefined> {
  try {
    return await task();
  } catch (error) {
    logError(`${context} failed — IndexedDB is unavailable or full — data won't be saved this session`, error);
    useStorageStatus.getState().markFailed();
    return undefined;
  }
}
