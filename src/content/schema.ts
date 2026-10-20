import { z } from "zod";
import { LANGUAGES } from "../i18n/languages";
import { MAX_SPICE } from "../app/constants";

export const ITEM_LIMITS = {
  word: 40,
  hint: 30,
  question: 160,
  prompt: 200,
  minQuestion: 5,
  minPrompt: 3,
} as const;

export const PROMPT_TYPES = ["truth", "dare"] as const;

export const PACK_SOURCES = ["builtin", "custom"] as const;
export type PackSource = (typeof PACK_SOURCES)[number];

const packBaseShape = {
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "id must be kebab-case"),
  title: z.string().trim().min(1).max(40),
  language: z.enum(LANGUAGES),
  spice: z.number().int().min(0).max(MAX_SPICE),
  games: z.array(z.string().min(1)).min(1),
  source: z.enum(PACK_SOURCES).optional(),
};

export const wordItemSchema = z.strictObject({
  word: z.string().trim().min(1).max(ITEM_LIMITS.word),
  hint: z.string().trim().min(1).max(ITEM_LIMITS.hint).optional(),
});

export const questionPairItemSchema = z.strictObject({
  question: z.string().trim().min(ITEM_LIMITS.minQuestion).max(ITEM_LIMITS.question),
  liarQuestion: z.string().trim().min(ITEM_LIMITS.minQuestion).max(ITEM_LIMITS.question),
});

export const promptItemSchema = z.strictObject({
  text: z.string().trim().min(ITEM_LIMITS.minPrompt).max(ITEM_LIMITS.prompt),
  type: z.enum(PROMPT_TYPES).optional(),
});

const wordsPackSchema = z.strictObject({
  ...packBaseShape,
  kind: z.literal("words"),
  items: z.array(wordItemSchema).min(1),
});

const questionPairsPackSchema = z.strictObject({
  ...packBaseShape,
  kind: z.literal("question-pairs"),
  items: z.array(questionPairItemSchema).min(1),
});

const promptsPackSchema = z.strictObject({
  ...packBaseShape,
  kind: z.literal("prompts"),
  items: z.array(promptItemSchema).min(1),
});

// Add new kinds (cards, numeric) here, then extend itemKey in items.ts and the line parser in pack-text.ts.
export const packFileSchema = z.discriminatedUnion("kind", [wordsPackSchema, questionPairsPackSchema, promptsPackSchema]);
export const PACK_KINDS = ["words", "question-pairs", "prompts"] as const satisfies readonly PackFile["kind"][];

export type PackFile = z.infer<typeof packFileSchema>;
export type PackKind = PackFile["kind"];
export type PackFileOf<K extends PackKind> = Extract<PackFile, { kind: K }>;
export type ItemOf<K extends PackKind> = PackFileOf<K>["items"][number];
export type WithId<T> = T & { id: string };

export type PackOf<K extends PackKind> = Omit<PackFileOf<K>, "items" | "source"> & {
  source: PackSource;
  items: WithId<ItemOf<K>>[];
};
export type Pack = { [K in PackKind]: PackOf<K> }[PackKind];

export type WordItem = ItemOf<"words">;
export type QuestionPairItem = ItemOf<"question-pairs">;
export type PromptItem = ItemOf<"prompts">;
