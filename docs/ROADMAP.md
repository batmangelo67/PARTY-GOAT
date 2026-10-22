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
| 5 | Truth or dare, Most likely to, 10/10 but... | done |
| 6 | Forbidden words, Mind match | done |
| 7 | Circa + Circa Impostor | done (one game, impostor is a setup toggle) |
| 8 | Polish: animations, sounds, themes, spice filters | done (settings: accent colour, sound, animations, global spice limit) |
| 9 | UX audit + fixes: quick start, pack picker, exit anywhere, visual identity | done (audit harness in `tests/audit`, findings and before/after in `docs/UX-AUDIT.md`, style in `docs/DESIGN.md`) |

## Decisions already made
- Single-phone, pass-the-phone play only. No realtime backend.
- Web app (PWA) on Vercel free tier, not native iOS.
- UI and content in English and Italian; packs carry a `language` field.
- Impostor clue mode: `none | category | hint | both`, default `category`. Missing hint falls back to category.
- Who's the Liar: liar gets a similar question; answers typed or spoken; liar doesn't know they're the liar by default.
- No in-app AI generation (no API key, no cost). Packs are generated offline and added as JSON.
- UX audit (see `docs/UX-AUDIT.md`), flow and exit decisions:
  - Every game's options and pack choice are saved per game (`config:<gameId>` in IndexedDB) and validated field by field with zod on load, so one bad value falls back to its default without losing the rest.
  - `packIds: null` means "the default mix": every pack for the game in the app language within the spice limit (any language if the app language has none). Choosing exactly the default set is stored back as `null`, so the mix keeps picking up new packs and language changes. An explicit choice keeps packs of any language but drops deleted or too-spicy ones.
  - Home shows a "Play again" card for the last game started. It opens setup with `?go=1`, which starts at once when setup is complete and otherwise just shows setup with the problem. Setup stays the single place that knows whether a game can start.
  - Setup has one shared layout: players as a compact row once there are enough (editor on tap), packs as one summary row, the one or two options that change the game, the rest under "More options" (collapsed every time).
  - The pack picker is its own screen, one level deep: search, Mix everything, Surprise me (one random pack), Clear, chips for All / Recent / Starred / All languages / Spice, star per pack. Recents and stars are stored in `play-log` / `favorite-packs`. Folders and sections from TAXONOMY.md are not in the data yet; when they land they become extra chips, not extra levels.
  - Exit anywhere: inside a game every screen's header shows ✕ instead of a back arrow. It leaves at once when nothing would be lost, otherwise it opens the pause menu (Keep playing, Change setup, Home). "Would be lost" = any tap since the round started, cleared on result screens (`Screen settled`).
  - The system back gesture inside a running round opens the same pause menu (react-router `useBlocker`; the app now uses `createHashRouter`). In-app navigation (End game, Back to setup) is never blocked.
  - Timers, the bomb fuse and Forbidden words turns stop while the pause menu is open, and the menu opens by itself when the app goes to the background during one, so locking the phone never costs a turn or blows up the bomb.
  - The running game lives only in memory. A reload, an app kill or a forward navigation lands on setup with options intact; there is never a half-finished round in storage.
  - Leaving steps back in history when the target is where the game was started from, so the back gesture afterwards does not land inside a finished game.
  - Default spice limit stays "Cheeky"; the picker shows it as a labelled chip so it is visible where packs are chosen.
- Visual identity (see `docs/DESIGN.md`): an original goat mascot with six moods, one glyph and one colour per game
  (in the game's folder, `icon.tsx`), the theme accent for actions and the game colour for identity. All art is code;
  app icons are rendered from the mascot's shape data with the audit's Playwright Chromium. The goat never appears on
  secret screens. Every animation is skipped with reduced motion or Settings > Animations off.

## Game specs

**Impostor** (words): everyone sees the secret word except impostor(s), who see role + clues per clue mode. Discuss, vote, reveal. Options: impostor count, impostors know each other, impostor may guess the word if caught, discussion timer.

**Who's the Liar** (question-pairs): non-liars get question A, liar gets similar question B. Answers revealed side by side (typed) or said aloud (spoken). Discuss, vote, reveal both questions.

**Who's got the bomb** (words as categories): a category appears, a hidden random timer runs (configurable range, e.g. 20-60s), players name an item and pass the phone. Whoever holds it at the explosion loses the round. Sound and flash instead of vibration.

**Never have I ever** (prompts): prompt cards with spice filter. Optional "fingers" mode with per-player counters.

**Truth or dare** (prompts with `type: truth | dare`): player picks, gets a prompt, optional skip that counts against them in the final ranking, spice filter. Untyped cards (custom packs) work for both choices.

**Most likely to** (prompts): prompt appears, group counts to three and points; the app can optionally tally votes per player.

**10/10 but...** (prompts): a person is a 10/10 but has a quirk; group rates how bad it is. Optional rating tally.

**Forbidden words** (cards): describe the target word without saying it or the banned words. Two random teams (4+ players), timed turns, Correct and Skip buttons plus a "Banned word!" button (-1) for the other team, describer rotates inside each team.

**Mind match** (words): two random starter words from the selected packs; everyone says (spoken mode) or secretly writes (typed mode) a word that links them, and the words of each round become the next prompt until two players match. Typed mode finds matches ignoring case and accents and awards a point per matching player.

**Circa** (numeric): everyone secretly enters a number, closest wins. **Circa Impostor** (a setup toggle on the same game): one player gets the decoy question and must bluff, then the group discusses and votes; only items with a decoy are used. Needs verified answers.

## Shared engine contract
Every game exports `{ id, nameKey, descriptionKey, icon, acceptsKinds, SetupScreen, PlayScreen }` and is registered in one registry file. Games reuse: players, PassPhone, Timer, Voting, random, history, content picker. If a game needs something new in the engine, add it generically, not per game.

## Next up
All nine stages are done. Open items:
- Bulk pack generation from stage 3 (packs are still starter-sized, 20 to 40 items each).
- Folders and sections from TAXONOMY.md in the pack data; then folder chips in the picker.
- Deferred from the UX audit (details in `docs/UX-AUDIT.md`): a Done control for the iOS number keypad in Circa,
  a message when renaming a player to a taken name, a smaller shared vendor chunk, and including remembered
  options, recents and starred packs in backups.
