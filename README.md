# PARTY GOAT

A personal, ad-free party game app for one phone passed around the table. English and Italian. Installs on iPhone from Safari ("Add to Home Screen") and works offline. No backend, no accounts, no analytics, no ads.

The app name lives in one constant: `APP_NAME` in `src/app/constants.ts`.

## Games

- **Impostor**: everyone sees the secret word except the impostor(s), who get a clue depending on the clue mode. Discuss, vote, reveal.
- **Who's the Liar**: everyone answers the same question except the liar, who got a similar one. Compare answers, vote, reveal.
- **Who's got the bomb**: name something in the category and pass the phone before the hidden fuse runs out.
- **Never have I ever**: prompt cards, with an optional fingers mode that keeps score.

Packs can be browsed, created, edited, imported and exported from the **Packs** screen (home or Settings).

## Run locally

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
```

```bash
npm run dev
```

Open the address it prints (usually http://localhost:5173). To try it on your iPhone on the same Wi-Fi, run `npm run dev -- --host` and open the "Network" address in Safari.

Other commands:

| Command | What it does |
|---|---|
| `npm run build` | Production build into `dist/` (includes the service worker) |
| `npm run preview` | Serves the production build locally, to test offline mode |
| `npm run typecheck` | Checks TypeScript types |
| `npm test` | Runs all unit tests |
| `npm run validate:packs` | Validates every content pack against the schema |
| `npm run make:icons` | Regenerates the PNG icons in `public/` |

## Deploy to Vercel (free tier)

1. Push the repository to GitHub.
2. In Vercel, click **Add New → Project** and import the repository.
3. Framework preset: **Vite**. Build command `npm run build`, output directory `dist` (Vercel fills these in).
4. Deploy. Every push to the main branch redeploys automatically.

The app uses hash routes (`/#/settings`), so no server rewrite rules are needed.

Install on iPhone: open the Vercel URL in Safari, tap **Share → Add to Home Screen**. Open it once while online so it caches everything; after that it works offline. New versions install themselves the next time the app is opened online.

## Add a content pack

1. Create `src/content/packs/<lang>/<slug>.json`, where `<lang>` is `en` or `it`. The `id` must be `<lang>-<slug>`.
2. Use one of the existing kinds:

```json
{
  "id": "en-sports",
  "title": "Sports",
  "language": "en",
  "spice": 0,
  "kind": "words",
  "games": ["impostor"],
  "items": [{ "word": "Tennis", "hint": "Racket" }]
}
```

```json
{
  "id": "en-travel",
  "title": "Travel",
  "language": "en",
  "spice": 0,
  "kind": "question-pairs",
  "games": ["whos-the-liar"],
  "items": [{ "question": "Where would you go on honeymoon?", "liarQuestion": "Where would you go on a work trip?" }]
}
```

A third kind, `prompts`, holds cards like `{ "text": "Never have I ever ..." }` for Never have I ever.

3. Run `npm run validate:packs`. A broken pack fails the tests with the file name and the bad field.

`spice` goes from 0 (clean) to 3; packs above 1 only show when "Show spicy" is on. Hints are 1 to 3 words and must not contain the word. Item IDs are generated automatically. See `docs/CONTENT.md` for the full authoring rules.

## Add a game

1. Create `src/games/<game-id>/` with a setup screen, a play screen, pure logic in `logic.ts` and tests in `logic.test.ts`.
2. Export a definition from `src/games/<game-id>/index.ts`:

```ts
export const myGame: GameDefinition = {
  id: "my-game",
  nameKey: "myGame.name",
  descriptionKey: "myGame.description",
  icon: "🎲",
  acceptsKinds: ["words"],
  SetupScreen: MyGameSetupScreen,
  PlayScreen: MyGamePlayScreen,
};
```

3. Add it to `GAMES` in `src/games/registry.ts`. The home screen picks it up.
4. Add its text to `src/i18n/en.ts` and `src/i18n/it.ts` (a missing Italian key is a type error).
5. Reuse the engine in `src/engine/`: `PassPhone`, `Timer`, `Voting`, `ContentPicker`, `PlayerEditor`, `RoundResult`, `drawItem` (no-repeat picks), `random.ts`, and the hidden-role helpers in `roles.ts`.

A new pack kind goes into the union in `src/content/schema.ts`, plus a case in `itemKey` in `src/content/items.ts`.

## Project layout

```
src/app/       routes, home, players, settings, constants
src/engine/    shared logic and components used by every game
src/games/     one folder per game
src/content/   pack schema, loader, packs/{en,it}/*.json
src/i18n/      en.ts, it.ts, useT
src/storage/   IndexedDB wrappers, backup export/import
```

## Data and backup

Players, settings, custom packs and the no-repeat history are stored in IndexedDB on the device. **Settings → Export data** saves a JSON backup (on iPhone it opens the share sheet); **Import data** restores one after validating it.
