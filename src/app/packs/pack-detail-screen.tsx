import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { removeCustomPack, useContentStore } from "../../content/content-store";
import { errorMessage, logError } from "../../engine/logger";
import { Button, Notice, Screen, Section } from "../../engine/ui";
import { findGame } from "../../games/registry";
import { spiceKey } from "../../i18n/labels";
import { useT } from "../../i18n/use-t";
import { exportPacks } from "./pack-export";
import { PackItemsPreview } from "./pack-items-preview";

export function PackDetailScreen() {
  const t = useT();
  const navigate = useNavigate();
  const { packId } = useParams();
  const pack = useContentStore((state) => state.packs.find((p) => p.id === packId));
  const [error, setError] = useState("");

  if (!pack) {
    return (
      <Screen title={t("packs.title")} backTo="/packs">
        <Notice>{t("pack.notFound")}</Notice>
      </Screen>
    );
  }

  const gameNames = pack.games.map((id) => {
    const game = findGame(id);
    return game ? t(game.nameKey) : id;
  });

  const exportThis = async () => {
    try {
      await exportPacks([pack], pack.id, false);
    } catch (exportError) {
      logError("Exporting pack", exportError);
      setError(t("packs.exportError", { reason: errorMessage(exportError) }));
    }
  };

  const deleteThis = async () => {
    if (!window.confirm(t("pack.deleteConfirm", { title: pack.title }))) return;
    try {
      await removeCustomPack(pack.id);
      navigate("/packs", { replace: true });
    } catch (deleteError) {
      logError("Deleting pack", deleteError);
      setError(t("pack.deleteError", { reason: errorMessage(deleteError) }));
    }
  };

  return (
    <Screen title={pack.title} backTo="/packs">
      <p className="text-muted">
        {t(`kind.${pack.kind}`)} · {t("picker.items", { count: pack.items.length })} · {t(spiceKey(pack.spice))} ·{" "}
        {t(`language.${pack.language}`)} · {t(`source.${pack.source}`)}
      </p>
      <p className="mt-1 text-sm text-muted">
        {t("pack.games")}: {gameNames.join(", ")}
      </p>
      {error && (
        <div className="mt-3">
          <Notice tone="error">❌ {error}</Notice>
        </div>
      )}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {pack.source === "custom" ? (
          <Button onClick={() => navigate(`/packs/${pack.id}/edit`)}>{t("pack.edit")}</Button>
        ) : (
          <Button onClick={() => navigate(`/packs/new?from=${encodeURIComponent(pack.id)}`)}>{t("pack.duplicate")}</Button>
        )}
        <Button variant="secondary" onClick={exportThis}>
          {t("pack.export")}
        </Button>
      </div>
      {pack.source === "custom" && (
        <Button variant="ghost" className="mt-2 text-danger" onClick={deleteThis}>
          {t("pack.delete")}
        </Button>
      )}
      <Section title={t("pack.items")}>
        <PackItemsPreview pack={pack} />
      </Section>
    </Screen>
  );
}
