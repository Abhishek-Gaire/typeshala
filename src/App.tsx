/** Classic practice app. Only the classic shell ships (spec 0012). */
import { useCallback, useEffect, useState } from "react";
import { LayoutShell } from "./components/LayoutShell";
import { StateView } from "./components/StateView";
import { Button } from "./components/Button";
import { useUiSettings } from "./hooks/useUiSettings";
import { SettingsView } from "./features/settings/SettingsView";
import { GameView } from "./features/game/GameView";
import { ClassicShell } from "./components/ClassicShell";
import { ClassicScreen } from "./features/classic/ClassicScreen";
import type { ClassicScreenId } from "./domain/classicLayout";
import { isStringKey } from "./i18n/keys";
import { loadLessons, saveResult } from "./infrastructure/tauriApi";
import type { NewAttempt } from "./domain/datastore";

type View = { name: "classic" } | { name: "settings" };

export default function App() {
  const ui = useUiSettings();
  const [view, setView] = useState<View>({ name: "classic" });
  const [reloadKey, setReloadKey] = useState(0);
  const [gamePrompts, setGamePrompts] = useState<string[]>([]);
  const [gameLoading, setGameLoading] = useState(false);
  const [classicScreen, setClassicScreen] = useState<ClassicScreenId>("home");
  const [classicLevel, setClassicLevel] = useState(1);
  const [classicName, setClassicName] = useState("");
  const [classicWpm, setClassicWpm] = useState(0);
  const [restartKey, setRestartKey] = useState(0);

  const layout = ui.layout;

  const loadGame = useCallback(async () => {
    setGameLoading(true);
    try {
      const items = await loadLessons();
      setGamePrompts(
        items.filter((l) => l.layout === "qwerty" || l.layout === "romanized").map((l) => l.prompt),
      );
    } catch {
      setGamePrompts([]);
    } finally {
      setGameLoading(false);
    }
  }, []);

  useEffect(() => {
    if (classicScreen !== "game") return;
    void loadGame();
  }, [classicScreen, loadGame, reloadKey]);

  async function handleDone(attempt: NewAttempt) {
    try {
      await saveResult(attempt);
    } catch {
      // Result screen removed: stay in practice on save failure.
    }
  }

  if (!ui.loaded) {
    return (
      <LayoutShell>
        <StateView kind="loading" text={ui.text} />
      </LayoutShell>
    );
  }

  return (
    <LayoutShell>
      {ui.notice && (
        <p role="status" className="px-4 pt-2 text-sm">
          {isStringKey(ui.notice) ? ui.text(ui.notice) : ui.notice}
        </p>
      )}
      {view.name === "settings" ? (
        <div className="mx-auto w-full max-w-2xl p-6">
          <Button
            variant="quiet"
            onClick={() => {
              setView({ name: "classic" });
            }}
          >
            {ui.text("typing.back")}
          </Button>
          <SettingsView
            theme={ui.theme}
            locale={ui.locale}
            layout={ui.layout}
            sound={ui.sound}
            promptSize={ui.promptSize}
            text={ui.text}
            onTheme={(t) => {
              ui.setTheme(t);
            }}
            onLocale={(l) => {
              ui.setLocale(l);
            }}
            onLayout={(l) => {
              ui.setLayout(l);
              setReloadKey((k) => k + 1);
            }}
            onSound={(s) => {
              ui.setSound(s);
            }}
            onPromptSize={(s) => {
              ui.setPromptSize(s);
            }}
          />
        </div>
      ) : (
        <ClassicShell
          screen={classicScreen}
          level={classicLevel}
          layout={layout}
          name={classicName}
          avgWpm={classicWpm}
          text={ui.text}
          onScreen={setClassicScreen}
          onLevel={setClassicLevel}
          onLayout={(l) => {
            ui.setLayout(l);
            setReloadKey((k) => k + 1);
          }}
          onName={setClassicName}
          onSettings={() => {
            setView({ name: "settings" });
          }}
          onRestart={() => {
            setRestartKey((k) => k + 1);
          }}
        >
          {classicScreen === "game" ? (
            gameLoading ? (
              <StateView kind="loading" text={ui.text} />
            ) : (
              <GameView
                key={`game-${String(restartKey)}`}
                prompts={gamePrompts}
                text={ui.text}
                onQuit={() => {
                  setClassicScreen("home");
                }}
              />
            )
          ) : (
            <ClassicScreen
              key={`${classicScreen}-${String(classicLevel)}-${layout}-${String(restartKey)}`}
              screen={classicScreen}
              level={classicLevel}
              layout={layout}
              text={ui.text}
              onDone={(attempt) => {
                void handleDone(attempt);
              }}
              onStats={setClassicWpm}
            />
          )}
        </ClassicShell>
      )}
    </LayoutShell>
  );
}
