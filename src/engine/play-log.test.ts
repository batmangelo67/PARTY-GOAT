import { describe, expect, it } from "vitest";
import { EMPTY_PLAY_LOG, MAX_RECENT_GAMES, MAX_RECENT_PACKS, recordPlay, toggleFavorite } from "./play-log";

describe("play log", () => {
  it("puts the last started game first without duplicates", () => {
    const log = recordPlay(recordPlay(recordPlay(EMPTY_PLAY_LOG, "bomb", []), "impostor", []), "bomb", []);
    expect(log.games).toEqual(["bomb", "impostor"]);
  });

  it("keeps recent packs per game, most recent first, capped", () => {
    let log = recordPlay(EMPTY_PLAY_LOG, "impostor", ["a", "b"]);
    log = recordPlay(log, "impostor", ["c", "a"]);
    expect(log.packs.impostor).toEqual(["c", "a", "b"]);
    const many = Array.from({ length: MAX_RECENT_PACKS + 5 }, (_, i) => `p${i}`);
    expect(recordPlay(log, "impostor", many).packs.impostor).toHaveLength(MAX_RECENT_PACKS);
  });

  it("caps the number of recent games", () => {
    let log = EMPTY_PLAY_LOG;
    for (let i = 0; i < MAX_RECENT_GAMES + 3; i += 1) log = recordPlay(log, `g${i}`, []);
    expect(log.games).toHaveLength(MAX_RECENT_GAMES);
    expect(log.games[0]).toBe(`g${MAX_RECENT_GAMES + 2}`);
  });

  it("toggles a starred pack", () => {
    expect(toggleFavorite(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleFavorite(["a", "b"], "a")).toEqual(["b"]);
  });
});
