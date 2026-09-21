/** Classic layout domain tests (spec 0012 AC-4, AC-5, AC-6). */
import { describe, expect, it } from "vitest";
import {
  classicRowsFor,
  codeForNextUnit,
  drillPassesDifficulty,
  hasConsecutiveRepeat,
  lessonsForClassic,
  mapLevelToCategory,
  oppositeShiftForCode,
  shiftNeededForChar,
} from "../../src/domain/classicLayout";
import { ALL_CLASSIC_DRILLS, lintClassicDrills } from "../../src/domain/classicDrills";
import { splitUnits } from "../../src/domain/preeti";

describe("difficulty validator", () => {
  it("allows the मम पप pair drill at L1 and forbids repeats at L2", () => {
    const units = splitUnits("मम पप मम पप मम पप मम").filter((u) => u !== " ");
    expect(hasConsecutiveRepeat(units)).toBe(true);
    expect(drillPassesDifficulty(units, 1)).toBe(true);
    expect(drillPassesDifficulty(units, 2)).toBe(false);
    expect(drillPassesDifficulty(["म", "प", "म"], 2)).toBe(true);
  });
  it("all bundled drill rows pass lint", () => {
    expect(lintClassicDrills()).toEqual([]);
  });
  it("holds zero back to back repeats on every Level 2 and Level 3 row", () => {
    for (const row of ALL_CLASSIC_DRILLS) {
      if ((row.difficulty ?? 1) <= 1) continue;
      const units = splitUnits(row.prompt).filter((u) => u !== " ");
      expect(hasConsecutiveRepeat(units), row.id).toBe(false);
    }
  });
});

describe("traditional drill rows (spec 0015)", () => {
  it("serves one new row per screen and level in the traditional layout", () => {
    const traditional = ALL_CLASSIC_DRILLS.filter((l) => l.layout === "traditional");
    for (const screen of ["home", "top", "bottom", "all"] as const) {
      for (const level of [1, 2, 3]) {
        const hits = lessonsForClassic(traditional, screen, level);
        expect(hits.map((l) => l.id)).toEqual([`cl-${screen}-${String(level)}-tr`]);
      }
    }
  });

  it("keeps matra keys in real Preeti combos, never standalone", () => {
    const home = ALL_CLASSIC_DRILLS.find((l) => l.id === "cl-home-1-tr");
    expect(home?.prompt).toContain("कि");
    expect(home?.prompt).toContain("वा");
    expect(splitUnits(home?.prompt ?? "")).not.toContain("ि");
  });
});

describe("english drill rows (spec 0019 AC-5)", () => {
  it("serves one row per screen and level in the English layout", () => {
    const english = ALL_CLASSIC_DRILLS.filter((l) => l.layout === "qwerty");
    for (const screen of ["home", "top", "bottom", "all"] as const) {
      for (const level of [1, 2, 3]) {
        const hits = lessonsForClassic(english, screen, level);
        expect(hits.map((l) => l.id)).toEqual([`cl-${screen}-${String(level)}-en`]);
      }
    }
  });
});

describe("shift hint", () => {
  it("asks for Shift only on shifted labels", () => {
    expect(shiftNeededForChar("d")).toBe(false);
    expect(shiftNeededForChar("D")).toBe(true);
    expect(shiftNeededForChar(";")).toBe(false);
    expect(shiftNeededForChar(":")).toBe(true);
    expect(shiftNeededForChar("T")).toBe(true);
    expect(shiftNeededForChar(" ")).toBe(false);
    expect(shiftNeededForChar("")).toBe(false);
  });

  it("picks the opposite hand Shift for a lit key", () => {
    expect(oppositeShiftForCode("KeyD")).toBe("ShiftRight");
    expect(oppositeShiftForCode("KeyL")).toBe("ShiftLeft");
    expect(oppositeShiftForCode("Semicolon")).toBe("ShiftLeft");
    expect(oppositeShiftForCode("Space")).toBe("");
    expect(oppositeShiftForCode("")).toBe("");
    expect(oppositeShiftForCode("Nope")).toBe("");
  });
});

describe("category mapping", () => {
  it("maps old levels and defaults unknown to all", () => {
    expect(mapLevelToCategory("home-row")).toBe("home");
    expect(mapLevelToCategory("top-row")).toBe("top");
    expect(mapLevelToCategory("bottom-row")).toBe("bottom");
    expect(mapLevelToCategory("nope")).toBe("all");
    expect(
      lessonsForClassic(
        [
          { id: "a", layout: "traditional", title: "t", prompt: "x", order: 1, level: "home-row" },
          { id: "b", layout: "traditional", title: "t", prompt: "x", order: 2 },
        ],
        "home",
        1,
      ).map((l) => l.id),
    ).toEqual(["a"]);
  });
});

describe("keyboard geometry", () => {
  it("has five rows, space key, and one red target for म and space", () => {
    const rows = classicRowsFor("traditional");
    expect(rows.length).toBe(5);
    expect(rows.flat().some((k) => k.code === "Space" && k.kind === "space")).toBe(true);
    expect(codeForNextUnit("म", "traditional")).toBe("KeyD");
    expect(codeForNextUnit(" ", "traditional")).toBe("Space");
    expect(codeForNextUnit("a", "qwerty")).toBe("KeyA");
  });

  it("lights the first key of a multi-key traditional unit", () => {
    expect(codeForNextUnit("सि", "traditional")).toBe("KeyL");
    expect(codeForNextUnit("आ", "traditional")).toBe("KeyC");
    expect(codeForNextUnit("फ", "traditional")).toBe("KeyK");
  });
});
