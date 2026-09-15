/** Romanized session tests (spec 0006, AC-2, AC-3, AC-4, AC-5). */
import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useRomanizedSession, useSequenceHint } from "./useRomanizedSession";

function setup(prompt: string, fingerGuidance = true) {
  return renderHook(() => useRomanizedSession(prompt, fingerGuidance));
}

describe("useRomanizedSession", () => {
  it("types a full prompt in roman and finishes (covers AC-2)", () => {
    const { result } = setup("कम");
    act(() => {
      result.current.typeChar("k");
    });
    expect(result.current.done).toBe(false);
    act(() => {
      result.current.typeChar("a");
      result.current.typeChar("m");
      result.current.typeChar("a");
    });
    expect(result.current.typed).toBe("कम");
    expect(result.current.done).toBe(true);
    expect(result.current.accuracy).toBe(100);
  });

  it("lits the first roman key with the sequence pending (covers AC-3)", () => {
    const { result } = setup("ख");
    expect(result.current.hint).toBe("K");
    act(() => {
      result.current.typeChar("k");
    });
    expect(result.current.hint).toBe("K");
    expect(result.current.typed).toBe("");
  });

  it("counts a committed wrong sequence as one hit (covers AC-5)", () => {
    const { result } = setup("क");
    act(() => {
      result.current.typeChar("g");
      result.current.typeChar("a");
    });
    expect(result.current.typed).toBe("ग");
    expect(result.current.keystrokes).toBe(2);
    expect(result.current.errorHits).toBe(1);
  });

  it("clears the pending buffer first on backspace (covers AC-5)", () => {
    const { result } = setup("क");
    act(() => {
      result.current.typeChar("k");
      result.current.backspace();
      result.current.typeChar("k");
      result.current.typeChar("a");
    });
    expect(result.current.typed).toBe("क");
    expect(result.current.errorHits).toBe(0);
  });

  it("builds a romanized attempt for save (covers AC-4)", () => {
    const { result } = setup("अ");
    act(() => {
      result.current.typeChar("a");
    });
    const attempt = result.current.buildAttempt("ne-vowels", "2026-09-15T00:00:00Z", 1000);
    expect(attempt.layout).toBe("romanized");
    expect(attempt.lessonId).toBe("ne-vowels");
    expect(attempt.completed).toBe(true);
  });

  it("keeps a pending prefix free of error hits (covers AC-5)", () => {
    const { result } = setup("क");
    act(() => {
      result.current.typeChar("k");
    });
    expect(result.current.typed).toBe("");
    expect(result.current.keystrokes).toBe(1);
    expect(result.current.errorHits).toBe(0);
    expect(result.current.done).toBe(false);
  });

  it("types a space between words with no error (covers AC-2)", () => {
    const { result } = setup("ए ए");
    act(() => {
      result.current.typeChar("e");
    });
    expect(result.current.typed).toBe("ए");
    expect(result.current.hint).toBe("Space");
    act(() => {
      result.current.typeChar(" ");
      result.current.typeChar("e");
    });
    expect(result.current.typed).toBe("ए ए");
    expect(result.current.done).toBe(true);
    expect(result.current.errorHits).toBe(0);
  });

  it("commits a lone extendable vowel before a space (covers AC-2)", () => {
    const { result } = setup("अ आ");
    act(() => {
      result.current.typeChar("a");
    });
    act(() => {
      result.current.typeChar(" ");
    });
    expect(result.current.typed).toBe("अ ");
    expect(result.current.errorHits).toBe(0);
  });

  it("auto commits a trailing short vowel at the end (covers AC-2)", () => {
    const { result } = setup("ए इ");
    act(() => {
      result.current.typeChar("e");
      result.current.typeChar(" ");
      result.current.typeChar("i");
    });
    expect(result.current.typed).toBe("ए इ");
    expect(result.current.done).toBe(true);
    expect(result.current.errorHits).toBe(0);
  });

  it("counts a space against a Devanagari slot as one hit (covers AC-5)", () => {
    const { result } = setup("क");
    act(() => {
      result.current.typeChar(" ");
    });
    expect(result.current.typed).toBe("");
    expect(result.current.errorHits).toBe(1);
    expect(result.current.keystrokes).toBe(1);
  });

  it("keeps the corrected hit after backspace fixes a wrong commit (covers AC-5)", () => {
    const { result } = setup("क");
    act(() => {
      result.current.typeChar("g");
      result.current.typeChar("a");
    });
    expect(result.current.errorHits).toBe(1);
    act(() => {
      result.current.backspace();
    });
    expect(result.current.typed).toBe("");
    act(() => {
      result.current.typeChar("k");
      result.current.typeChar("a");
    });
    expect(result.current.typed).toBe("क");
    expect(result.current.errorHits).toBe(1);
    expect(result.current.accuracy).toBeLessThan(100);
    expect(result.current.finalErrors).toEqual([]);
  });

  it("removes a completed char on backspace when no buffer waits (covers AC-5)", () => {
    const { result } = setup("कम");
    act(() => {
      result.current.typeChar("k");
      result.current.typeChar("a");
    });
    expect(result.current.typed).toBe("क");
    act(() => {
      result.current.backspace();
    });
    expect(result.current.typed).toBe("");
  });

  it("ignores input once the prompt is done (covers AC-2)", () => {
    const { result } = setup("ए");
    act(() => {
      result.current.typeChar("e");
    });
    expect(result.current.done).toBe(true);
    const strokes = result.current.keystrokes;
    act(() => {
      result.current.typeChar("e");
    });
    expect(result.current.keystrokes).toBe(strokes);
    expect(result.current.typed).toBe("ए");
  });

  it("hides the finger hint when guidance is off but keeps the lit key (covers AC-3)", () => {
    const { result } = setup("ख", false);
    expect(result.current.hint).toBe("K");
    expect(result.current.finger).toBe("");
  });

  it("derives scores plus errors on buildAttempt with safe duration (covers AC-4)", () => {
    const { result } = setup("क");
    act(() => {
      result.current.typeChar("g");
      result.current.typeChar("a");
    });
    const attempt = result.current.buildAttempt("ne-cons-a", "2026-09-15T00:00:00Z", 60_000);
    expect(attempt.wpm).toBe(0);
    expect(attempt.accuracy).toBe(50);
    expect(attempt.errors).toEqual([0]);
    expect(attempt.durationMs).toBe(60_000);
    const clamped = result.current.buildAttempt("ne-cons-a", "2026-09-15T00:00:00Z", 0);
    expect(clamped.durationMs).toBe(1);
  });

  it("resets to a fresh session (covers AC-2)", () => {
    const { result } = setup("क");
    act(() => {
      result.current.typeChar("k");
      result.current.typeChar("a");
    });
    expect(result.current.done).toBe(true);
    act(() => {
      result.current.reset();
    });
    expect(result.current.typed).toBe("");
    expect(result.current.keystrokes).toBe(0);
    expect(result.current.errorHits).toBe(0);
    expect(result.current.done).toBe(false);
  });
});

describe("useSequenceHint", () => {
  it("returns the full sequence for the next char (covers AC-3)", () => {
    expect(useSequenceHint("ख", "")).toBe("kha");
  });

  it("returns empty at the end and on spaces (covers AC-3)", () => {
    expect(useSequenceHint("क", "क")).toBe("");
    expect(useSequenceHint("अ आ", "अ")).toBe("");
    expect(useSequenceHint("", "")).toBe("");
  });

  it("returns empty for chars outside the map (covers AC-5)", () => {
    expect(useSequenceHint("A", "")).toBe("");
  });
});
