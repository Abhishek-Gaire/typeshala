import { Button } from "./components/Button";
import { KeyHint } from "./components/KeyHint";
import { LayoutShell } from "./components/LayoutShell";
import { PromptDisplay } from "./components/PromptDisplay";
import { ResultCard } from "./components/ResultCard";
import { StateView } from "./components/StateView";
import { useUiSettings } from "./hooks/useUiSettings";

/** Base shell proving tokens, themes, and both languages. */
export default function App() {
  const ui = useUiSettings();

  if (!ui.loaded) {
    return (
      <LayoutShell text={ui.text}>
        <StateView kind="loading" text={ui.text} />
      </LayoutShell>
    );
  }

  return (
    <LayoutShell text={ui.text}>
      {ui.notice && (
        <p role="status" className="mb-4 text-sm">
          {ui.notice}
        </p>
      )}
      <PromptDisplay text="The quick brown fox jumps over the lazy dog" size={ui.promptSize} />
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <KeyHint nextKey="T" />
        <Button
          onClick={() => {
            ui.setTheme(ui.theme === "dark" ? "light" : "dark");
          }}
        >
          {ui.text(ui.theme === "dark" ? "theme.light" : "theme.dark")}
        </Button>
        <Button
          variant="quiet"
          onClick={() => {
            ui.setLocale(ui.locale === "en" ? "ne" : "en");
          }}
        >
          {ui.locale === "en" ? "नेपाली" : "English"}
        </Button>
        <Button
          variant="quiet"
          onClick={() => {
            ui.setPromptSize(ui.promptSize === "large" ? "standard" : "large");
          }}
        >
          {ui.text("settings.promptSize")}
        </Button>
      </div>
      <div className="mt-8">
        <ResultCard wpm={0} accuracy={100} />
      </div>
    </LayoutShell>
  );
}
