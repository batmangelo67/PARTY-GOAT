import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/app";
import { bootstrap } from "./app/bootstrap";
import { logError } from "./engine/logger";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("❌ App failed to start — #root element missing from index.html — restore index.html.");

function render() {
  createRoot(rootElement!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

bootstrap()
  .catch((error: unknown) => logError("Starting up — saved data could not be loaded, using defaults", error))
  .finally(render);
