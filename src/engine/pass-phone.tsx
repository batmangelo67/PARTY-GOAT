import { useState, type ReactNode } from "react";
import { useT } from "../i18n/use-t";
import type { Player } from "./players";
import { playCue } from "./sound";
import { BigCard, Button, Screen } from "./ui";

interface PassPhoneProps {
  players: readonly Player[];
  renderSecret: (player: Player, index: number) => ReactNode;
  canHide?: (player: Player) => boolean;
  onDone: () => void;
}

// Pass-the-phone privacy: secrets only render after the named player taps to reveal.
export function PassPhone({ players, renderSecret, canHide, onDone }: PassPhoneProps) {
  const t = useT();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const player = players[index];
  if (!player) return null;
  const isLast = index === players.length - 1;
  const progress = <p className="text-center text-sm text-muted">{t("pass.progress", { current: index + 1, total: players.length })}</p>;

  const reveal = () => {
    playCue("reveal");
    setRevealed(true);
  };
  const hide = () => {
    setRevealed(false);
    if (isLast) onDone();
    else setIndex(index + 1);
  };

  if (!revealed) {
    return (
      <Screen footer={<Button onClick={reveal}>{t("pass.reveal", { name: player.name })}</Button>}>
        <div key={player.id} className="pop-in flex h-full flex-col items-center justify-center gap-3 text-center">
          {progress}
          <p className="text-xl text-muted">{t("pass.passTo")}</p>
          <p className="break-all text-6xl font-black tracking-tight text-accent">{player.name}</p>
          <p className="mt-4 text-muted">{t("pass.onlyYou", { name: player.name })}</p>
        </div>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <Button variant="secondary" disabled={canHide ? !canHide(player) : false} onClick={hide}>
          {isLast ? t("pass.hideLast") : t("pass.hide")}
        </Button>
      }
    >
      <div className="flex min-h-full flex-col justify-center gap-4 py-6">
        {progress}
        <BigCard>{renderSecret(player, index)}</BigCard>
      </div>
    </Screen>
  );
}
