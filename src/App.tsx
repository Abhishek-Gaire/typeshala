/** Structured lessons plus progression shell (spec 0005). */
import { useCallback, useEffect, useState } from "react";
import { LayoutShell } from "./components/LayoutShell";
import { StateView } from "./components/StateView";
import { Button } from "./components/Button";
import { useUiSettings } from "./hooks/useUiSettings";
import { LessonPicker } from "./features/lessons/LessonPicker";
import { TypingView } from "./features/typing/TypingView";
import { ResultView } from "./features/results/ResultView";
import { ProgressView } from "./features/progress/ProgressView";
import type { LayoutId } from "./domain/datastore";
import { getProgress, loadLessons, saveResult } from "./infrastructure/tauriApi";
import type { Attempt, Lesson, NewAttempt } from "./domain/datastore";
import {
  selectLessonsWithProgress,
  selectNextLesson,
  type LessonWithProgress,
} from "./domain/progression";

type View =
  | { name: "picker" }
  | { name: "progress" }
  | { name: "typing"; lesson: Lesson }
  | { name: "result"; lesson: Lesson; attempt: Attempt };

export default function App() {
  const ui = useUiSettings();
  const [view, setView] = useState<View>({ name: "picker" });
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [rows, setRows] = useState<LessonWithProgress[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error" | "empty">("loading");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [allAttempts, setAllAttempts] = useState<Attempt[]>([]);
  const [progressFilter, setProgressFilter] = useState<LayoutId | null>(null);

  const layout = ui.layout;

  const load = useCallback(async () => {
    setState("loading");
    try {
      const items = (await loadLessons(layout)).filter((l) => l.layout === layout);
      setLessons(items);
      let attempts: Attempt[] = [];
      try {
        const progress = await getProgress({ layout });
        attempts = progress.attempts;
      } catch {
        /* corrupt or missing progress falls back to first open only (spec 0005 AC-6) */
      }
      setRows(selectLessonsWithProgress(items, attempts));
      setAllAttempts(attempts);
      setState(items.length === 0 ? "empty" : "ready");
    } catch {
      setState("error");
    }
  }, [layout]);

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

  function pickLesson(id: string) {
    const found = lessons.find((l) => l.id === id);
    if (found !== undefined) setView({ name: "typing", lesson: found });
  }

  if (!ui.loaded) {
    return (
      <LayoutShell text={ui.text}>
        <StateView kind="loading" text={ui.text} />
      </LayoutShell>
    );
  }

  const next = view.name === "result" ? selectNextLesson(lessons, view.lesson.id) : null;

  return (
    <LayoutShell text={ui.text}>
      {ui.notice && (
        <p role="status" className="mb-4 text-sm">
          {ui.notice}
        </p>
      )}
      <div className="mb-6 flex gap-2" role="navigation" aria-label="Main">
        <Button
          variant={view.name === "picker" ? "primary" : "quiet"}
          onClick={() => {
            setView({ name: "picker" });
          }}
        >
          {ui.text("nav.lessons")}
        </Button>
        <Button
          variant={view.name === "progress" ? "primary" : "quiet"}
          onClick={() => {
            setView({ name: "progress" });
          }}
        >
          {ui.text("nav.progress")}
        </Button>
      </div>
      {view.name === "progress" && (
        <ProgressView
          attempts={allAttempts}
          lessons={lessons}
          filter={progressFilter}
          onFilter={setProgressFilter}
          text={ui.text}
        />
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
            <>
              <div
                className="mb-4 flex items-center gap-2"
                role="group"
                aria-label={ui.text("lesson.layout")}
              >
                <Button
                  variant={layout === "qwerty" ? "primary" : "quiet"}
                  onClick={() => {
                    ui.setLayout("qwerty");
                    setReloadKey((k) => k + 1);
                  }}
                >
                  {ui.text("layout.english")}
                </Button>
                <Button
                  variant={layout === "romanized" ? "primary" : "quiet"}
                  onClick={() => {
                    ui.setLayout("romanized");
                    setReloadKey((k) => k + 1);
                  }}
                >
                  {ui.text("layout.romanized")}
                </Button>
                <Button
                  variant={layout === "traditional" ? "primary" : "quiet"}
                  onClick={() => {
                    ui.setLayout("traditional");
                    setReloadKey((k) => k + 1);
                  }}
                >
                  {ui.text("layout.traditional")}
                </Button>
              </div>
              <LessonPicker rows={rows} text={ui.text} onPick={pickLesson} />
            </>
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
              lastNote={null}
              text={ui.text}
              hasNext={next !== null}
              onAgain={() => {
                setSaveError(null);
                setView({ name: "typing", lesson: view.lesson });
              }}
              onLessons={() => {
                setSaveError(null);
                setView({ name: "picker" });
                setReloadKey((k) => k + 1);
              }}
              onNext={() => {
                if (next !== null) {
                  setSaveError(null);
                  setView({ name: "typing", lesson: next });
                }
              }}
            />
          )}
        </>
      )}
    </LayoutShell>
  );
}
