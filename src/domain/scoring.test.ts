import { describe, expect, it } from "vitest";
import {
  calcAccuracy,
  calcWpm,
  countCorrect,
  deriveFinalErrors,
  newSession,
} from "./scoring";

describe("calcWpm", () => {
  it("scores 60 wpm for 300 correct chars in one minute", () => {
    expect(calcWpm(300, 60000)).toBe(60);
  });

  it("returns 0 when no time has passed", () => {
    expect(calcWpm(50, 0)).toBe(0);
  });

  it("returns 0 when nothing is correct", () => {
    expect(calcWpm(0, 60000)).toBe(0);
  });
});

describe("calcAccuracy", () => {
  it("scores 100 with no keystrokes yet", () => {
    expect(calcAccuracy(0, 0)).toBe(100);
  });

  it("counts every wrong press even if fixed later", () => {
    expect(calcAccuracy(10, 2)).toBe(80);
  });

  it("reaches 0 when all presses are wrong", () => {
    expect(calcAccuracy(4, 4)).toBe(0);
  });
});

describe("countCorrect", () => {
  it("counts chars that match in order", () => {
    expect(countCorrect("asdf", "asdx")).toBe(3);
  });

  it("ignores extra typed chars past the prompt", () => {
    expect(countCorrect("ab", "abx")).toBe(2);
  });
});

describe("deriveFinalErrors", () => {
  it("holds prompt spots that still differ", () => {
    expect(deriveFinalErrors("asdf", "asdx")).toEqual([3]);
  });

  it("is empty for a clean run", () => {
    expect(deriveFinalErrors("asdf", "asdf")).toEqual([]);
  });

  it("keeps spots in prompt order", () => {
    expect(deriveFinalErrors("abcd", "xbcd".replace("b", "x"))).toEqual([0, 1]);
  });
});

describe("newSession", () => {
  it("starts idle with zero counts", () => {
    expect(newSession()).toEqual({
      status: "idle",
      typed: "",
      keystrokes: 0,
      errorHits: 0,
      startedAt: null,
    });
  });
});
