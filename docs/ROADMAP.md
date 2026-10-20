# PARTY GOAT: Roadmap and game specs

Read this to see what's built, what's next, and how each game should behave.
Update the Status column at the end of every stage.

## Status

| Stage | Scope | Status |
|---|---|---|
| 1 | Scaffold, PWA, i18n, storage, schema, loader, shared engine | done |
| 2 | Impostor (clue modes) + Who's the Liar + starter EN/IT packs | done |
| 3 | Custom pack editor, pack browser, import/export, bulk packs | done (bulk packs still to generate) |
| 4 | Who's got the bomb, Never have I ever | done |
| 5 | Truth or dare, Most likely to, 10/10 but... | todo |
| 6 | Forbidden words, Mind match | todo |
| 7 | Circa + Circa Impostor | todo |
| 8 | Polish: animations, sounds, themes, spice filters | todo |

## Decisions already made
- Single-phone, pass-the-phone play only. No realtime backend.
- Web app (PWA) on Vercel free tier, not native iOS.
- UI and content in English and Italian; packs carry a `language` field.
- Impostor clue mode: `none | category | hint | both`, default `category`. Missing hint falls back to category.
- Who's the Liar: liar gets a similar question; answers typed or spoken; liar doesn't know they're the liar by default.
- No in-app AI generation (no API key, no cost). Packs are generated offline and added as JSON.

## Game specs

**Impostor** (words): everyone sees the secret word except impostor(s), who see role + clues per clue mode. Discuss, vote, reveal. Options: impostor count, impostors know each other, impostor may guess the word if caught, discussion timer.

**Who's the Liar** (question-pairs): non-liars get question A, liar gets similar question B. Answers revealed side by side (typed) or said aloud (spoken). Discuss, vote, reveal both questions.

**Who's got the bomb** (words as categories): a category appears, a hidden random timer runs (configurable range, e.g. 20-60s), players name an item and pass the phone. Whoever holds it at the explosion loses the round. Sound and flash instead of vibration.

**Never have I ever** (prompts): prompt cards with spice filter. Optional "fingers" mode with per-player counters.

**Truth or dare** (prompts with `type: truth | dare`): player picks, gets a prompt, optional skip with penalty, spice filter.

**Most likely to** (prompts): prompt appears, group counts to three and points; the app can optionally tally votes per player.

**10/10 but...** (prompts): a person is a 10/10 but has a quirk; group rates how bad it is. Optional rating tally.

**Forbidden words** (cards): describe the target word without saying it or the banned words. Timer, teams, skip and correct buttons, round scoring.

**Mind match** (words): players write or say a word at the same time, then converge round by round until two match. Optional starter word pairs.

**Circa** (numeric): everyone secretly enters a number, closest wins. **Circa Impostor**: one player gets a decoy question and must bluff. Needs verified answers.

## Shared engine contract
Every game exports `{ id, nameKey, descriptionKey, icon, acceptsKinds, SetupScreen, PlayScreen }` and is registered in one registry file. Games reuse: players, PassPhone, Timer, Voting, random, history, content picker. If a game needs something new in the engine, add it generically, not per game.

## Next up
Stage 5: Truth or dare, Most likely to, 10/10 but... (all `prompts` packs). Bulk pack generation from stage 3 is still open; consider lazy-loading packs once the bundle grows.
