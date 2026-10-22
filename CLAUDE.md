# PARTY GOAT

Personal, ad-free party-game PWA for ONE phone passed around. English + Italian.
Installed on iPhone via "Add to Home Screen", hosted on Vercel free tier.
Solo project. No backend, no accounts, no analytics, no ads.

App name lives in ONE constant: `APP_NAME = "PARTY GOAT"` in `src/app/constants.ts`.

## Stack
Vite, React, TypeScript (strict), Tailwind, react-router (HashRouter), zustand, idb, zod, vite-plugin-pwa, vitest.
No i18n library: typed dictionaries in `src/i18n/{en,it}.ts` + `useT()`.
Ask before adding any dependency.

## Commands
- `npm run dev` / `build` / `typecheck` / `test`
- `npm run validate:packs` validates every builtin pack against the zod schema (create this in stage 1)
- A task is done only when `typecheck` and `test` pass. Run `build` too when touching config or PWA setup.

## Layout
```
src/app/       routes, home grid, settings, constants
src/engine/    players, PassPhone, Timer, Voting, random, no-repeat history
src/games/<id>/  one folder per game (Setup + Play + pure logic + tests)
src/content/   schema.ts, loader.ts, packs/{en,it}/*.json
src/i18n/      en.ts, it.ts, useT
src/storage/   idb wrappers
docs/          CONTENT.md, ROADMAP.md (read only when relevant, see below)
```
Adding a game = one folder in `src/games` + one registry line + i18n keys.
Never special-case a game inside `src/engine`.

## Hard rules
1. **Originality.** Never copy or reference any existing app's name, branding, words, questions, art or sounds. Mechanics are generic; all content is written fresh.
2. **No network at runtime.** Everything must work offline after first load. No external fonts, CDNs, APIs or analytics.
3. **iOS Safari constraints.** No Vibration API (use sound + visuals). Unlock AudioContext on the first user tap. Use Wake Lock with fallback during games. Use `100dvh`, safe-area insets, big tap targets, no accidental zoom or text selection.
4. **i18n.** Every user-visible string goes through `t()`. `it.ts` must satisfy the type of `en.ts` so a missing key is a compile error. Italian is written natively, not literally translated.
5. **Randomness** only via `src/engine/random.ts` (crypto-based). Never `Math.random()`.
6. **Pure logic is separate from UI** and unit tested (assignment, clue resolution, scoring, voting ties, history). Components stay thin.
7. **Content is data.** Packs are JSON validated by zod. No hardcoded word lists in code.
8. **Pass-the-phone privacy.** Secret info is only shown inside `PassPhone` (interstitial, tap to reveal, tap to hide, next). Never render secrets on a shared screen.

## Code conventions
- Named exports, small files, descriptive names, no comments that restate the code.
- State in zustand stores; persisted data goes through `src/storage` only.
- Tailwind utility classes; shared tokens in `tailwind.config`. Dark theme only.

## Working style (token efficiency)
- Plan in 10 lines or fewer, state assumptions, then act. Don't ask permission for in-scope decisions.
- Locate with grep/glob first; read line ranges of big files instead of whole files.
- Don't re-read files you just wrote. Don't `cat` pack JSON; use `wc`, `jq` or the validator output.
- Batch related edits; run tests once per stage, not after every small edit.
- Generate content by writing straight to files (heredoc or script), run `validate:packs`, then report only counts and errors. Never paste generated packs into chat.
- Reply with at most 5 lines on what changed. No full-file dumps, no restating the task.
- Work one stage at a time. At the end of each stage: update the status in `docs/ROADMAP.md`, commit, and suggest `/clear` if the session is heavy.

## Git
`git init` at the start. One commit per stage, conventional messages (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).

## Read only when relevant
- Working on packs, schemas or content generation: read `docs/CONTENT.md`
- Choosing what to build next or checking game specs: read `docs/ROADMAP.md`
- Planning content, packs or pack structure: read docs/TAXONOMY.md
- Touching UI, art, icons or motion: read `docs/DESIGN.md`
