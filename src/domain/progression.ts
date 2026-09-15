/**
 * Progression selectors for structured lessons (spec 0005).
 * Pure helpers over bundled lessons plus saved attempts.
 * Unlock needs a prior attempt with completed true.
 * Bests reuse deriveBests from datastore.
 */
import type { Attempt, BestScore, Lesson } from "./datastore";
import { deriveBests } from "./datastore";

export type LessonStatus = "locked" | "open" | "done";

/** One lesson plus its derived progress. */
export interface LessonWithProgress {
  lesson: Lesson;
  status: LessonStatus;
  best: BestScore | null;
}

/** Order lessons by order then id for steady display. */
export function orderLessons(lessons: Lesson[]): Lesson[] {
  return [...lessons].sort((a, b) => a.order - b.order || (a.id < b.id ? -1 : 1));
}

/**
 * Attach status plus best to each ordered lesson.
 * First is open, later opens when prior has completed true.
 */
export function selectLessonsWithProgress(
  lessons: Lesson[],
  attempts: Attempt[],
): LessonWithProgress[] {
  const ordered = orderLessons(lessons);
  const bests = deriveBests(attempts);
  const bestByLesson = new Map(bests.map((b) => [b.lessonId, b]));
  const doneIds = new Set(attempts.filter((a) => a.completed).map((a) => a.lessonId));
  const out: LessonWithProgress[] = ordered.map((lesson, index) => {
    const unlocked = index === 0 || doneIds.has(ordered[index - 1].id);
    const done = doneIds.has(lesson.id);
    return {
      lesson,
      status: done ? "done" : unlocked ? "open" : "locked",
      best: bestByLesson.get(lesson.id) ?? null,
    };
  });
  return out;
}

/** Find the lesson after the given id in order, or null. */
export function selectNextLesson(lessons: Lesson[], currentId: string): Lesson | null {
  const ordered = orderLessons(lessons);
  const at = ordered.findIndex((l) => l.id === currentId);
  const next = at >= 0 ? (ordered[at + 1] ?? null) : null;
  return next;
}
