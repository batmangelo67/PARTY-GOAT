import { useState, type FormEvent } from "react";
import { MAX_PLAYER_NAME_LENGTH, MAX_PLAYERS, MIN_PLAYERS } from "../app/constants";
import { useT } from "../i18n/use-t";
import type { MessageKey } from "../i18n/en";
import { checkPlayerName, type PlayerNameProblem } from "./players";
import { usePlayersStore } from "./players-store";
import { Notice } from "./ui";

const PROBLEM_KEYS: Record<Exclude<PlayerNameProblem, "empty">, MessageKey> = {
  duplicate: "players.duplicate",
  full: "players.full",
};

function PlayerRow({ id, name, index }: { id: string; name: string; index: number }) {
  const t = useT();
  const { players, renamePlayer, removePlayer } = usePlayersStore();
  const [draft, setDraft] = useState(name);
  const commit = () => {
    if (checkPlayerName(players, draft, id)) setDraft(name);
    else renamePlayer(id, draft);
  };

  return (
    <li className="flex items-center gap-2 rounded-2xl bg-panel pl-4">
      <input
        aria-label={t("players.nameLabel", { index: index + 1 })}
        value={draft}
        maxLength={MAX_PLAYER_NAME_LENGTH}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        className="min-h-tap min-w-0 flex-1 bg-transparent font-bold outline-none"
      />
      <button
        type="button"
        aria-label={t("players.remove", { name })}
        onClick={() => removePlayer(id)}
        className="h-tap w-tap shrink-0 rounded-2xl text-2xl text-muted active:bg-raised"
      >
        ×
      </button>
    </li>
  );
}

export function PlayerEditor() {
  const t = useT();
  const { players, addPlayer } = usePlayersStore();
  const [name, setName] = useState("");
  const problem = name ? checkPlayerName(players, name) : players.length >= MAX_PLAYERS ? "full" : null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (checkPlayerName(players, name)) return;
    addPlayer(name);
    setName("");
  };

  return (
    <div className="flex flex-col gap-2">
      {players.length === 0 && <Notice>{t("players.empty")}</Notice>}
      <ul className="flex flex-col gap-2">
        {players.map((player, index) => (
          <PlayerRow key={player.id} id={player.id} name={player.name} index={index} />
        ))}
      </ul>
      <form onSubmit={submit} className="flex gap-2">
        <input
          value={name}
          maxLength={MAX_PLAYER_NAME_LENGTH}
          placeholder={t("players.addPlaceholder")}
          aria-label={t("players.addPlaceholder")}
          enterKeyHint="done"
          autoCapitalize="words"
          autoComplete="off"
          onChange={(e) => setName(e.target.value)}
          className="min-h-tap min-w-0 flex-1 rounded-2xl border-2 border-line bg-ink px-4 font-bold outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={problem !== null || !name.trim()}
          className="min-h-tap rounded-2xl bg-accent px-5 font-extrabold text-accent-ink disabled:opacity-40"
        >
          {t("players.add")}
        </button>
      </form>
      {problem && problem !== "empty" && <Notice tone="error">{t(PROBLEM_KEYS[problem], { max: MAX_PLAYERS })}</Notice>}
      <p className="text-sm text-muted">
        {t("players.count", { count: players.length, max: MAX_PLAYERS })}
        {players.length < MIN_PLAYERS && ` · ${t("players.needMore", { min: MIN_PLAYERS })}`}
      </p>
    </div>
  );
}
