/** Lesson picker backed by bundled English lessons (spec 0004, AC-1). */
import type { Lesson } from "../../domain/datastore";
import { Button } from "../../components/Button";
import type { StringKey } from "../../i18n/keys";

export function LessonPicker({
  lessons,
  lastRuns,
  text,
  onPick,
}: {
  lessons: Lesson[];
  lastRuns: Record<string, string>;
  text: (key: StringKey) => string;
  onPick: (lesson: Lesson) => void;
}) {
  return (
    <section aria-label="lessons">
      <h1 className="text-xl font-semibold text-(--color-ink)">{text("lesson.pick")}</h1>
      <ul className="mt-4 grid gap-3">
        {lessons.map((lesson) => (
          <li key={lesson.id} className="rounded-xl bg-(--color-surface) p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-(--color-ink)">{lesson.title}</p>
                {lesson.id in lastRuns && (
                  <p className="text-sm text-(--color-ink-soft)">
                    {text("lesson.lastRun")}: {lastRuns[lesson.id]}
                  </p>
                )}
              </div>
              <Button
                onClick={() => {
                  onPick(lesson);
                }}
              >
                {text("action.start")}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
