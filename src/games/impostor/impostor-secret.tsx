import type { Player } from "../../engine/players";
import { useT } from "../../i18n/use-t";
import type { ImpostorRound } from "./logic";

interface ImpostorSecretProps {
  player: Player;
  players: readonly Player[];
  round: ImpostorRound;
  knowEachOther: boolean;
}

function ClueLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="w-full rounded-2xl bg-ink px-4 py-3">
      <p className="text-sm font-bold uppercase tracking-widest text-muted">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}

export function ImpostorSecret({ player, players, round, knowEachOther }: ImpostorSecretProps) {
  const t = useT();
  if (!round.impostorIds.has(player.id)) {
    return (
      <>
        <p className="text-lg text-muted">{t("impostor.secret.word")}</p>
        <p className="mt-2 break-words text-5xl font-black tracking-tight text-accent">{round.word}</p>
      </>
    );
  }

  const partners = players.filter((p) => p.id !== player.id && round.impostorIds.has(p.id)).map((p) => p.name);
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <p className="text-4xl font-black tracking-tight text-danger">{t("impostor.secret.youAre")}</p>
      <p className="text-muted">{t("impostor.secret.blend")}</p>
      {round.clues.category && <ClueLine label={t("impostor.secret.category")} value={round.clues.category} />}
      {round.clues.hint && <ClueLine label={t("impostor.secret.hint")} value={round.clues.hint} />}
      {knowEachOther && partners.length > 0 && (
        <p className="font-bold text-info">{t("impostor.secret.partners", { names: partners.join(", ") })}</p>
      )}
    </div>
  );
}
