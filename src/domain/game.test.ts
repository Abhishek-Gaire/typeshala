/** Unit tests for the transient game state (spec 0010). */
import { describe, expect, it } from "vitest";
import {
  cleanWords,
  startGame,
  tickGame,
  typeGame,
  CLEARS_PER_LEVEL,
  FALL_HEIGHT,
  MAX_WORDS,
  START_LIVES,
} from "./game";

describe("cleanWords", () => {
  it("splits prompts on spaces and strips punctuation (covers AC-3)", () => {
    expect(cleanWords(["asdf jkl; ask, lass. fall!"])).toEqual([
      "asdf",
      "jkl",
      "ask",
      "lass",
      "fall",
    ]);
  });

  it("drops single letter tokens and dedupes (covers AC-3)", () => {
    expect(cleanWords(["a bb a bb cc"])).toEqual(["bb", "cc"]);
  });

  it("keeps Devanagari tokens (covers AC-3)", () => {
    expect(cleanWords(["नमस्ते संसार"])).toEqual(["नमस्ते", "संसार"]);
  });
});

describe("startGame", () => {
  it("starts active with 3 lives, level 1, one word (covers AC-1 AC-2)", () => {
    const s = startGame(["asdf", "jkl"]);
    expect(s.phase).toBe("active");
    expect(s.lives).toBe(START_LIVES);
    expect(s.level).toBe(1);
    expect(s.score).toBe(0);
    expect(s.words).toHaveLength(1);
  });

  it("throws on an empty word list (covers AC-1)", () => {
    expect(() => startGame([])).toThrow("empty word list");
  });
});

describe("typeGame", () => {
  it("clears the word on a full match and scores (covers AC-1 AC-2)", () => {
    let s = startGame(["asdf"]);
    s = { ...s, words: [{ id: "w1", text: "asdf", lane: 0.5, y: 10, speed: 40 }] };
    for (const ch of "asdf") s = typeGame(s, ch);
    expect(s.cleared).toBe(1);
    expect(s.score).toBe(10);
    expect(s.words).toHaveLength(0);
    expect(s.buffer).toBe("");
  });

  it("matches qwerty case insensitively (covers AC-1)", () => {
    let s = startGame(["Ask"]);
    s = { ...s, words: [{ id: "w1", text: "Ask", lane: 0.5, y: 10, speed: 40 }] };
    for (const ch of "aSK") s = typeGame(s, ch);
    expect(s.cleared).toBe(1);
  });

  it("keeps partial buffer on no match and edits it with backspace (covers AC-1)", () => {
    let s = startGame(["asdf"]);
    s = { ...s, words: [{ id: "w1", text: "asdf", lane: 0.5, y: 10, speed: 40 }] };
    s = typeGame(s, "a");
    s = typeGame(s, "s");
    expect(s.buffer).toBe("as");
    s = typeGame(s, "Backspace");
    expect(s.buffer).toBe("a");
    expect(s.cleared).toBe(0);
  });

  it("raises level every 8 clears (covers AC-2)", () => {
    let s = startGame(["asdf"]);
    for (let n = 0; n < CLEARS_PER_LEVEL; n++) {
      s = {
        ...s,
        words: [{ id: `w${String(n)}`, text: "asdf", lane: 0.5, y: 10, speed: 40 }],
      };
      for (const ch of "asdf") s = typeGame(s, ch);
    }
    expect(s.level).toBe(2);
  });

  it("ignores input when not active (covers AC-5)", () => {
    const s = startGame(["asdf"]);
    const paused = { ...s, phase: "paused" as const };
    expect(typeGame(paused, "a").buffer).toBe("");
  });
});

describe("tickGame", () => {
  it("moves words by elapsed time, not tick count (covers AC-2)", () => {
    let s = startGame(["asdf"]);
    s = { ...s, words: [{ id: "w1", text: "asdf", lane: 0.5, y: 0, speed: 40 }] };
    const next = tickGame(s, ["asdf"], 1000);
    expect(next.words[0]?.y).toBeCloseTo(40);
  });

  it("loses a life per landed word and caps concurrent words (covers AC-2)", () => {
    let s = startGame(["asdf"]);
    s = {
      ...s,
      words: [{ id: "w1", text: "asdf", lane: 0.5, y: FALL_HEIGHT - 1, speed: 40 }],
      spawnInMs: 99999,
    };
    const next = tickGame(s, ["asdf"], 1000);
    expect(next.lives).toBe(START_LIVES - 1);
    expect(next.missed).toBe(1);
    expect(next.words.length).toBeLessThanOrEqual(MAX_WORDS);
  });

  it("ends the run at zero lives (covers AC-2 AC-4)", () => {
    let s = startGame(["asdf"]);
    for (let n = 0; n < START_LIVES; n++) {
      s = {
        ...s,
        phase: "active",
        lives: START_LIVES - n,
        words: [{ id: `w${String(n)}`, text: "asdf", lane: 0.5, y: FALL_HEIGHT, speed: 40 }],
        spawnInMs: 99999,
      };
      s = tickGame(s, ["asdf"], 16);
    }
    expect(s.phase).toBe("done");
    expect(s.lives).toBe(0);
  });

  it("leaves idle and done states untouched (covers AC-5)", () => {
    const s = startGame(["asdf"]);
    const done = { ...s, phase: "done" as const };
    expect(tickGame(done, ["asdf"], 1000)).toBe(done);
  });

  it("clears a stale buffer when a word lands (covers AC-1)", () => {
    let s = startGame(["asdf"]);
    s = {
      ...s,
      buffer: "as",
      words: [{ id: "w1", text: "asdf", lane: 0.5, y: FALL_HEIGHT, speed: 40 }],
      spawnInMs: 99999,
    };
    expect(tickGame(s, ["asdf"], 16).buffer).toBe("");
  });

  it("spawns nothing on an empty word list (covers AC-3)", () => {
    let s = startGame(["asdf"]);
    s = { ...s, words: [], spawnInMs: 0 };
    const next = tickGame(s, [], 2000);
    expect(next.words).toHaveLength(0);
    expect(next.phase).toBe("active");
  });

  it("scores incrementally per clear (covers AC-2)", () => {
    let s = startGame(["asdf"]);
    for (const n of [0, 1]) {
      s = {
        ...s,
        words: [{ id: `w${String(n)}`, text: "asdf", lane: 0.5, y: 10, speed: 40 }],
      };
      for (const ch of "asdf") s = typeGame(s, ch);
    }
    expect(s.cleared).toBe(2);
    expect(s.score).toBe(20);
  });
});
