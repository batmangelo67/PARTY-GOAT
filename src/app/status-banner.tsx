import { useState } from "react";
import { useContentStore } from "../content/content-store";
import { useT } from "../i18n/use-t";
import { useStorageStatus } from "../storage/status-store";

export function StatusBanner() {
  const t = useT();
  const storageFailed = useStorageStatus((state) => state.failed);
  const packErrors = useContentStore((state) => state.errors.length);
  const [dismissed, setDismissed] = useState(false);
  const messages = [
    ...(storageFailed ? [t("error.storage")] : []),
    ...(packErrors > 0 ? [t("error.packs", { count: packErrors })] : []),
  ];
  if (dismissed || messages.length === 0) return null;

  return (
    <button
      type="button"
      role="alert"
      onClick={() => setDismissed(true)}
      className="pt-safe px-safe fixed inset-x-0 top-0 z-50 bg-danger pb-3 text-left text-sm font-semibold text-ink"
    >
      {messages.map((message) => (
        <span key={message} className="block">
          ❌ {message}
        </span>
      ))}
    </button>
  );
}
