import { Component, type ErrorInfo, type ReactNode } from "react";
import { errorMessage, logError } from "../engine/logger";
import { translate } from "../i18n/use-t";
import { useSettingsStore } from "./settings-store";

interface State {
  error: unknown;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    logError(`Screen crashed${info.componentStack ? ` in ${info.componentStack.split("\n")[1]?.trim()}` : ""}`, error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    const language = useSettingsStore.getState().language;
    return (
      <div className="pt-safe px-safe flex h-[100dvh] flex-col items-center justify-center gap-6 text-center">
        <p className="text-lg text-danger">❌ {translate(language, "error.crash", { message: errorMessage(this.state.error) })}</p>
        <button
          type="button"
          className="min-h-tap rounded-2xl bg-accent px-6 font-extrabold text-accent-ink"
          onClick={() => {
            this.setState({ error: null });
            window.location.hash = "#/";
          }}
        >
          {translate(language, "common.home")}
        </button>
      </div>
    );
  }
}
