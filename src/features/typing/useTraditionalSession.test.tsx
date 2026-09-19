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
    typeKeys(result.current, ["I"]);
    expect(result.current.done).toBe(false);
    expect(result.current.typed).toBe("क्ष");
    typeKeys(result.current, ["d", "f"]);
    expect(result.current.typed).toBe("क्षमा");
    expect(result.current.done).toBe(true);
    expect(result.current.accuracy).toBe(100);
  });

  it("steps the lit key through a pending sequence (covers AC-3)", () => {
    const { result } = setup("आ");
    expect(result.current.hint).toBe("C");
    act(() => {
      result.current.typeChar("c");
    });
    expect(result.current.hint).toBe("F");
    expect(result.current.sequenceHint).toBe("f");
    expect(result.current.typed).toBe("");
  });

  it("surfaces a pending pre-posed mark before its base (covers AC-3)", () => {
    const { result } = setup("कि");
    expect(result.current.pendingMark).toBe("");
    act(() => {
      result.current.typeChar("l");
    });
    expect(result.current.pendingMark).toBe("ि");
    expect(result.current.typed).toBe("");
    typeKeys(result.current, ["s"]);
    expect(result.current.pendingMark).toBe("");
    expect(result.current.typed).toBe("कि");
  });

  it("guides the pre-posed i-matra before its consonant (covers AC-3)", () => {
    const { result } = setup("सि");
    expect(result.current.hint).toBe("L");
    expect(result.current.sequenceHint).toBe("l;");
    act(() => {
      result.current.typeChar("l");
    });
    expect(result.current.hint).toBe(";");
    expect(result.current.sequenceHint).toBe(";");
    act(() => {
      result.current.typeChar(";");
    });
    expect(result.current.typed).toBe("सि");
  });

  it("settles an extendable short unit that matches the drill right away", () => {
    const { result } = setup("प");
    typeKeys(result.current, ["k"]);
    expect(result.current.typed).toBe("प");
    expect(result.current.done).toBe(true);
    expect(result.current.accuracy).toBe(100);
  });

  it("still holds k for फ until its modifier arrives", () => {
    const { result } = setup("फ");
    act(() => {
      result.current.typeChar("k");
    });
    expect(result.current.typed).toBe("");
    typeKeys(result.current, ["m"]);
    expect(result.current.typed).toBe("फ");
  });

  it("advances through मपव without a double press (covers AC-3)", () => {
    const { result } = setup("मपव");
    typeKeys(result.current, ["d", "k", "j"]);
    expect(result.current.typed).toBe("मपव");
    expect(result.current.done).toBe(true);
  });

  it("holds the cursor on a wrong key and advances on the right one", () => {
    const { result } = setup("क");
    typeKeys(result.current, ["g", "a"]);
    expect(result.current.typed).toBe("");
    expect(result.current.keystrokes).toBe(2);
    expect(result.current.errorHits).toBe(2);
    expect(result.current.wrongKey).toBe("a");
    typeKeys(result.current, ["s"]);
    expect(result.current.typed).toBe("क");
    expect(result.current.errorHits).toBe(2);
    expect(result.current.wrongKey).toBe(null);
  });

  it("clears the pending buffer first on backspace (covers AC-5)", () => {
    const { result } = setup("थ");
    act(() => {
      result.current.typeChar("y");
      result.current.backspace();
      result.current.typeChar("y");
    });
    expect(result.current.typed).toBe("थ");
    expect(result.current.errorHits).toBe(0);
  });

  it("builds a traditional attempt with unit indexes for save (covers AC-4)", () => {
    const { result } = setup("क्ष");
    typeKeys(result.current, ["I"]);
    const attempt = result.current.buildAttempt("nt-conjunct", "2026-09-15T00:00:00Z", 1000);
    expect(attempt.layout).toBe("traditional");
    expect(attempt.lessonId).toBe("nt-conjunct");
    expect(attempt.completed).toBe(true);
    expect(attempt.errors).toEqual([]);
  });

  it("keeps a pending prefix free of error hits (covers AC-5)", () => {
    const { result } = setup("आ");
    act(() => {
      result.current.typeChar("c");
    });
    expect(result.current.typed).toBe("");
    expect(result.current.keystrokes).toBe(1);
    expect(result.current.errorHits).toBe(0);
    expect(result.current.done).toBe(false);
  });

  it("exposes typed units for per unit coloring (covers AC-2)", () => {
    const { result } = setup("क्षमा");
    typeKeys(result.current, ["I", "d"]);
    expect(result.current.units).toEqual(["क्ष", "म"]);
  });

  it("counts units not chars in attempt WPM (covers AC-5)", () => {
    const { result } = setup("क्षमा");
    typeKeys(result.current, ["I", "d", "f"]);
    const attempt = result.current.buildAttempt("nt-conjunct", "2026-09-15T00:00:00Z", 60000);
    expect(attempt.wpm).toBe(0.6);
  });
});

describe("usePreetiSequenceHint", () => {
  it("returns the full sequence for the next unit", () => {
    expect(usePreetiSequenceHint("क्षमा", [])).toBe("I");
    expect(usePreetiSequenceHint("क्षमा", ["क्ष"])).toBe("d");
  });

  it("returns empty for spaces and finished prompts", () => {
    expect(usePreetiSequenceHint("अ आ", ["अ"])).toBe("");
    expect(usePreetiSequenceHint("अ", ["अ"])).toBe("");
  });
});
