/** Progress trends view with plain div charts (spec 0008). */
import type { Attempt, Lesson } from "../../domain/datastore";
import { deriveBests } from "../../domain/datastore";
import {
  filterByLayout,
  selectLessonsDone,
  selectTrendPoints,
  type LayoutFilter,
} from "../../domain/progress";
import type { StringKey } from "../../i18n/keys";
import { Button } from "../../components/Button";

function bar(value: number, max: number): number {
  if (max <= 0) return 4;
  return Math.max(4, Math.round((value / max) * 96));
}

export function ProgressView({
  attempts,
  lessons,
  filter,
  onFilter,
  text,
}: {
  attempts: Attempt[];
  lessons: Lesson[];
  filter: LayoutFilter;
  onFilter: (f: LayoutFilter) => void;
  text: (key: StringKey) => string;
}) {
  const filtered = filterByLayout(attempts, filter);
  const trends = selectTrendPoints(filtered);
  const bests = deriveBests(filtered);
  const done = selectLessonsDone(lessons, filtered);
  const maxWpm = Math.max(0, ...trends.map((t) => t.wpm));
  const filters: { id: LayoutFilter; label: StringKey }[] = [
    { id: null, label: "progress.all" },
    { id: "qwerty", label: "layout.english" },
    { id: "romanized", label: "layout.romanized" },
    { id: "traditional", label: "layout.traditional" },
  ];

  if (attempts.length === 0) {
    return (
      <div>
        <FilterRow filter={filter} onFilter={onFilter} filters={filters} text={text} />
        <p role="status" className="mt-4 text-lg">
          {text("progress.emptyHint")}
        </p>
      </div>
    );
  }

  return (
    <section aria-label={text("nav.progress")}>
      <FilterRow filter={filter} onFilter={onFilter} filters={filters} text={text} />
      <p className="mt-4 text-2xl font-bold">
        {text("progress.done")}: {done}
      </p>
      <h3 className="mt-6 text-lg font-semibold">{text("typing.wpm")}</h3>
      <div className="mt-2 flex items-end gap-1" role="img" aria-label={text("typing.wpm")}>
        {trends.map((t, i) => (
          <div
            key={`${t.startedAt}-${String(i)}`}
            title={t.wpm.toFixed(1)}
            style={{ height: bar(t.wpm, maxWpm) }}
            className="w-4 bg-(--color-accent)"
          />
        ))}
      </div>
      <h3 className="mt-6 text-lg font-semibold">{text("typing.accuracy")}</h3>
      <div className="mt-2 flex items-end gap-1" role="img" aria-label={text("typing.accuracy")}>
        {trends.map((t, i) => (
          <div
            key={`${t.startedAt}-${String(i)}-acc`}
            title={t.accuracy.toFixed(1)}
            style={{ height: bar(t.accuracy, 100) }}
            className="w-4 bg-(--color-accent)"
          />
        ))}
      </div>
      <h3 className="mt-6 text-lg font-semibold">{text("progress.bests")}</h3>
      <ul className="mt-2 space-y-1 text-lg">
        {bests.map((b) => (
          <li key={b.lessonId}>
            {b.lessonId}: {b.wpm.toFixed(1)} {text("typing.wpm")}, {b.accuracy.toFixed(1)}% (
            {b.attempts})
          </li>
        ))}
      </ul>
    </section>
  );
}

function FilterRow({
  filter,
  onFilter,
  filters,
  text,
}: {
  filter: LayoutFilter;
  onFilter: (f: LayoutFilter) => void;
  filters: { id: LayoutFilter; label: StringKey }[];
  text: (key: StringKey) => string;
}) {
  return (
    <div className="flex items-center gap-2" role="group" aria-label={text("lesson.layout")}>
      {filters.map((f) => (
        <Button
          key={String(f.id)}
          variant={filter === f.id ? "primary" : "quiet"}
          onClick={() => {
            onFilter(f.id);
          }}
        >
          {text(f.label)}
        </Button>
      ))}
    </div>
  );
}
