/** Smallest usable English tutor shell: picker, typing, result (spec 0004). */
import { useCallback, useEffect, useState } from "react";
import { LayoutShell } from "./components/LayoutShell";
import { StateView } from "./components/StateView";
import { Button } from "./components/Button";
import { useUiSettings } from "./hooks/useUiSettings";
import { LessonPicker } from "./features/lessons/LessonPicker";
import { TypingView } from "./features/typing/TypingView";
import { ResultView } from "./features/results/ResultView";
import { getProgress, loadLessons, saveResult } from "./infrastructure/tauriApi";
import type { Attempt, Lesson, NewAttempt } from "./domain/datastore";

type View =
  | { name: "picker" }
  | { name: "typing"; lesson: Lesson }
  | { name: "result"; lesson: Lesson; attempt: Attempt };

export default function App() {
  const ui = useUiSettings();
  const [view, setView] = useState<View>({ name: "picker" });
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error" | "empty">("loading");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastRuns, setLastRuns] = useState<Record<string, string>>({});
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async () => {
    setState("loading");
    try {
      const rows = (await loadLessons("qwerty")).filter((l) => l.layout === "qwerty");
      setLessons(rows.sort((a, b) => a.order - b.order));
      const notes: Record<string, string> = {};
      for (const lesson of rows) {
        try {
          const progress = await getProgress({ lessonId: lesson.id });
          const last = progress.attempts[progress.attempts.length - 1] as Attempt | undefined;
          if (last !== undefined)
            notes[lesson.id] = `${String(last.wpm)} WPM, ${String(last.accuracy)}%`;
        } catch {
          /* keep picker usable when one progress read fails */
        }
      }
      setLastRuns(notes);
      setState(rows.length === 0 ? "empty" : "ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, reloadKey]);

  async function handleDone(attempt: NewAttempt) {
    setSaveError(null);
    try {
      const saved = await saveResult(attempt);
      const lesson =
        lessons.find((l) => l.id === saved.lessonId) ?? (view as { lesson: Lesson }).lesson;
      setView({ name: "result", lesson, attempt: saved });
    } catch {
      setSaveError(ui.text("error.saveFailed"));
      const lesson = (view as { lesson: Lesson }).lesson;
      setView({
        name: "result",
        lesson,
        attempt: { ...attempt, id: "unsaved" },
      });
    }
  }

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
      {saveError !== null && view.name === "result" && (
        <p role="alert" className="mb-4 text-sm">
          {saveError}{" "}
          <Button
            variant="quiet"
            onClick={() => {
              const lesson = (view as { lesson: Lesson }).lesson;
              setView({ name: "typing", lesson });
            }}
          >
            {ui.text("typing.retry")}
          </Button>
        </p>
      )}
      {state === "loading" && view.name === "picker" && <StateView kind="loading" text={ui.text} />}
      {state === "error" && view.name === "picker" && (
        <div>
          <p role="alert" className="mb-4">
            {ui.text("error.lessonsMissing")}
          </p>
          <Button
            onClick={() => {
              setReloadKey((k) => k + 1);
            }}
          >
            {ui.text("action.retry")}
          </Button>
        </div>
      )}
      {state === "empty" && view.name === "picker" && <StateView kind="empty" text={ui.text} />}
      {(state === "ready" || view.name !== "picker") && (
        <>
          {view.name === "picker" && state === "ready" && (
            <LessonPicker
              lessons={lessons}
              lastRuns={lastRuns}
              text={ui.text}
              onPick={(lesson) => {
                setView({ name: "typing", lesson });
              }}
            />
          )}
          {view.name === "typing" && (
            <TypingView
              key={view.lesson.id + String(reloadKey)}
              lesson={view.lesson}
              size={ui.promptSize}
              fingerGuidance
              text={ui.text}
              onDone={(attempt) => {
                void handleDone(attempt);
              }}
              onBack={() => {
                setSaveError(null);
                setView({ name: "picker" });
                setReloadKey((k) => k + 1);
              }}
            />
          )}
          {view.name === "result" && (
            <ResultView
              attempt={view.attempt}
              lastNote={lastRuns[view.lesson.id] ?? null}
              text={ui.text}
              onAgain={() => {
                setSaveError(null);
                setView({ name: "typing", lesson: view.lesson });
              }}
              onLessons={() => {
                setSaveError(null);
                setView({ name: "picker" });
                setReloadKey((k) => k + 1);
              }}
            />
          )}
        </>
      )}
    </LayoutShell>
  );
}
