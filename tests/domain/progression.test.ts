import { describe, expect, it } from "vitest";
import {
  orderLessons,
  selectLessonsWithProgress,
  selectNextLesson,
} from "../../src/domain/progression";
import type { Attempt, Lesson } from "../../src/domain/datastore";

function lesson(id: string, order: number, level = "words"): Lesson {
  return { id, layout: "qwerty", title: id, prompt: "abc", order, level };
}

function attempt(lessonId: string, wpm = 20, completed = true): Attempt {
  return {
    id: `a-${lessonId}-${String(wpm)}`,
    lessonId,
    layout: "qwerty",
    startedAt: "2026-09-15T00:00:00Z",
    durationMs: 1000,
    wpm,
    accuracy: 95,
    errors: [],
    completed,
  };
}

describe("orderLessons", () => {
  it("orders by order then id (covers AC-1)", () => {
    const out = orderLessons([lesson("b", 2), lesson("a", 1), lesson("c", 2)]);
    expect(out.map((l) => l.id)).toEqual(["a", "b", "c"]);
  });
});

describe("selectLessonsWithProgress", () => {
  it("opens only the first lesson on fresh start (covers AC-2)", () => {
    const rows = selectLessonsWithProgress([lesson("a", 1), lesson("b", 2)], []);
    expect(rows.map((r) => r.status)).toEqual(["open", "locked"]);
  });

  it("unlocks next only when prior has completed true (covers AC-2)", () => {
    const rows = selectLessonsWithProgress(
      [lesson("a", 1), lesson("b", 2), lesson("c", 3)],
      [attempt("a", 20, false)],
    );
    expect(rows.map((r) => r.status)).toEqual(["open", "locked", "locked"]);
  });

  it("marks done plus unlocks next on completed attempt (covers AC-2)", () => {
    const rows = selectLessonsWithProgress([lesson("a", 1), lesson("b", 2)], [attempt("a")]);
    expect(rows.map((r) => r.status)).toEqual(["done", "open"]);
  });

  it("attaches best from deriveBests keeping highest wpm (covers AC-3)", () => {
    const rows = selectLessonsWithProgress([lesson("a", 1)], [attempt("a", 10), attempt("a", 25)]);
    expect(rows[0].best?.wpm).toBe(25);
    expect(rows[0].status).toBe("done");
  });

  it("returns empty for empty catalog (covers AC-5)", () => {
    expect(selectLessonsWithProgress([], [])).toEqual([]);
  });
});

describe("selectNextLesson", () => {
  it("returns the lesson after current in order (covers AC-4)", () => {
    const lessons = [lesson("b", 2), lesson("a", 1), lesson("c", 3)];
    expect(selectNextLesson(lessons, "a")?.id).toBe("b");
  });

  it("returns null after the last lesson (covers AC-4)", () => {
    const lessons = [lesson("a", 1)];
    expect(selectNextLesson(lessons, "a")).toBeNull();
  });

  it("returns null for unknown id (covers AC-4)", () => {
    expect(selectNextLesson([lesson("a", 1)], "missing")).toBeNull();
  });
});
