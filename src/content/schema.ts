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
  bannedWord: 40,
  minBanned: 3,
  maxBanned: 6,
  unit: 20,
  example: 40,
  minExamples: 3,
  maxExamples: 6,
} as const;

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const NUMERIC_FORMATS = ["number", "year"] as const;

const kebabId = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "id must be kebab-case");

export const PROMPT_TYPES = ["truth", "dare"] as const;

export const PACK_SOURCES = ["builtin", "custom"] as const;
export type PackSource = (typeof PACK_SOURCES)[number];

const packBaseShape = {
  id: kebabId,
  title: z.string().trim().min(1).max(40),
  language: z.enum(LANGUAGES),
  spice: z.number().int().min(0).max(MAX_SPICE),
  games: z.array(z.string().min(1)).min(1),
  source: z.enum(PACK_SOURCES).optional(),
  group: kebabId.optional(),
  section: kebabId.optional(),
};

export const wordItemSchema = z.strictObject({
  word: z.string().trim().min(1).max(ITEM_LIMITS.word),
  hint: z.string().trim().min(1).max(ITEM_LIMITS.hint).optional(),
  difficulty: z.enum(DIFFICULTIES).optional(),
});

export const questionPairItemSchema = z.strictObject({
  question: z.string().trim().min(ITEM_LIMITS.minQuestion).max(ITEM_LIMITS.question),
  liarQuestion: z.string().trim().min(ITEM_LIMITS.minQuestion).max(ITEM_LIMITS.question),
});

export const promptItemSchema = z.strictObject({
  text: z.string().trim().min(ITEM_LIMITS.minPrompt).max(ITEM_LIMITS.prompt),
  type: z.enum(PROMPT_TYPES).optional(),
  examples: z
    .array(z.string().trim().min(1).max(ITEM_LIMITS.example))
    .min(ITEM_LIMITS.minExamples)
    .max(ITEM_LIMITS.maxExamples)
    .optional(),
});

export const cardItemSchema = z.strictObject({
  word: z.string().trim().min(1).max(ITEM_LIMITS.word),
  banned: z.array(z.string().trim().min(1).max(ITEM_LIMITS.bannedWord)).min(ITEM_LIMITS.minBanned).max(ITEM_LIMITS.maxBanned),
  difficulty: z.enum(DIFFICULTIES).optional(),
});

// A decoy question needs its own answer, so the two fields come together or not at all.
export const numericItemSchema = z
  .strictObject({
    question: z.string().trim().min(ITEM_LIMITS.minQuestion).max(ITEM_LIMITS.question),
    answer: z.number().finite(),
    unit: z.string().trim().min(1).max(ITEM_LIMITS.unit),
    format: z.enum(NUMERIC_FORMATS).optional(),
    asOf: z.number().int().optional(),
    decoyQuestion: z.string().trim().min(ITEM_LIMITS.minQuestion).max(ITEM_LIMITS.question).optional(),
    decoyAnswer: z.number().finite().optional(),
  })
  .refine((item) => (item.decoyQuestion === undefined) === (item.decoyAnswer === undefined), {
    message: "decoyQuestion and decoyAnswer must be given together",
    path: ["decoyQuestion"],
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

const cardsPackSchema = z.strictObject({
  ...packBaseShape,
  kind: z.literal("cards"),
  items: z.array(cardItemSchema).min(1),
});

const numericPackSchema = z.strictObject({
  ...packBaseShape,
  kind: z.literal("numeric"),
  items: z.array(numericItemSchema).min(1),
});

// Add new kinds here, then extend itemKey in items.ts, the line parser in pack-text.ts and the previews.
export const packFileSchema = z.discriminatedUnion("kind", [
  wordsPackSchema,
  questionPairsPackSchema,
  promptsPackSchema,
  cardsPackSchema,
  numericPackSchema,
]);
export const PACK_KINDS = ["words", "question-pairs", "prompts", "cards", "numeric"] as const satisfies readonly PackFile["kind"][];

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
export type CardItem = ItemOf<"cards">;
export type NumericItem = ItemOf<"numeric">;
