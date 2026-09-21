/** Bundled Traditional lesson checks (spec 0007, AC-1, AC-5; spec 0018 coverage). */
import { describe, expect, it } from "vitest";
import lessons from "../../../src/data/lessons/ne-traditional.json";
import { sequenceForPreeti, splitUnits } from "../../../src/domain/preeti";
import { orderLessons, selectLessonsWithProgress } from "../../../src/domain/progression";
import type { Attempt, Lesson } from "../../../src/domain/datastore";

const typed = lessons as Lesson[];
const VIRAMA = "्";

describe("ne-traditional lessons", () => {
  it("ships ordered traditional lessons in fixed order (covers AC-1)", () => {
    expect(typed.length).toBeGreaterThanOrEqual(5);
    expect(typed.every((l) => l.layout === "traditional")).toBe(true);
    const orders = typed.map((l) => l.order);
    expect([...orders].sort((a, b) => a - b)).toEqual(orders);
    const ids = typed.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("segments every prompt into mapped units only (covers AC-5)", () => {
    for (const lesson of typed) {
      expect(lesson.prompt.trim().length).toBeGreaterThan(0);
      expect(lesson.prompt).not.toMatch(/[A-Za-z]/);
      const units = splitUnits(lesson.prompt);
      expect(units.join("")).toBe(lesson.prompt);
      for (const unit of units) {
        // Spec 0018: every Devanagari unit resolves; spacing and ASCII
        // punctuation keep the allowlist exception. Danda plus au-mark now
        // resolve through the corrected map, so they are required, not skipped.
        if (unit === " " || unit === "?") continue;
        expect(sequenceForPreeti(unit)).not.toBe("");
      }
    }
  });

  it("keeps conjuncts whole in the cluster lessons (covers AC-5)", () => {
    const cluster = typed.find((l) => l.id === "nt-conjunct-a");
    expect(cluster).toBeDefined();
    expect(cluster?.prompt).toContain(VIRAMA);
    const units = splitUnits(cluster?.prompt ?? "");
    expect(units).toContain("क्ष");
    expect(units).toContain("ज्ञ");
    expect(units).toContain("श्र");
  });

  it("keeps early lessons free of conjuncts (covers AC-5)", () => {
    for (const lesson of typed.filter((l) => l.level === "simple")) {
      expect(lesson.prompt).not.toContain(VIRAMA);
    }
  });

  it("groups lessons from simple to matra to conjunct (covers AC-1)", () => {
    const levels = new Set(typed.map((l) => l.level));
    expect(levels.has("simple")).toBe(true);
    expect(levels.has("matra")).toBe(true);
    expect(levels.has("conjunct")).toBe(true);
  });
});

describe("spec 0018 lesson coverage", () => {
  const CATEGORY_A = [
    "ऋ",
    "अः",
    "ः",
    "ञ्",
    "ख्",
    "ग्",
    "च्",
    "ण्",
    "थ्",
    "ब्",
    "व्",
    "त्त",
    "क्त",
    "द्ध",
    "द्द",
  ];

  it("ships three tail lessons covering the 15 undrilled units (covers AC-1)", () => {
    const marks = typed.find((l) => l.id === "nt-marks-2");
    const halant = typed.find((l) => l.id === "nt-halant-row");
    const clusters = typed.find((l) => l.id === "nt-clusters-2");
    expect(marks?.order).toBe(25);
    expect(halant?.order).toBe(26);
    expect(clusters?.order).toBe(27);
    expect(marks?.level).toBe("matra");
    expect(halant?.level).toBe("conjunct");
    expect(clusters?.level).toBe("conjunct");
    const joint = [marks?.prompt ?? "", halant?.prompt ?? "", clusters?.prompt ?? ""].join(" ");
    for (const unit of CATEGORY_A) {
      expect(joint).toContain(unit);
    }
  });

  it("resolves every new prompt unit to exactly one map sequence (covers AC-2)", () => {
    for (const id of ["nt-marks-2", "nt-halant-row", "nt-clusters-2"]) {
      const lesson = typed.find((l) => l.id === id);
      expect(lesson).toBeDefined();
      const units = splitUnits(lesson?.prompt ?? "");
      expect(units.join("")).toBe(lesson?.prompt ?? "");
      for (const unit of units) {
        if (unit === " ") continue;
        expect(sequenceForPreeti(unit)).not.toBe("");
      }
    }
  });

  it("holds Devanagari plus spacing only in new prompts (covers AC-4)", () => {
    for (const id of ["nt-marks-2", "nt-halant-row", "nt-clusters-2"]) {
      const lesson = typed.find((l) => l.id === id);
      expect(lesson?.prompt).not.toMatch(/[A-Za-z]/);
      for (const ch of lesson?.prompt ?? "") {
        const isSpace = ch === " ";
        const isDevanagari = ch >= "ऀ" && ch <= "ॿ";
        expect(isSpace || isDevanagari).toBe(true);
      }
    }
  });

  it("removes the broken punctuation lesson with the gap harmless (covers AC-3)", () => {
    expect(typed.find((l) => l.id === "nt-punctuation")).toBeUndefined();
    const orders = typed.map((l) => l.order);
    expect(orders).not.toContain(13);
    expect([...orders].sort((a, b) => a - b)).toEqual(orders);
    // Orders run 1-12 then 14-27: the gap is permanent under positional unlocking.
    expect(Math.min(...orders)).toBe(1);
    expect(Math.max(...orders)).toBe(27);
  });

  it("keeps positional unlocking intact across the order gap and tail (covers AC-3)", () => {
    const ordered = orderLessons(typed);
    const ids = ordered.map((l) => l.id);
    // Gap at 13 does not reorder: 12 still hands off to 14 in display order.
    expect(ids.indexOf("nt-numbers")).toBeLessThan(ids.indexOf("nt-common-words-a"));
    const fresh = selectLessonsWithProgress(ordered, []);
    expect(fresh[0].status).toBe("open");
    expect(fresh[1].status).toBe("locked");
    const completedThrough = (lastOrder: number): Attempt[] =>
      ordered
        .filter((l) => l.order <= lastOrder)
        .map((l) => ({
          id: `attempt-${l.id}`,
          lessonId: l.id,
          layout: "traditional",
          startedAt: "2026-09-21T00:00:00Z",
          durationMs: 1000,
          wpm: 20,
          accuracy: 95,
          errors: [],
          completed: true,
        }));
    // nt-numbers (12) hands off to nt-common-words-a (14) across the gap.
    const acrossGap = selectLessonsWithProgress(ordered, completedThrough(12));
    expect(acrossGap.find((e) => e.lesson.id === "nt-common-words-a")?.status).toBe("open");
    // nt-mixed-drill-b (24) hands off to the new tail at nt-marks-2 (25).
    const atTail = selectLessonsWithProgress(ordered, completedThrough(24));
    expect(atTail.find((e) => e.lesson.id === "nt-marks-2")?.status).toBe("open");
    // nt-halant-row (26) hands off to the last lesson, nt-clusters-2 (27).
    const beforeLast = selectLessonsWithProgress(ordered, completedThrough(26));
    expect(beforeLast.find((e) => e.lesson.id === "nt-clusters-2")?.status).toBe("open");
  });

  it("ignores a saved attempt for the removed lesson id (covers AC-3)", () => {
    const ordered = orderLessons(typed);
    const orphan: Attempt = {
      id: "old-punctuation",
      lessonId: "nt-punctuation",
      layout: "traditional",
      startedAt: "2026-09-21T00:00:00Z",
      durationMs: 1000,
      wpm: 20,
      accuracy: 95,
      errors: [],
      completed: true,
    };
    const withOrphan = selectLessonsWithProgress(ordered, [orphan]);
    const fresh = selectLessonsWithProgress(ordered, []);
    expect(withOrphan.map((e) => e.status)).toEqual(fresh.map((e) => e.status));
  });
});
