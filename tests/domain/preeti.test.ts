/** Preeti step tests (spec 0007, AC-2, AC-5). */
import { describe, expect, it } from "vitest";
import {
  advancePreeti,
  countCorrectUnits,
  deriveFinalUnitErrors,
  exactCommitPreeti,
  PREETI_MAP,
  sequenceForPreeti,
  splitUnits,
} from "../../src/domain/preeti";

describe("advancePreeti", () => {
  it("completes a single key unit", () => {
    expect(advancePreeti("", "s")).toEqual({ commits: ["क"], buffer: "", error: false });
  });

  it("holds a prefix as pending without false error", () => {
    expect(advancePreeti("", "c")).toEqual({ commits: [], buffer: "c", error: false });
    expect(advancePreeti("P", "]")).toEqual({ commits: ["ऐ"], buffer: "", error: false });
  });

  it("holds a longer-sequence prefix as pending (covers AC-2)", () => {
    expect(advancePreeti("", "c")).toEqual({ commits: [], buffer: "c", error: false });
    expect(advancePreeti("c", "f")).toEqual({ commits: [], buffer: "cf", error: false });
  });

  it("holds the conjunct leader as pending (covers AC-2)", () => {
    expect(advancePreeti("", "q")).toEqual({ commits: [], buffer: "q", error: false });
    expect(advancePreeti("q", "m")).toEqual({ commits: ["क्र"], buffer: "", error: false });
  });

  it("commits the prefix plus a complete tail at once", () => {
    expect(advancePreeti("c", "s")).toEqual({
      commits: ["अ", "क"],
      buffer: "",
      error: false,
    });
  });

  it("flags one error when nothing matches", () => {
    expect(advancePreeti("", "m")).toEqual({ commits: [], buffer: "", error: true });
  });

  it("keeps capital V distinct from lower v (covers AC-5)", () => {
    expect(advancePreeti("", "v")).toEqual({ commits: ["ख"], buffer: "", error: false });
  });

  it("completes the ai diphthong where P alone stays pending (covers AC-5)", () => {
    expect(advancePreeti("P", "]")).toEqual({ commits: ["ऐ"], buffer: "", error: false });
  });

  it("flags an error and clears a pending prefix with no match (covers AC-5)", () => {
    expect(advancePreeti("t", "m")).toEqual({ commits: ["त"], buffer: "", error: true });
  });

  it("commits the pending unit then flags the bad tail in one step (covers AC-5)", () => {
    expect(advancePreeti("c", "m")).toEqual({ commits: ["अ"], buffer: "", error: true });
  });

  it("holds every map value reachable and unique with no variants (covers AC-5)", () => {
    const values = Object.values(PREETI_MAP);
    expect(new Set(values).size).toBe(values.length);
    for (const [seq, target] of Object.entries(PREETI_MAP)) {
      expect(sequenceForPreeti(target)).toBe(seq);
    }
  });
});

describe("sequenceForPreeti", () => {
  it("returns the physical sequence for a known unit", () => {
    expect(sequenceForPreeti("क")).toBe("s");
    expect(sequenceForPreeti("क्ष")).toBe("I");
  });

  it("returns empty for unknown units", () => {
    expect(sequenceForPreeti(" ")).toBe("");
  });

  it("returns empty for latin input (covers AC-5)", () => {
    expect(sequenceForPreeti("s")).toBe("");
  });
});

describe("exactCommitPreeti", () => {
  it("returns the unit for an exact pending buffer (covers AC-2)", () => {
    expect(exactCommitPreeti("c")).toBe("अ");
    expect(exactCommitPreeti("y")).toBe("थ");
  });

  it("flushes exact buffers even when a longer sequence extends them (covers AC-2)", () => {
    expect(exactCommitPreeti("t")).toBe("त");
    expect(exactCommitPreeti("c")).toBe("अ");
  });

  it("returns null for non-key buffers and empty (covers AC-5)", () => {
    expect(exactCommitPreeti("m")).toBeNull();
    expect(exactCommitPreeti("")).toBeNull();
    expect(exactCommitPreeti("cx")).toBeNull();
  });
});

describe("splitUnits", () => {
  it("keeps conjunct clusters whole (covers AC-5)", () => {
    expect(splitUnits("क्षमा")).toEqual(["क्ष", "म", "ा"]);
    expect(splitUnits("ज्ञान")).toEqual(["ज्ञ", "ा", "न"]);
    expect(splitUnits("श्रम")).toEqual(["श्र", "म"]);
  });

  it("splits simple text into single chars plus spaces (covers AC-2)", () => {
    expect(splitUnits("अ आ")).toEqual(["अ", " ", "आ"]);
    expect(splitUnits("कम")).toEqual(["क", "म"]);
  });

  it("round trips every prompt without loss (covers AC-5)", () => {
    for (const prompt of ["अ आ इ", "मामा पानी", "क्षमा ज्ञान श्रम"]) {
      expect(splitUnits(prompt).join("")).toBe(prompt);
    }
  });
});

describe("unit scoring", () => {
  it("counts matched units not chars (covers AC-5)", () => {
    expect(countCorrectUnits(["क्ष", "म", "ा"], ["क्ष", "म", "ा"])).toBe(3);
    expect(countCorrectUnits(["क्ष", "म", "ा"], ["क", "म", "ा"])).toBe(2);
  });

  it("reports error spots as unit indexes (covers AC-5)", () => {
    expect(deriveFinalUnitErrors(["क्ष", "म", "ा"], ["क", "म", "X"])).toEqual([0, 2]);
    expect(deriveFinalUnitErrors(["क", "म"], ["क", "म"])).toEqual([]);
  });
});
