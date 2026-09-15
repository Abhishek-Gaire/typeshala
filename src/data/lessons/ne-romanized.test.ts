/** Bundled Romanized lesson checks (spec 0006, AC-1, AC-5). */
import { describe, expect, it } from "vitest";
import lessons from "./ne-romanized.json";
import { sequenceFor } from "../../domain/romanize";
import type { Lesson } from "../../domain/datastore";

const typed = lessons as Lesson[];
const VIRAMA = "्";

describe("ne-romanized lessons", () => {
  it("ships five ordered romanized lessons in fixed order (covers AC-1)", () => {
    expect(typed).toHaveLength(5);
    expect(typed.every((l) => l.layout === "romanized")).toBe(true);
    const orders = typed.map((l) => l.order);
    expect([...orders].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5]);
    const ids = typed.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses only mapped Devanagari chars plus spaces with no conjuncts (covers AC-5)", () => {
    for (const lesson of typed) {
      expect(lesson.prompt.trim().length).toBeGreaterThan(0);
      expect(lesson.prompt).not.toContain(VIRAMA);
      expect(lesson.prompt).not.toMatch(/[A-Za-z]/);
      for (const char of lesson.prompt) {
        if (char === " ") continue;
        expect(sequenceFor(char)).not.toBe("");
      }
    }
  });

  it("groups lessons by stage with known levels (covers AC-1)", () => {
    const levels = new Set(typed.map((l) => l.level));
    expect(levels.has("vowels")).toBe(true);
    expect(levels.has("words")).toBe(true);
  });
});
