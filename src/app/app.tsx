import { useEffect } from "react";
import { createHashRouter, Navigate, Outlet, RouterProvider } from "react-router";
import { ErrorBoundary } from "./error-boundary";
import { GamePlayRoute, GameSetupRoute } from "./game-routes";
import { HomeScreen } from "./home-screen";
import { PackBrowserScreen } from "./packs/pack-browser-screen";
import { PackDetailScreen } from "./packs/pack-detail-screen";
import { PackEditorScreen } from "./packs/pack-editor-screen";
import { PackImportScreen } from "./packs/pack-import-screen";
import { PackPickerScreen } from "./packs/pack-picker-screen";
import { PlayersScreen } from "./players-screen";
import { SettingsScreen } from "./settings-screen";
import { useSettingsStore } from "./settings-store";
import { StatusBanner } from "./status-banner";
import { applyAppearance } from "./themes";

function RootLayout() {
  return (
    <>
      <StatusBanner />
      <Outlet />
    </>
  );
}

// A data router so in-game screens can intercept the system back gesture (useBlocker).
const router = createHashRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <HomeScreen /> },
      { path: "/players", element: <PlayersScreen /> },
      { path: "/settings", element: <SettingsScreen /> },
      { path: "/packs", element: <PackBrowserScreen /> },
      { path: "/packs/new", element: <PackEditorScreen /> },
      { path: "/packs/import", element: <PackImportScreen /> },
      { path: "/packs/:packId", element: <PackDetailScreen /> },
      { path: "/packs/:packId/edit", element: <PackEditorScreen /> },
      { path: "/play/:gameId/setup", element: <GameSetupRoute /> },
      { path: "/play/:gameId/packs", element: <PackPickerScreen /> },
      { path: "/play/:gameId", element: <GamePlayRoute /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

export function App() {
  const language = useSettingsStore((state) => state.language);
  const theme = useSettingsStore((state) => state.theme);
  const animations = useSettingsStore((state) => state.animations);
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  useEffect(() => applyAppearance(theme, animations), [theme, animations]);

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
