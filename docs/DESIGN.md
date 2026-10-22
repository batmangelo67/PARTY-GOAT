# PARTY GOAT: Design

How the app looks and moves. Read this before touching UI, art, icons or motion.
Everything here is drawn in code (SVG, CSS, canvas). No image files except the generated app icons, no fonts, no network.

## Personality

Loud, warm, a bit cheeky. A party game for one phone, read from arm's length in a dim room.
Big type, chunky buttons, one clear action per screen, colour that tells you which game you are in.
Fun lives in short moments (reveal, countdown, win, boom); flows between them stay fast.

## Tokens

Defined in `tailwind.config.js` and `src/index.css`. Use the tokens, not raw values.

| Token | Value | Use |
|---|---|---|
| `ink` | `#0e0c13` | App background, text on accent |
| `panel` | `#1a1722` | Cards, rows, inputs |
| `raised` | `#25212f` | Pressed / selected surfaces, secondary buttons |
| `line` | `#353042` | Borders, dividers, empty checkboxes |
| `text` | `#f4f1ea` | Body text |
| `muted` | `#a29cb0` | Secondary text (passes 4.5:1 on `panel`) |
| `accent` | theme (lime, pink, sky, orange) | The one primary action per screen, the goat's hat |
| `game` | per game (see below) | Badges, tile glow, in-game header tint, confetti |
| `danger` | `#ff5d55` | Banned word, explosion, destructive buttons |
| `info` | `#9b8cff` | Neutral highlights |

Radii: `rounded-2xl` (1rem) for controls and rows, `rounded-card` (1.5rem) for cards and tiles, full for chips.
Spacing: 4 px grid (Tailwind default). Screen gutters come from `px-safe` (≥ 16 px plus the safe-area inset).
Tap targets: `min-h-tap` (56 px) for buttons and rows; never below 44 px for anything tappable.
Type: the system rounded face (`ui-rounded`, SF Pro Rounded on iPhone). Display text is `font-black` with tight tracking;
section labels are small caps (`text-sm font-bold uppercase tracking-widest text-muted`). Body never below 14 px, labels never below 13 px.

### Game colours

Each game owns one accent, set in its `icon.tsx` and exposed as `GameDefinition.accent`.
Screens inside a game set the CSS variable `--game` (see `GameTheme`), so `text-game`, `bg-game/15` etc. follow the game.

| Game | Colour |
|---|---|
| Impostor | `#c08bff` violet |
| Who's the Liar | `#ffb23d` amber |
| Who's got the bomb | `#ff6a3d` fuse orange |
| Never have I ever | `#ff8fd0` pink |
| Truth or dare | `#ff5c7a` coral |
| Most likely to | `#5cc8ff` sky |
| 10/10 but... | `#ffd447` yellow |
| Forbidden words | `#3ee0a6` mint |
| Mind match | `#8aa6ff` periwinkle |
| Circa | `#35d6cf` teal |

The theme accent (Settings > Colour) is for actions; the game colour is for identity. Never use a game colour for the primary button.

## Components

- **Buttons** (`Button` in `src/engine/ui.tsx`): primary = theme accent with a darker bottom edge that presses down;
  secondary = `raised`; ghost = text only. One primary per screen. Full width in footers.
- **Cards** (`BigCard`, rows): `panel` with a 1 px top highlight. Selected rows get `ring-2 ring-accent`.
- **Screen**: header (back arrow, or ✕ inside a game), scrolling `main`, fixed footer with the actions. The footer
  always holds the next step, so the thumb never hunts for it.
- **Game badge** (`src/art/game-badge.tsx`): the game's glyph on a rounded tile in its colour. Used on home tiles,
  the play-again card and in the header of every setup, picker and in-game screen (`GameTheme` provides it).
- **Chips** (`Chip`, `ChipGroup`): filters and choices with more than four options; they wrap instead of squeezing.
- **Pause menu** (`src/engine/game-shell.tsx`): an opaque sheet (never shows the secret behind it) with the sleepy goat.

## Mascot

`src/art/goat.tsx`, shapes in `src/art/goat-paths.ts`. One head, a party hat painted with `currentColor`
(so it follows the theme), six moods:

| Mood | Where |
|---|---|
| `happy` | Home header |
| `wink` | App icon and favicon |
| `party` | Round results where the group won, final rankings (with the confetti burst) |
| `shock` | Explosion, impostor or liar got away, a tie in the vote |
| `sleepy` | Loading, the pause menu, empty lists (no recents, no starred packs), the splash |
| `sly` | The vote screen ("who is it?") |

Rules: the goat appears at most once per screen and never covers an action. It never appears on pass-the-phone
or secret screens: a different picture for the impostor would be visible from across the table.
Size 56-120 px on screens. Don't recolour the fur or horns; the hat follows `currentColor` (use `text-accent`).

## Icons

Game glyphs live in each game's folder (`src/games/<id>/icon.tsx`) on a 48x48 grid: ink (`#0e0c13`) shapes,
3.2 px round strokes, details in `currentColor` (the game colour shows through). Keep a glyph to 2-4 shapes so it reads at 32 px.
Adding a game means adding its `icon.tsx` with a glyph and an accent.

## Backgrounds

Every screen uses `.confetti-bg` (in `index.css`): `ink` with a faint confetti pattern (inline SVG data URI, < 1 KB)
and a soft glow at the top in the current game colour (`--game`, set by `GameTheme`; the theme accent elsewhere).
Home tiles carry a light diagonal wash of their game colour. No photos, no gradients behind body text.

## Motion

- Durations: 120-260 ms for UI (pop-in, sheet, fade), 1-1.4 s for celebrations. Nothing blocks input.
- Reveal: the secret card flips in (`flip-in`, 260 ms).
- Countdown: a ring drains around the clock; the last 10 s pulse in `danger`.
- Win: a one-shot canvas confetti burst (`ConfettiBurst`, about 70 pieces, 1.4 s) plus the party goat.
- Explosion: white flash, shock rings and the shocked goat; the next action is on screen at once.
- `prefers-reduced-motion` and Settings > Animations off disable every animation (CSS rules in `index.css`,
  `ConfettiBurst` checks both).

## Loading

`index.html` carries an inline splash (goat + name, pure SVG/CSS) that shows until React mounts, so a cold start
on a slow phone never shows a blank screen. Round loading uses the sleepy goat.

## Weight budget

Art is code: the mascot, glyphs, confetti, splash and patterns. The generated PNG icons (`npm run make:icons`,
rendered from `src/art/goat-paths.ts`) are the only binary assets; the two 512 px icons are only used when installing,
so `vite.config.ts` keeps them out of the offline precache.

Measured when the identity landed: initial JS + CSS +13 KB raw (+6.6 KB gzip), precached icons +25 KB,
offline precache 750 → 782 KiB. Check `npm run build` before and after visual changes and keep the growth this small.
