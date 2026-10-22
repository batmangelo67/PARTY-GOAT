import type { MessageKey } from "../../../src/i18n/en";

export interface AuditGame {
  id: string;
  // "round": a self-contained round with a result screen.
  // "cards": an endless deck; a round is a few cards then the End button.
  shape: "round" | "cards";
  endKey?: MessageKey;
  cards?: number;
}

export const AUDIT_GAMES: readonly AuditGame[] = [
  { id: "impostor", shape: "round" },
  { id: "whos-the-liar", shape: "round" },
  { id: "bomb", shape: "round" },
  { id: "never-have-i-ever", shape: "cards", endKey: "nhie.play.end", cards: 3 },
  { id: "truth-or-dare", shape: "cards", endKey: "tod.play.end", cards: 6 },
  { id: "most-likely-to", shape: "cards", endKey: "mlt.play.end", cards: 3 },
  { id: "ten-out-of-ten", shape: "cards", endKey: "ten.play.end", cards: 3 },
  { id: "forbidden-words", shape: "round" },
  { id: "mind-match", shape: "round" },
  { id: "circa", shape: "round" },
];
