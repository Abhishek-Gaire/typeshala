/** Romanized session tests (specs 0006, 0022 AC-3, AC-4). */
import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useRomanizedSession } from "../../../src/features/typing/useRomanizedSession";

function setup(prompt: string, fingerGuidance = true) {
  return renderHook(() => useRomanizedSession(prompt, fingerGuidance));
}

function typeKeys(current: { typeChar: (c: string) => void }, keys: string[]) {
  for (const key of keys) {
    act(() => {
      current.typeChar(key);
    });
  }
}

describe("useRomanizedSession", () => {
  it("types a romanized prompt with true sequences and finishes", () => {
    const { result } = setup("कमल");
    typeKeys(result.current, ["k", "a", "m", "a", "l", "a"]);
    expect(result.current.typed).toBe("कमल");
    expect(result.current.units).toEqual(["क", "म", "ल"]);
    expect(result.current.done).toBe(true);
    expect(result.current.accuracy).toBe(100);
    expect(result.current.errorHits).toBe(0);
  });

  it("steps the lit key through a pending sequence", () => {
    const { result } = setup("क");
    expect(result.current.hint).toBe("K");
    expect(result.current.sequenceHint).toBe("ka");
    act(() => {
      result.current.typeChar("k");
    });
    expect(result.current.hint).toBe("A");
    expect(result.current.sequenceHint).toBe("a");
    expect(result.current.typed).toBe("");
  });

  it("commits a short vowel at once when the prompt expects it", () => {
    const { result } = setup("अ क");
    act(() => {
      result.current.typeChar("a");
    });
    expect(result.current.units).toEqual(["अ"]);
    typeKeys(result.current, [" ", "k", "a"]);
    expect(result.current.typed).toBe("अ क");
    expect(result.current.done).toBe(true);
    expect(result.current.accuracy).toBe(100);
  });

  it("holds a short vowel until the deciding key so alignment holds", () => {
    const { result } = setup("आ");
    act(() => {
      result.current.typeChar("a");
    });
    expect(result.current.units).toEqual([]);
    expect(result.current.sequenceHint).toBe("a");
    expect(result.current.hint).toBe("A");
    act(() => {
      result.current.typeChar("a");
    });
    expect(result.current.typed).toBe("आ");
    expect(result.current.done).toBe(true);
  });

  it("counts one error hit for a sequence no map row starts", () => {
    const { result } = setup("क");
    act(() => {
      result.current.typeChar("x");
    });
    expect(result.current.units).toEqual([]);
    expect(result.current.errorHits).toBe(1);
    expect(result.current.wrongKey).toBe("x");
  });

  it("counts one error hit when a resolved sequence misses the prompt", () => {
    const { result } = setup("क");
    typeKeys(result.current, ["a", "k"]);
    expect(result.current.units).toEqual([]);
    expect(result.current.errorHits).toBe(1);
    expect(result.current.wrongKey).toBe("k");
  });

  it("never keeps a wrong key in the pending buffer (spec 0022 check)", () => {
    const { result } = setup("क");
    act(() => {
      result.current.typeChar("x");
    });
    expect(result.current.errorHits).toBe(1);
    // The miss cleared the buffer, so the next key behaves as a fresh start
    // instead of compounding the wrong one (`x` plus `a` would be a second
    // miss): no backspace is needed to shake a wrong key loose.
    act(() => {
      result.current.typeChar("a");
    });
    expect(result.current.errorHits).toBe(1);
    expect(result.current.units).toEqual([]);
    expect(result.current.sequenceHint).toBe("ka");
  });

  it("types a long vowel with the shifted first key", () => {
    const { result } = setup("ट");
    expect(result.current.sequenceHint).toBe("Ta");
    expect(result.current.hint).toBe("T");
    typeKeys(result.current, ["T", "a"]);
    expect(result.current.typed).toBe("ट");
    expect(result.current.done).toBe(true);
  });

  it("clears the pending buffer on backspace before removing a char", () => {
    const { result } = setup("क");
    act(() => {
      result.current.typeChar("k");
    });
    act(() => {
      result.current.backspace();
    });
    expect(result.current.units).toEqual([]);
    expect(result.current.sequenceHint).toBe("ka");
    typeKeys(result.current, ["k", "a"]);
    act(() => {
      result.current.backspace();
    });
    expect(result.current.units).toEqual([]);
    expect(result.current.typed).toBe("");
  });

  it("counts a miss when a space resolves a pending unit the prompt does not want", () => {
    const { result } = setup("आ");
    typeKeys(result.current, ["a", " "]);
    expect(result.current.units).toEqual([]);
    expect(result.current.errorHits).toBe(1);
  });

  it("commits a space the prompt expects", () => {
    const { result } = setup("क ल");
    typeKeys(result.current, ["k", "a", " ", "l", "a"]);
    expect(result.current.typed).toBe("क ल");
    expect(result.current.units).toEqual(["क", " ", "ल"]);
    expect(result.current.done).toBe(true);
    expect(result.current.accuracy).toBe(100);
  });

  it("saves an attempt tagged romanized with unit errors", () => {
    const { result } = setup("कमल");
    typeKeys(result.current, ["k", "a", "m", "a", "l", "a"]);
    const attempt = result.current.buildAttempt("cl-home-1-rn", "2026-10-09T00:00:00.000Z", 4000);
    expect(attempt.layout).toBe("romanized");
    expect(attempt.lessonId).toBe("cl-home-1-rn");
    expect(attempt.completed).toBe(true);
    expect(attempt.durationMs).toBe(4000);
    expect(attempt.errors).toEqual([]);
    expect(attempt.accuracy).toBe(100);
  });

  it("keeps the finger hint off when guidance is off", () => {
    const { result } = setup("क", false);
    expect(result.current.finger).toBe("");
    expect(result.current.hint).toBe("K");
  });

  it("ignores keys after the prompt is done", () => {
    const { result } = setup("क");
    typeKeys(result.current, ["k", "a"]);
    expect(result.current.done).toBe(true);
    act(() => {
      result.current.typeChar("k");
    });
    expect(result.current.keystrokes).toBe(2);
  });

  it("resets to a fresh state", () => {
    const { result } = setup("कमल");
    typeKeys(result.current, ["k", "a", "m", "a"]);
    act(() => {
      result.current.reset();
    });
    expect(result.current.units).toEqual([]);
    expect(result.current.typed).toBe("");
    expect(result.current.keystrokes).toBe(0);
    expect(result.current.sequenceHint).toBe("ka");
  });
});
