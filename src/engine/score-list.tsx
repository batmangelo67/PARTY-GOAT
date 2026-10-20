import type { ReactNode } from "react";

export interface ScoreRow {
  id: string;
  name: string;
  rank: number;
  value: ReactNode;
  gained?: ReactNode;
  dimmed?: boolean;
}

export function ScoreList({ rows }: { rows: readonly ScoreRow[] }) {
  return (
    <ol className="flex flex-col gap-1">
      {rows.map((row) => (
        <li key={row.id} className={`flex min-h-12 items-center gap-3 rounded-xl bg-panel px-4 ${row.dimmed ? "opacity-50" : ""}`}>
          <span className="w-5 text-sm font-bold tabular-nums text-muted">{row.rank}</span>
          <span className="flex-1 truncate font-bold">{row.name}</span>
          {row.gained && <span className="pop-in font-black text-accent">{row.gained}</span>}
          <span className="text-right tabular-nums text-muted">{row.value}</span>
        </li>
      ))}
    </ol>
  );
}
