/** Bundled Traditional lesson checks (spec 0007, AC-1, AC-5). */
import { describe, expect, it } from "vitest";
import lessons from "./ne-traditional.json";
import { sequenceForPreeti, splitUnits } from "../../domain/preeti";
import type { Lesson } from "../../domain/datastore";

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
        if (
          unit === " " ||
          unit === "," ||
          unit === "।" ||
          unit === "?" ||
          unit === "!" ||
          unit === ":" ||
          unit === ";" ||
          unit === '"' ||
          unit === "'" ||
          unit === "(" ||
          unit === ")" ||
          unit === "[" ||
          unit === "]" ||
          unit === "ौ"
        )
          continue;
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
