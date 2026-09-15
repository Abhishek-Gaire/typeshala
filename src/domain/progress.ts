/**
 * Progress selectors for trends screen (spec 0008).
 * Pure helpers over saved attempts. Bests reuse deriveBests
 * which includes all saved attempts. Done needs completed true.
 */
import type { Attempt, LayoutId } from "./datastore";
import { deriveBests } from "./datastore";
import { selectLessonsWithProgress } from "./progression";
import type { Lesson } from "./datastore";

/** One trend point in time order. */
export interface TrendPoint {
  startedAt: string;
  wpm: number;
  accuracy: number;
  lessonId: string;
  layout: LayoutId;
}

export type LayoutFilter = LayoutId | null;

/** Filter attempts client side. Null means all layouts. */
export function filterByLayout(attempts: Attempt[], filter: LayoutFilter): Attempt[] {
  if (filter === null) return [...attempts];
  return attempts.filter((a) => a.layout === filter);
}

/** Sort attempts by startedAt ascending for trend order. */
export function selectTrendPoints(attempts: Attempt[]): TrendPoint[] {
  return [...attempts]
    .sort((a, b) => (a.startedAt < b.startedAt ? -1 : 1))
    .map((a) => ({
      startedAt: a.startedAt,
      wpm: a.wpm,
      accuracy: a.accuracy,
      lessonId: a.lessonId,
      layout: a.layout,
    }));
}

/** Count lessons done: distinct lessonId with completed true. */
export function selectLessonsDone(lessons: Lesson[], attempts: Attempt[]): number {
  const rows = selectLessonsWithProgress(lessons, attempts);
  return rows.filter((r) => r.status === "done").length;
}

export { deriveBests };
