# PARTY GOAT: UX audit

Audit of the whole app (10 games) before the flow, exit and visual work. Findings are ranked by severity,
each with evidence and a proposed fix. Raw numbers per device are in `docs/audit/summary-before.md`
and `docs/audit/results-before.json`; screenshots in `docs/audit/evidence/before/`.

## How it was measured

A repeatable Playwright harness in `tests/audit/` runs the production build (`vite preview`, real service worker):

```bash
npm run audit                       # build + every check, all devices and languages
AUDIT_LABEL=after npm run audit     # keep a run apart under docs/audit/runs/after
npm run audit:report -- after       # summary-after.md + results-after.json
```

- **Engines:** WebKit (primary, closest to iOS Safari) on iPhone SE (375x667), iPhone 15 (393x852) and iPhone 15 Pro Max
  (430x932), full standalone screen size, touch on, in English and Italian. Chromium on iPhone 15 size as a secondary check.
  Both browsers installed and ran here; nothing fell back.
- **Journeys** (`journeys.spec.ts`): home, first playable moment, a full round, result, play again, then a relaunch
  (fresh page, same storage) and a repeat play. A driver takes the obvious action on each screen (fill an empty field,
  else the accent button, else a vote) and fast-forwards a fake clock through timers. Every tap and typed entry is counted.
  "First playable moment" is the first screen after Start (pass-the-phone screen, first card, fuse ready, turn ready).
  Card games (Never have I ever, Truth or dare, Most likely to, 10/10) have no round end, so a round is a few cards then End.
- **Exits** (`exits.spec.ts`): every in-game screen checked for a visible way out; browser/system back mid-round and
  forward again; reload mid-round; backgrounding for 60 s during a timer, fuse or turn; leaving mid-game while
  checking wake locks and sounds (Wake Lock API faked and counted, audio voices counted); rotation to landscape.
- **Layout** (`lib/layout.ts`, on every screen reached): horizontal overflow, clipped text, tap targets under 44 px,
  text under 13 px, WCAG contrast, footer actions off screen.
- **Memory** (`memory.spec.ts`): change an option and a pack, relaunch, compare.
- **Monkey** (`monkey.spec.ts`): 120 seeded random taps and entries per game on 4 device/language pairs, watching for
  crashes, console errors, blank screens and impossible text (NaN, undefined, negative scores). Seeds are in the report.
- **First load and offline** (`offline-perf.spec.ts`): build sizes, load timings, a throttled load in Chromium
  (4x CPU, 1.6 Mbps, 150 ms), then offline reload and a full start of Impostor.
- **Comprehension**: every screen read as a first-time player (screenshots of every screen in every journey).

Limits: Playwright cannot show the iOS keyboard or real safe-area insets, so keyboard overlap and notch collisions were
reviewed in code and CSS, not measured. Haptics and real audio output are not observable; audio is counted at the API.

## Summary

Robust but slow to get into and impossible to leave. No crashes, console errors or impossible states in 40 monkey runs,
offline works everywhere, layout holds in both languages and in landscape. The problems are flow and control:
in 6 of 10 games most in-game screens have no way out, the back gesture throws the round away without asking,
setup screens run up to 4.6 screens and 43 controls on an iPhone SE, and almost nothing a group chooses is remembered.

## Tap counts (before)

WebKit, iPhone 15, English. Italian and the other sizes give the same tap counts; setup size grows on SE (see table 2).
Taps include text entries (4 player names on first play count as 4 of the taps).

| Game | First play: taps to first card | Round taps | Play again | Repeat play after relaunch | Setup controls | Setup height (screens) |
|---|---|---|---|---|---|---|
| Impostor | 10 (4 typed) | 12 | 1 | 2 + re-check setup | 42 | 3.3 |
| Who's the Liar | 10 (4 typed) | 16 | 1 | 2 + re-check setup | 27 | 1.8 |
| Who's got the bomb | 10 (4 typed) | 5 | 1 | 2 + re-check setup | 36 | 3.0 |
| Never have I ever | 2 | 4 | 1 | 2 | 10 | 1.0 |
| Truth or dare | 10 (4 typed) | 7 | 1 | 2 + re-check setup | 19 | 1.3 |
| Most likely to | 2 | 4 | 1 | 2 | 9 | 1.0 |
| 10/10 but... | 2 | 4 | 1 | 2 | 9 | 1.0 |
| Forbidden words | 10 (4 typed) | 24 | 1 | 2 + re-check setup | 23 | 1.5 |
| Mind match | 2 | 1 | 1 | 2 | 22 | 2.1 |
| Circa | 10 (4 typed) | 12 | 1 | 2 + re-check setup | 19 | 1.4 |

Setup height on the smallest phone (iPhone SE, Italian): Impostor 4.6, Bomb 4.2, Mind match 3.0, Who's the Liar 2.4,
Forbidden words 2.1, Truth or dare 1.9, Circa 1.9.

"Re-check setup" matters because options and pack choices are lost on relaunch (finding H4), so the group has to scroll
the whole setup again to restore them. Decisions on first play: every setup control is a decision the group can make
before the first card, from 9 (10/10) to 42 (Impostor).

## Findings

### High

**H1. No way out of most in-game screens.**
Evidence: screens without any exit control (iPhone 15, both languages): Impostor 10 of 11, Who's the Liar 10 of 11,
Circa 6 of 7, Forbidden words 3 of 5 (turn, turn summary, final score button), Bomb 1 of 3 (fuse running), Truth or dare 1 of 2
(the dare card). Pass-the-phone, discussion timer and vote screens have neither a back arrow nor an end button.
`evidence/before/pass-no-exit-i15-en.jpg`, `discussion-no-exit-i15-en.jpg`, `forbidden-turn-no-exit-se-it.jpg`,
`bomb-running-no-exit-se-it.jpg`, `tod-card-no-exit-se-it.jpg`.
In the installed iOS app there is no browser back button, so the group is stuck until the round ends.
Fix: one exit control in the same place on every in-game screen (top left ✕). It leaves at once when nothing would be lost,
and opens a pause menu (Keep playing, Change setup, Home) when a round is under way. Timers pause while the menu is open.

**H2. Back gesture or browser back throws the round away, and forward re-deals it.**
Evidence: back from the middle of a round lands on setup in all 10 games with no confirm; forward again never restores
the screen (a new round with new secret roles starts). Reload does the same.
Fix: intercept back while a round is under way and open the same pause menu instead (react-router `useBlocker`, which needs
the data router). Only a game started from setup or the home card is playable, so a reload or forward lands on setup
instead of a silently re-dealt round.

**H3. Setup screens are long and mix rare options with the essentials.**
Evidence: table above; `evidence/before/setup-impostor-se-it.jpg`, `setup-impostor-i15-en.jpg`, `setup-forbidden-se-it.jpg`.
Impostor shows the full player editor, impostor count, the whole pack list with a language chip and a four-way spice control,
clue mode, timer and two toggles (42 controls). The Start button is always reachable (sticky footer), but a group that wants
to check one thing has to scroll 3-4.6 screens.
Fix: shared setup layout: players as one compact row once there are enough (editor on tap), packs as one summary row
("Mix of all 14 packs" + Change), the one or two options that change the game, everything else folded under "More options".

**H4. The app forgets what the group chose.**
Evidence: after a relaunch, every per-game option the probe changed was back to its default (discussion timer 5 → 3 min,
toggles, category mode) and the pack choice was reset in 9 of 10 games (`memory` section of the summary and
`runs/before/*/memory-*.json`; the 3 "kept" games are the ones where the probe's last control was the global spice limit,
which lives in settings). Game options live in memory-only stores; only players and settings are saved.
Fix: persist each game's options and pack choice (validated with zod on load, so an old or broken value falls back to the default).
Store "default mix" as its own value (`packIds: null`) so new packs and language changes keep flowing into it.

**H5. Timers keep running when the phone is locked or the app is backgrounded.**
Evidence: backgrounding for 60 s during a Forbidden words turn returns to "Time's up!" with the turn lost; during a bomb
fuse the bomb explodes in the background (and 3 tick sounds are scheduled while hidden). Discussion timers keep counting.
Fix: every running timer registers with the game session; when the app is hidden the pause menu opens and timers, fuse and
turn stop. Coming back shows "Paused" with Keep playing as the primary action.

### Medium

**M1. Repeat play has no shortcut.** Two taps (tile, Start) plus checking setup because of H4. Fix: a "Play again" card at the
top of home for the last game, with players and packs summarised, that starts the game in one tap when setup is complete
(and opens setup when something is missing).

**M2. The pack picker is a flat inline list with filters but no shortcuts.** Up to 15 packs inline in setup, a language chip,
a four-way spice control, "+ New pack" at the top. No search, no recents, no favourites, no "mix everything" or "surprise me".
The default "all selected" is silently frozen into a fixed list the first time setup is opened, so packs added later are not
included. Note: the folder > section > pack hierarchy described in `docs/TAXONOMY.md` is not in the data or the code yet
(packs carry no `group`/`section`), so the picker has one level today.
Fix: a dedicated picker screen one level deep: search field first, Mix everything and Surprise me buttons, filter chips
(All, Recent, Starred, All languages, Spice), multi-select rows with a star, a clear count in the footer ("Use 5 packs" or
"Use the mix · 14"), "+ New pack" at the end and the new pack auto-selected on return.

**M3. Home is long and generic.** Ten tiles with three-line descriptions and emoji make home about three screens tall on
an SE (`evidence/before/home-se-it.jpg`); players, packs and settings sit at the bottom. Fix (phase 3): compact tiles with
original game badges, the play-again card on top, a mascot header.

**M4. The default spice limit hides packs without saying so.** The picker defaults to "Cheeky" (spice ≤ 1), so the Spicy packs
never appear unless someone changes a control whose meaning is not explained in setup. Fix: show the limit as a labelled chip
("Spice: Cheeky") in the picker so it is visible where packs are chosen; keep the default (decision recorded).

**M5. Keyboard over the footer on number entry (code review).** Circa uses `inputMode="decimal"`; the iOS decimal keypad has no
return key, so the "Hide and pass on" button can sit under the keypad on an SE until the player taps elsewhere. Fix deferred
(see Deferred): tapping outside closes the keypad today; a visible Done control would need a design that keeps secrets private.

### Low

**L1. Small text:** the EN/IT language badge in the pack list is 12 px; the "Category" label on the impostor card is 12 px.
Fix: put the language inside the 14 px meta line; raise labels to 13 px or more.

**L2. Clipped pack title on SE:** "Forbidden words: Food and fun" is truncated in the pack row on a 375 px screen.
Fix: the new picker keeps titles to one line with ellipsis by design, but the full title shows in setup's pack summary.

**L3. Ties in the session scoreboard get different rank numbers** (1, 2, 3 for equal scores). Fix: rank by score.

**L4. Bomb on small screens:** the holder's name sits below the bomb and close to the big Pass button on an SE.
Fix: put "X has the bomb" above the bomb and scale the bomb with the screen height.

**L5. Comprehension notes** from reading every screen as a first-time player:
- The discussion timer screen shows only "Discuss 3:00"; who starts was on the previous screen. Acceptable, keep.
- The vote help ("Point at who you suspect, then tap each player once per vote they got") is long but correct. Keep.
- "Impostor clue: None / Category / Hint / Both" needs its help line; it stays, but moves under More options.
- Renaming a player to an existing name silently reverts. Deferred (low).

**L6. First load:** one 514 KB JS chunk (150 KB gzip), FCP about 150-200 ms on desktop WebKit, 3.1 s to a usable home in
Chromium throttled to a slow phone on 4G. Offline reload and a full Impostor start work on all 8 device/language pairs
(service worker precaches 75 entries, 664 KB). Fix deferred: split game screens into lazy chunks.

### Checked and fine

- Monkey: 40 runs x 120 random actions, no crashes, no console or page errors, no blank screens, no NaN/undefined/negative scores.
- Overflow: no horizontal overflow on any screen, any size, either language, portrait or landscape.
- Tap targets: nothing under 44 px. Contrast: no text under WCAG AA on its background.
- Italian strings: no clipping beyond L2; longer labels wrap inside buttons cleanly.
- Wake lock: released when leaving a game (the fake API counted 0 locks at home in every run).
- Sounds: nothing plays after leaving a game.
- Safe area (code review): header uses `pt-safe`, footer `pb-safe`, gutters `px-safe`; `viewport-fit=cover` is set.
- Landscape: layouts hold; secret screens stay readable (`evidence/before/landscape-secret-se-it.jpg`).

## Proposed order

1. H1 + H2 + H5: exit control, pause menu, back interception, timer pause (one shared mechanism in the engine).
2. H3 + H4 + M1: shared compact setup, remembered options, home play-again card.
3. M2 + M4: new picker.
4. L1, L3, L4 with the above; M3 in the visual phase.

## After phase 2 (flow, picker, exit)

Same harness, same devices and languages (`docs/audit/summary-phase2.md`, `results-phase2.json`,
screenshots in `docs/audit/evidence/phase2/`).

### Tap counts, before → after

WebKit, iPhone 15, English (other sizes and Italian give the same taps). "Repeat" is after a relaunch with the same players.

| Game | First play to first card | Repeat via game tile | Repeat via home card | Setup controls | Setup height (SE, Italian) |
|---|---|---|---|---|---|
| Impostor | 10 → 10 | 2 → 2 | – → **1** | 42 → **10** | 4.6 → **1.1** |
| Who's the Liar | 10 → 10 | 2 → 2 | – → **1** | 27 → **6** | 2.4 → **1.0** |
| Who's got the bomb | 10 → 10 | 2 → 2 | – → **1** | 36 → **7** | 4.2 → **1.0** |
| Never have I ever | 2 → 2 | 2 → 2 | – → **1** | 10 → **3** | 1.1 → **1.0** |
| Truth or dare | 10 → 10 | 2 → 2 | – → **1** | 19 → **4** | 1.9 → **1.0** |
| Most likely to | 2 → 2 | 2 → 2 | – → **1** | 9 → **2** | 1.1 → **1.0** |
| 10/10 but... | 2 → 2 | 2 → 2 | – → **1** | 9 → **2** | 1.1 → **1.0** |
| Forbidden words | 10 → 10 | 2 → 2 | – → **1** | 23 → **7** | 2.1 → **1.0** |
| Mind match | 2 → 2 | 2 → 2 | – → **1** | 22 → **3** | 3.0 → **1.0** |
| Circa | 10 → 10 | 2 → 2 | – → **1** | 19 → **4** | 1.9 → **1.0** |

First play stays at 10 taps where 4 names have to be typed (2 taps per name, open, Start): the names are the floor.
Round taps are unchanged (game rules untouched). Play again from a result is still 1 tap.

Pack selection (Impostor, 14-15 packs):

| Task | Before | After |
|---|---|---|
| Play with exactly one pack | 14-15 taps (untick every other pack) | **5** (Change, Clear, the pack, Use, Start) |
| Back to every pack | 14-15 taps | **4** (Change, Mix everything, Use, Start) |
| Remembered after relaunch | no (9 of 10 games reset) | **yes** (10 of 10 games, options and packs) |

### Exits and interruptions, before → after

| Check | Before | After |
|---|---|---|
| In-game screens with no way out | Impostor 10/11, Liar 10/11, Circa 6/7, Forbidden 3/5, Bomb 1/3, ToD 1/2 | **0 in every game** |
| Back gesture mid-round | drops to setup, round lost, no confirm | **opens the pause menu**, round kept |
| Forward after back | re-deals a new round | n/a (back no longer leaves) |
| Reload / app killed mid-round | setup, options lost | setup, **options kept**, no half round in storage |
| 60 s in background during a turn / fuse | turn lost ("Time's up!") / bomb exploded, 3 ticks while hidden | **paused**: 1:00 → 1:00, fuse stopped, 0 sounds |
| Wake locks after leaving | 0 | 0 |
| Sounds after leaving | 0 | 0 |
| Layout issues (all screens, 8 device/language pairs) | 9 small-text, 1 clipped | **0** (the new "other screens" check also found and fixed an overflow in the pack library and the pack editor filters) |
| Monkey (40 runs) | clean | clean (one expected negative Forbidden words score, now whitelisted) |

### First load

Initial JS + CSS 514 KB → 537 KB raw, 155 KB → 164 KB gzip: mostly the data router needed for back-gesture interception.
Game screens now load as their own chunks (precached), which keeps the main chunk at 269 KB; the rest is a shared vendor chunk.
Throttled Chromium (4x CPU, 1.6 Mbps): about 3.1 s to a usable home before and after. Offline start still works on all 8 pairs.

### Finding status

| Finding | Status |
|---|---|
| H1 No way out | Fixed: ✕ on every in-game screen, pause menu when a round would be lost |
| H2 Back throws the round away | Fixed: back opens the pause menu; reload/forward land on setup |
| H3 Long setup | Fixed: shared compact setup, rare options under More options |
| H4 Choices forgotten | Fixed: options and packs saved per game, validated on load |
| H5 Timers run in background | Fixed: timers, fuse and turns pause with the menu, which opens on background |
| M1 No repeat shortcut | Fixed: home "Play again" card, 1 tap |
| M2 Picker | Fixed: picker screen with search, Mix everything, Surprise me, Clear, Recent, Starred, language and spice chips |
| M3 Long generic home | Phase 3 (visual identity) |
| M4 Hidden spice limit | Fixed: spice shown as a labelled chip in the picker |
| M5 Number keypad over the footer | Deferred |
| L1 Small text | Fixed |
| L2 Clipped pack title | Fixed: titles wrap in the picker and the library; the setup summary ellipsis is intentional |
| L3 Score ties | Fixed: equal scores share a rank |
| L4 Bomb on small screens | Fixed: holder above the bomb, bomb scales with screen height |
| L5 Comprehension notes | Kept as noted; rename-to-duplicate message deferred |
| L6 First load | Partly: game screens split; vendor chunk unchanged (deferred) |

### Deferred

- M5: a Done control for the iOS number keypad in Circa (tapping outside closes it today).
- Renaming a player to a name already taken silently reverts; show the duplicate message on blur.
- Splitting the shared vendor chunk (React, router, zod) further; first load is already offline-cached after the first visit.
- Folder and section chips in the picker once packs carry `group`/`section` (TAXONOMY.md).
- Backups (Settings > Export) do not include remembered options, recents or starred packs yet.

## Final regression (after phase 3 and 4)

Full harness on the final build, all 3 iPhone sizes in WebKit plus Chromium, English and Italian
(`docs/audit/summary-after.md`, `results-after.json`, screenshots in `docs/audit/evidence/after/`): 304 checks passed.

- **Tap counts:** unchanged from phase 2 on every device and language (table above). Repeat play is 1 tap from the home card,
  setups fit one screen (Impostor 1.1 screens on an SE in Italian), one pack is 5 taps, everything again is 4.
- **Exits:** every in-game screen of every game has the ✕; back opens the pause menu in all 10 games; reload lands on setup
  with options kept; backgrounding keeps turns and fuses paused; 0 wake locks and 0 sounds after leaving.
- **Layout:** 0 issues on all 8 device/language pairs, including every setup, "More options", picker, the pack library,
  pack editor, import, players and settings.
- **Monkey:** 40 runs x 120 random actions, clean.
- **Remembered choices:** options and packs kept after relaunch in 10 of 10 games.
- **Offline:** reload offline and a full Impostor start work on all 8 pairs.
- **First load:** the inline splash paints at once (WebKit first paint about 20 ms instead of about 150 ms, before the JS runs).
  Initial JS + CSS 550 KB raw, 171 KB gzip (before: 514 KB, 155 KB). Throttled Chromium (4x CPU, 1.6 Mbps): about 3.1-3.6 s
  to a usable home, the same range as before. Offline precache 664 KiB (75 entries) before → 783 KiB (105 entries) after.

### Size of the visual identity

| | Before phase 3 | After phase 3 |
|---|---|---|
| Initial JS + CSS (gzip) | 164 KB | 171 KB |
| App icons in the precache | 4.9 KB (192 + touch icon) | 30 KB (192 + touch icon) |
| 512 px install icons | precached (14 KB) | not precached (84 KB, fetched only on install) |
| Offline precache | 750 KiB | 783 KiB |

All art is SVG/CSS/canvas in code; the only binaries are the generated icons.

### Still deferred

Same list as after phase 2 (M5 number keypad Done control, duplicate-name message on rename, vendor chunk, TAXONOMY folders,
backups of remembered options), plus: the harness cannot drive a real iPhone, so keyboard overlap, safe-area insets on
notched phones and the standalone back swipe were checked in code and need the on-device checklist.
