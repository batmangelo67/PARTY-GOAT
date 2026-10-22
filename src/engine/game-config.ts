import { create, type StoreApi, type UseBoundStore } from "zustand";
import { z } from "zod";
import { readValue, writeValue } from "../storage/kv";
import { runStorageTask } from "../storage/status-store";
import { logError } from "./logger";

export interface BaseGameConfig {
  // null = the smart default: every pack for this game in the app language, within the spice limit.
  packIds: string[] | null;
}

export interface GameConfigActions<C> {
  update: (changes: Partial<C>) => void;
  setPackIds: (packIds: string[] | null) => void;
}

export type GameConfigStore<C extends BaseGameConfig = BaseGameConfig> = UseBoundStore<StoreApi<C & GameConfigActions<C>>>;

const PACK_IDS_SCHEMA = z.array(z.string().min(1)).nullable();

const hydrators: (() => Promise<void>)[] = [];

export function configKey(gameId: string): string {
  return `config:${gameId}`;
}

function pickConfig<C extends BaseGameConfig>(state: C, defaults: C): C {
  return Object.fromEntries(Object.keys(defaults).map((key) => [key, state[key as keyof C]])) as unknown as C;
}

// Keeps only stored fields that still pass the game's schema, so an old or broken value falls back to the default.
export function readStoredConfig<C extends BaseGameConfig>(stored: unknown, defaults: C, fields: z.ZodRawShape): Partial<C> {
  if (typeof stored !== "object" || stored === null) return {};
  const shape = { ...fields, packIds: PACK_IDS_SCHEMA };
  const result: Record<string, unknown> = {};
  for (const [key, schema] of Object.entries(shape)) {
    if (!(key in defaults) || !(key in stored)) continue;
    const parsed = (schema as z.ZodType).safeParse((stored as Record<string, unknown>)[key]);
    if (parsed.success) result[key] = parsed.data;
  }
  return result as Partial<C>;
}

// A game's setup options, remembered between launches. `fields` validates every option except packIds.
export function createGameConfig<C extends BaseGameConfig>(gameId: string, defaults: C, fields: z.ZodRawShape): GameConfigStore<C> {
  const store = create<C & GameConfigActions<C>>()((set, get) => {
    const save = () =>
      void runStorageTask(`Saving ${gameId} options`, () => writeValue(configKey(gameId), pickConfig(get(), defaults)));
    return {
      ...defaults,
      update: (changes) => {
        set(changes as Partial<C & GameConfigActions<C>>);
        save();
      },
      setPackIds: (packIds) => {
        set({ packIds } as Partial<C & GameConfigActions<C>>);
        save();
      },
    };
  });

  hydrators.push(async () => {
    const stored = await runStorageTask(`Loading ${gameId} options`, () => readValue(configKey(gameId)));
    store.setState(readStoredConfig(stored, defaults, fields) as Partial<C & GameConfigActions<C>>);
  });
  return store;
}

export async function hydrateGameConfigs(): Promise<void> {
  await Promise.all(hydrators.map((hydrate) => hydrate().catch((error: unknown) => logError("Loading game options", error))));
}

// What generic screens (pack picker, home quick start) need from a game's options.
export interface PackAccess {
  usePackIds: () => string[] | null;
  setPackIds: (packIds: string[] | null) => void;
}

export function packAccess<C extends BaseGameConfig>(store: GameConfigStore<C>): PackAccess {
  return {
    usePackIds: () => store((state) => state.packIds),
    setPackIds: (packIds) => store.getState().setPackIds(packIds),
  };
}
