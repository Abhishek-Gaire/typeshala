/** Lesson picker with grouped order, locked state, bests (spec 0005, AC-1, AC-2, AC-3). */
import type { LessonWithProgress } from "../../domain/progression";
import { Button } from "../../components/Button";
import type { StringKey } from "../../i18n/keys";

export function LessonPicker({
  rows,
  text,
  onPick,
}: {
  rows: LessonWithProgress[];
  text: (key: StringKey) => string;
  onPick: (lessonId: string) => void;
}) {
  if (rows.length === 0) {
    return (
      <section aria-label="lessons">
        <h1 className="text-xl font-semibold text-(--color-ink)">{text("lesson.pick")}</h1>
        <p className="mt-2 text-sm text-(--color-ink-soft)">{text("lesson.emptyHint")}</p>
      </section>
    );
  }
  const groups = new Map<string, LessonWithProgress[]>();
  for (const row of rows) {
    const key = row.lesson.level ?? "lessons";
    const list = groups.get(key) ?? [];
    list.push(row);
    groups.set(key, list);
  }
  return (
    <section aria-label="lessons">
      <h1 className="text-xl font-semibold text-(--color-ink)">{text("lesson.pick")}</h1>
      {[...groups.entries()].map(([level, items]) => (
        <div key={level} className="mt-4">
          <p className="text-sm font-semibold text-(--color-ink-soft)">{level}</p>
          <ul className="mt-2 grid gap-3">
            {items.map(({ lesson, status, best }) => {
              const locked = status === "locked";
              return (
                <li key={lesson.id} className="rounded-xl bg-(--color-surface) p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-(--color-ink)">{lesson.title}</p>
                      {best !== null && (
                        <p className="text-sm text-(--color-ink-soft)">
                          {text("lesson.best")}: {String(best.wpm)} WPM, {String(best.accuracy)}%
                        </p>
                      )}
                      {locked && (
                        <p className="text-sm text-(--color-ink-soft)">{text("lesson.locked")}</p>
                      )}
                    </div>
                    <Button
                      disabled={locked}
                      onClick={() => {
                        onPick(lesson.id);
                      }}
                    >
                      {text("action.start")}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}
