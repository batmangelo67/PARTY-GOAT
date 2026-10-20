export type VoteCounts = Record<string, number>;

export type VoteOutcome =
  | { kind: "none" }
  | { kind: "winner"; playerId: string }
  | { kind: "tie"; playerIds: string[] };

export function tallyVotes(counts: VoteCounts): VoteOutcome {
  const top = Math.max(0, ...Object.values(counts));
  if (top === 0) return { kind: "none" };
  const leaders = Object.keys(counts).filter((id) => counts[id] === top);
  return leaders.length === 1 ? { kind: "winner", playerId: leaders[0]! } : { kind: "tie", playerIds: leaders };
}
