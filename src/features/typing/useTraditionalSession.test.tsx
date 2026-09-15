/** Traditional session tests (spec 0007, AC-2, AC-3, AC-4, AC-5). */
import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useTraditionalSession, usePreetiSequenceHint } from "./useTraditionalSession";

function setup(prompt: string, fingerGuidance = true) {
  return renderHook(() => useTraditionalSession(prompt, fingerGuidance));
}

function typeKeys(current: { typeChar: (c: string) => void }, keys: string[]) {
  for (const key of keys) {
    act(() => {
      current.typeChar(key);
    });
  }
}

describe("useTraditionalSession", () => {
  it("types a conjunct prompt with true sequences and finishes (covers AC-2)", () => {
    const { result } = setup("क्षमा");
    typeKeys(result.current, ["]", "k", "S"]);
    expect(result.current.done).toBe(false);
    expect(result.current.typed).toBe("क्ष");
    typeKeys(result.current, ["m", "f"]);
    expect(result.current.typed).toBe("क्षमा");
    expect(result.current.done).toBe(true);
    expect(result.current.accuracy).toBe(100);
  });

  it("lits the first physical key with the sequence pending (covers AC-3)", () => {
    const { result } = setup("थ");
    expect(result.current.hint).toBe("T");
    act(() => {
      result.current.typeChar("t");
    });
    expect(result.current.hint).toBe("T");
    expect(result.current.typed).toBe("");
  });

  it("counts a committed wrong unit as one hit (covers AC-5)", () => {
    const { result } = setup("क");
    typeKeys(result.current, ["g", "a"]);
    expect(result.current.typed).toBe("ग");
    expect(result.current.keystrokes).toBe(2);
    expect(result.current.errorHits).toBe(1);
  });

  it("clears the pending buffer first on backspace (covers AC-5)", () => {
    const { result } = setup("थ");
    act(() => {
      result.current.typeChar("t");
      result.current.backspace();
      result.current.typeChar("t");
      result.current.typeChar("h");
    });
    expect(result.current.typed).toBe("थ");
    expect(result.current.errorHits).toBe(0);
  });

  it("builds a traditional attempt with unit indexes for save (covers AC-4)", () => {
    const { result } = setup("क्ष");
    typeKeys(result.current, ["]", "k", "S"]);
    const attempt = result.current.buildAttempt("nt-conjunct", "2026-09-15T00:00:00Z", 1000);
    expect(attempt.layout).toBe("traditional");
    expect(attempt.lessonId).toBe("nt-conjunct");
    expect(attempt.completed).toBe(true);
    expect(attempt.errors).toEqual([]);
  });

  it("keeps a pending prefix free of error hits (covers AC-5)", () => {
    const { result } = setup("क");
    act(() => {
      result.current.typeChar("]");
    });
    expect(result.current.typed).toBe("");
    expect(result.current.keystrokes).toBe(1);
    expect(result.current.errorHits).toBe(0);
    expect(result.current.done).toBe(false);
  });

  it("exposes typed units for per unit coloring (covers AC-2)", () => {
    const { result } = setup("क्षमा");
    typeKeys(result.current, ["]", "k", "S", "m"]);
    expect(result.current.units).toEqual(["क्ष", "म"]);
  });

  it("counts units not chars in attempt WPM (covers AC-5)", () => {
    const { result } = setup("क्षमा");
    typeKeys(result.current, ["]", "k", "S", "m", "f"]);
    const attempt = result.current.buildAttempt("nt-conjunct", "2026-09-15T00:00:00Z", 60000);
    expect(attempt.wpm).toBe(0.6);
  });
});

describe("usePreetiSequenceHint", () => {
  it("returns the full sequence for the next unit", () => {
    expect(usePreetiSequenceHint("क्षमा", [])).toBe("]kS");
    expect(usePreetiSequenceHint("क्षमा", ["क्ष"])).toBe("m");
  });

  it("returns empty for spaces and finished prompts", () => {
    expect(usePreetiSequenceHint("अ आ", ["अ"])).toBe("");
    expect(usePreetiSequenceHint("अ", ["अ"])).toBe("");
  });
});
