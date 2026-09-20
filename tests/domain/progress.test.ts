/** Unit tests for progress selectors (spec 0008). */
import { describe, expect, it } from "vitest";
import { filterByLayout, selectLessonsDone, selectTrendPoints } from "../../src/domain/progress";
import type { Attempt, Lesson } from "../../src/domain/datastore";

function attempt(over: Partial<Attempt> & { lessonId: string }): Attempt {
  return {
    id: "a",
    layout: "qwerty",
    startedAt: "2026-01-01T00:00:00.000Z",
    durationMs: 60000,
    wpm: 30,
    accuracy: 95,
    errors: [],
    completed: true,
    ...over,
  };
}

function lesson(id: string, order: number): Lesson {
  return { id, layout: "qwerty", title: id, prompt: "hi", order };
}

describe("filterByLayout", () => {
  it("returns all on null without mutating (AC-3)", () => {
    const list = [attempt({ lessonId: "l1", layout: "qwerty" })];
    expect(filterByLayout(list, null)).toHaveLength(1);
  });
  it("filters to qwerty only English mapping (AC-3)", () => {
    const list = [
      attempt({ lessonId: "l1", layout: "qwerty" }),
      attempt({ lessonId: "l2", layout: "romanized" }),
    ];
    expect(filterByLayout(list, "qwerty").map((a) => a.lessonId)).toEqual(["l1"]);
  });
});

describe("selectTrendPoints", () => {
  it("sorts by startedAt ascending (AC-2)", () => {
    const late = attempt({ lessonId: "l1", startedAt: "2026-02-01T00:00:00.000Z", wpm: 40 });
    const early = attempt({ lessonId: "l1", startedAt: "2026-01-01T00:00:00.000Z", wpm: 20 });
    const pts = selectTrendPoints([late, early]);
    expect(pts.map((p) => p.wpm)).toEqual([20, 40]);
  });
});

describe("selectLessonsDone", () => {
  it("counts only completed true, not bests length (AC-1)", () => {
    const lessons = [lesson("l1", 0), lesson("l2", 1)];
    const attempts = [
      attempt({ lessonId: "l1", completed: false, wpm: 50 }),
      attempt({ lessonId: "l2", completed: true }),
    ];
    expect(selectLessonsDone(lessons, attempts)).toBe(1);
  });
  it("returns zero on empty (AC-4)", () => {
    expect(selectLessonsDone([lesson("l1", 0)], [])).toBe(0);
  });
});
