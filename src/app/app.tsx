import { useEffect } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router";
import { ErrorBoundary } from "./error-boundary";
import { GamePlayRoute, GameSetupRoute } from "./game-routes";
import { HomeScreen } from "./home-screen";
import { PackBrowserScreen } from "./packs/pack-browser-screen";
import { PackDetailScreen } from "./packs/pack-detail-screen";
import { PackEditorScreen } from "./packs/pack-editor-screen";
import { PackImportScreen } from "./packs/pack-import-screen";
import { PlayersScreen } from "./players-screen";
import { SettingsScreen } from "./settings-screen";
import { useSettingsStore } from "./settings-store";
import { StatusBanner } from "./status-banner";

export function App() {
  const language = useSettingsStore((state) => state.language);
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <ErrorBoundary>
      <HashRouter>
        <StatusBanner />
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/players" element={<PlayersScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="/packs" element={<PackBrowserScreen />} />
          <Route path="/packs/new" element={<PackEditorScreen />} />
          <Route path="/packs/import" element={<PackImportScreen />} />
          <Route path="/packs/:packId" element={<PackDetailScreen />} />
          <Route path="/packs/:packId/edit" element={<PackEditorScreen />} />
          <Route path="/play/:gameId/setup" element={<GameSetupRoute />} />
          <Route path="/play/:gameId" element={<GamePlayRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </ErrorBoundary>
  );
}
