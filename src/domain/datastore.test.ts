import { describe, expect, it } from "vitest";
import {
  deriveBests,
  defaultSettings,
  mergeSettings,
  validateAttempt,
  type Attempt,
  type NewAttempt,
} from "./datastore";

function attempt(lessonId: string, wpm: number, accuracy: number): Attempt {
  return {
    id: "t",
    lessonId,
    layout: "qwerty",
    startedAt: "2026-09-12T00:00:00Z",
    durationMs: 1000,
    wpm,
    accuracy,
    errors: [],
    completed: true,
  };
}

function valid(): NewAttempt {
  return {
    lessonId: "en-home",
    layout: "qwerty",
    startedAt: "2026-09-12T00:00:00Z",
    durationMs: 1000,
    wpm: 30,
    accuracy: 95,
    errors: [],
    completed: true,
  };
}

describe("validateAttempt", () => {
  it("accepts a good attempt", () => {
    expect(() => {
      validateAttempt(valid());
    }).not.toThrow();
  });

  it("rejects an empty lesson id", () => {
    expect(() => {
      validateAttempt({ ...valid(), lessonId: "  " });
    }).toThrow();
  });

  it("rejects zero duration and out of range accuracy", () => {
    expect(() => {
      validateAttempt({ ...valid(), durationMs: 0 });
    }).toThrow();
    expect(() => {
      validateAttempt({ ...valid(), accuracy: 101 });
    }).toThrow();
    expect(() => {
      validateAttempt({ ...valid(), wpm: Number.NaN });
    }).toThrow();
  });
});

describe("mergeSettings", () => {
  it("keeps current values and clamps prompt size", () => {
    const next = mergeSettings(defaultSettings(), { theme: "dark", promptSize: 999 });
    expect(next.theme).toBe("dark");
    expect(next.promptSize).toBe(defaultSettings().promptSize);
    expect(next.layout).toBe("qwerty");
  });
});

describe("deriveBests", () => {
  it("picks top WPM then accuracy with attempt counts", () => {
    const bests = deriveBests([attempt("a", 20, 99), attempt("a", 30, 80), attempt("b", 10, 90)]);
    expect(bests).toHaveLength(2);
    expect(bests[0]).toMatchObject({ lessonId: "a", wpm: 30, attempts: 2 });
    expect(bests[1]).toMatchObject({ lessonId: "b", wpm: 10, attempts: 1 });
  });

  it("returns empty for no attempts", () => {
    expect(deriveBests([])).toEqual([]);
  });
});
