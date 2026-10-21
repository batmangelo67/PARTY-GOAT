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
