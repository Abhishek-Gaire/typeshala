/** Romanize step tests (spec 0006, AC-2, AC-5). */
import { describe, expect, it } from "vitest";
import { advanceRoman, exactCommit, ROMAN_MAP, sequenceFor } from "../../src/domain/romanize";

describe("advanceRoman", () => {
  it("completes a single key char", () => {
    expect(advanceRoman("", "e")).toEqual({ commits: ["ए"], buffer: "", error: false });
  });

  it("holds a prefix as pending without false error", () => {
    expect(advanceRoman("", "k")).toEqual({ commits: [], buffer: "k", error: false });
    expect(advanceRoman("k", "h")).toEqual({ commits: [], buffer: "kh", error: false });
    expect(advanceRoman("kh", "a")).toEqual({ commits: ["ख"], buffer: "", error: false });
  });

  it("waits on short codes that longer ones extend", () => {
    expect(advanceRoman("", "a")).toEqual({ commits: [], buffer: "a", error: false });
    expect(advanceRoman("a", "a")).toEqual({ commits: ["आ"], buffer: "", error: false });
  });

  it("commits the longest prefix then keeps the tail pending", () => {
    expect(advanceRoman("a", "k")).toEqual({ commits: ["अ"], buffer: "k", error: false });
  });

  it("flags one error when nothing matches", () => {
    expect(advanceRoman("", "x")).toEqual({ commits: [], buffer: "", error: true });
  });

  it("is case sensitive for retroflex codes", () => {
    expect(advanceRoman("", "T")).toEqual({ commits: [], buffer: "T", error: false });
    expect(advanceRoman("T", "a")).toEqual({ commits: ["ट"], buffer: "", error: false });
  });

  it("completes the ai diphthong where a alone stays pending (covers AC-5)", () => {
    expect(advanceRoman("a", "i")).toEqual({ commits: ["ऐ"], buffer: "", error: false });
  });

  it("holds a three key sibilant through two pending steps (covers AC-2)", () => {
    expect(advanceRoman("", "s")).toEqual({ commits: [], buffer: "s", error: false });
    expect(advanceRoman("s", "h")).toEqual({ commits: [], buffer: "sh", error: false });
    expect(advanceRoman("sh", "a")).toEqual({ commits: ["श"], buffer: "", error: false });
  });

  it("keeps capital Sha distinct from lower sha (covers AC-5)", () => {
    expect(advanceRoman("Sh", "a")).toEqual({ commits: ["ष"], buffer: "", error: false });
  });

  it("completes an aspirated retroflex through pending Th (covers AC-2)", () => {
    expect(advanceRoman("", "T")).toEqual({ commits: [], buffer: "T", error: false });
    expect(advanceRoman("T", "h")).toEqual({ commits: [], buffer: "Th", error: false });
    expect(advanceRoman("Th", "a")).toEqual({ commits: ["ठ"], buffer: "", error: false });
  });

  it("flags an error and clears a pending prefix with no match (covers AC-5)", () => {
    expect(advanceRoman("k", "x")).toEqual({ commits: [], buffer: "", error: true });
  });

  it("commits the pending vowel then flags the bad tail in one step (covers AC-5)", () => {
    expect(advanceRoman("a", "x")).toEqual({ commits: ["अ"], buffer: "", error: true });
  });

  it("commits plus error together when the tail cannot start a sequence (covers AC-5)", () => {
    const step = advanceRoman("a", "k");
    expect(step.error).toBe(false);
    const next = advanceRoman(step.buffer, "x");
    expect(next).toEqual({ commits: [], buffer: "", error: true });
  });

  it("holds every map value reachable and unique with no variants (covers AC-5)", () => {
    const values = Object.values(ROMAN_MAP);
    expect(new Set(values).size).toBe(values.length);
    for (const [seq, target] of Object.entries(ROMAN_MAP)) {
      expect(sequenceFor(target)).toBe(seq);
    }
  });
});

describe("sequenceFor", () => {
  it("returns the roman sequence for a known char", () => {
    expect(sequenceFor("श")).toBe("sha");
    expect(sequenceFor("अ")).toBe("a");
  });

  it("returns empty for unknown chars", () => {
    expect(sequenceFor(" ")).toBe("");
  });

  it("returns empty for latin input and conjunct clusters (covers AC-5)", () => {
    expect(sequenceFor("k")).toBe("");
    expect(sequenceFor("क्ष")).toBe("");
  });
});

describe("exactCommit", () => {
  it("returns the char for an exact pending buffer (covers AC-2)", () => {
    expect(exactCommit("a")).toBe("अ");
    expect(exactCommit("kha")).toBe("ख");
  });

  it("returns null for partial prefixes and empty (covers AC-5)", () => {
    expect(exactCommit("k")).toBeNull();
    expect(exactCommit("")).toBeNull();
    expect(exactCommit("x")).toBeNull();
  });
});
