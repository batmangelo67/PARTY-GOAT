# PARTY GOAT: Content guide

Read this when creating or editing packs, the schema, or the loader.

## Pack shape
Discriminated union on `kind`. One JSON file per pack in `src/content/packs/<lang>/<game>/<slug>.json`. Which packs exist is listed in `docs/TAXONOMY.md`.

```json
{
  "id": "en-impostor-fast-food-chains",
  "title": "Fast Food & Chain Restaurants",
  "language": "en",
  "spice": 0,
  "kind": "words",
  "games": ["impostor"],
  "group": "general",
  "items": [{ "word": "Pizza", "hint": "Friday night", "difficulty": "easy" }]
}
```

- `id`: `<lang>-<game>-<slug>`, unique, kebab-case. File: `packs/<lang>/<game>/<slug>.json`.
- `language`: `"en" | "it"`.
- `spice`: 0 clean, 1 mild/cheeky, 2 spicy, 3 very spicy. Default UI filter shows 0-1.
- `games`: exactly one game id for builtin packs (a pack belongs to one game).
- `group`: the folder in the picker (kebab-case, required for builtin packs). `section`: optional sub-folder (Sports: `football`, `basketball`, `other`).
- `source`: `"builtin"` (set by loader) or `"custom"` (user-made, stored in IndexedDB).
- Item IDs are derived (pack id + index/hash), never hand-written, and must stay stable.

## Kinds

| kind | item shape | used by |
|---|---|---|
| `words` | `{ word, hint?, difficulty? }` | Impostor |
| `question-pairs` | `{ question, liarQuestion }` | Who's the Liar |
| `prompts` | `{ text, type?: "truth" \| "dare", examples? }` | Who's got the bomb (one prompt = one category, 3-6 `examples`), Mind match (one-word prompts), Never have I ever, Truth or dare, Most likely to, 10/10 but... |
| `cards` | `{ word, banned: string[3-6], difficulty? }` | Forbidden words |
| `numeric` | `{ question, answer, unit, format?: "number" \| "year", asOf?, decoyQuestion?, decoyAnswer? }` | Circa (impostor twist needs the decoy fields) |

Adding a kind = new zod schema in the union + loader support + tests. Don't change existing kinds in a breaking way.

## Authoring rules

**words**
- The pack title is the category. Every item fits it clearly.
- `hint`: 1-3 words, an association one step removed (Pizza -> "Friday night", not "Italian"). Full rules in `docs/TAXONOMY.md` ("Impostor hint rules"): further, not closer.
- `difficulty` on every builtin word, about 40% easy, 40% medium, 20% hard. 40+ items per pack, no duplicates, no word in two packs of the same language.

**question-pairs**
- Both questions must be answerable with similar-looking answers (same answer type: number, name, short phrase).
- They must differ enough that a thoughtful group can spot the liar from the answers.
- Example: "What's the best age to get married?" / "What's the best age to have kids?"
- Mostly light and funny; use `spice` for the cheekier ones.

**numeric**
- Answers must be factually correct and verifiable. Include the unit. Prefer stable facts over ones that change yearly. Flag any doubtful answer instead of guessing.
- Put the unit in the question text too ("in metres", "in what year"): the decoy question has no separate unit field.
- Every builtin item has a decoy question and decoy answer on a similar topic with a clearly different number; both must be as verifiable as the real one. `decoyQuestion` and `decoyAnswer` come together or not at all.

**prompts**
- `text` is the full card as it is read aloud (for Never have I ever, include the "Never have I ever" / "Non ho mai" opening).
- 3-200 characters. `type` is only for Truth or dare (`truth` or `dare`); leave it out otherwise.
- 40+ items per pack. Put the cheekier cards in a separate pack with a higher `spice`.

**cards**
- 4-5 banned words per builtin target word (the schema allows 3-6). Banned words must be the most obvious clues, not random, and must not contain the target word.

**General**
- Clean fun by default. Nothing demeaning, no real private individuals, no slurs, no political or religious baiting.
- Original content only. Never copy lists from other apps or sites.
- No duplicates within a pack. Avoid near-duplicates across packs of the same language.

## Italian content
- Write natively for Italian players: Serie A, Italian cities and regions, cucina italiana, TV, memes, uni and daily life. Do not translate the English packs word for word.
- Use natural, informal Italian (tu form). Short items.
- Same schema and spice rules as English. Pack ids start with `it-`.

## Generating packs (token-efficient workflow)
1. Generate in batches of about 5 packs at a time, directly into files.
2. Run `npm run validate:packs`. Fix errors and report only counts and failures.
3. Check duplicates with a script (`jq` or node), not by reading files.
4. Never paste full pack contents into chat.

## Custom packs (user-made)
- Same schema, `source: "custom"`, stored in IndexedDB, merged by `loader.ts`. Builtin packs win on id clashes.
- Ids are generated once as `custom-<slug>-<6 hex>` and never change on edit.
- Editor (`src/content/pack-text.ts`): one item per line, blank lines ignored, minimum 5 items. `words`: `word` or `word | hint`. `question-pairs`: `question | liarQuestion`. `prompts`: the text (a `|` is kept as text). `cards`: `word | banned 1, banned 2, banned 3, banned 4`. `numeric`: `question | answer | unit`, optionally `| decoy question | decoy answer` (decimal comma or point).
- Export: one pack as an object, all custom packs as an array. The Settings backup also contains every custom pack.
- Import (`src/content/pack-import.ts`): one pack object or an array, each validated with zod. Invalid entries are rejected with a reason; the rest are saved in one IndexedDB transaction. On id clash the user picks overwrite (custom only), keep both (new id) or skip. Imported packs always become `source: "custom"`.

## Tests that must exist
- Every builtin pack validates (vitest, so a bad pack fails CI).
- No duplicate pack ids, no duplicate items in a pack.
- `words` hints never contain their own word.
- `cards`: 4-5 banned words, none containing the target word. `numeric`: every builtin item has a decoy.
- Custom pack save/load round trip.
