/** Classic layout domain tests (spec 0012 AC-4, AC-5, AC-6). */
import { describe, expect, it } from "vitest";
import {
  classicRowsFor,
  codeForNextUnit,
  drillPassesDifficulty,
  hasConsecutiveRepeat,
  lessonsForClassic,
  mapLevelToCategory,
} from "./classicLayout";
import { lintClassicDrills } from "./classicDrills";
import { splitUnits } from "./preeti";

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
});
