import { waitForScreen, type Session } from "./driver";

// Starts a game from its setup screen. Kept separate so the harness follows the app's start flow.
export async function startFromSetup(session: Session): Promise<void> {
  await session.tapText("setup.start");
  await waitForScreen(session.page).catch(() => undefined);
}
