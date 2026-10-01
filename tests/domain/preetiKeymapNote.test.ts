/**
 * The reference note has to agree with the map (spec 0021 AC-10).
 * The note is the file a contributor opens to learn the status of these
 * letters, so when it drifts from the code the repo asserts a falsehood.
 * These checks read the note and compare it against PREETI_MAP itself, so
 * neither side can be updated alone without a failure here.
 *
 * The note lives at the repo root, so it is read through Vite's raw import
 * rather than node:fs, which keeps the test inside the project's existing
 * type and lint surface with no new dependency.
 */
import { describe, expect, it } from "vitest";
import noteText from "../../preeti-keymap-differences.md?raw";
import { PREETI_MAP, sequenceForPreeti, splitUnits } from "../../src/domain/preeti";

/** The rare conjunct rows the note's reachability table lists. */
const RARE = [
  "ङ्ख",
  "ङ्क",
  "ङ्ग",
  "ङ्घ",
  "ङ्ढ",
  "ड्ड",
  "ट्ट",
  "ट्ठ",
  "ठ्ठ",
  "द्घ",
  "द्व",
  "हृ",
  "ह्र",
  "रू",
];

const NOTE: string = noteText;

/** The row of the note's table whose first cell is the given unit. */
function noteRow(unit: string): string | undefined {
  return NOTE.split("\n").find((line) => line.startsWith(`| ${unit} `));
}

/** Cells of a markdown table row, trimmed, without the empty edge cells. */
function cells(row: string): string[] {
  return row
    .split("|")
    .map((c) => c.trim())
    .filter((c) => c !== "");
}

/** The "Single unit" column, the last cell on every row of that table. */
function singleUnitCell(row: string): string {
  const all = row.split("|");
  return (all[all.length - 2] ?? "").trim();
}

describe("preeti-keymap-differences.md (spec 0021 AC-10)", () => {
  it("reads yes in the Single unit column for all fourteen rare letters", () => {
    for (const letter of RARE) {
      const row = noteRow(letter);
      expect(row, `${letter} missing from the note table`).toBeDefined();
      expect(singleUnitCell(row ?? ""), `${letter} Single unit cell`).toBe("yes");
    }
  });

  it("agrees with the map on each rare letter being one unit", () => {
    // The note's claim is only true if the map really has the row, so this
    // fails if either the note or the map drifts.
    for (const letter of RARE) {
      expect(splitUnits(letter), letter).toEqual([letter]);
      expect(sequenceForPreeti(letter), letter).not.toBe("");
      expect(Object.values(PREETI_MAP), letter).toContain(letter);
    }
  });

  it("keeps n/a on the reph row, which is still not typeable", () => {
    const row = noteRow("reph `र्`");
    expect(row).toBeDefined();
    expect(singleUnitCell(row ?? "")).toBe("n/a");
    expect(sequenceForPreeti("र्")).toBe("");
  });

  it("records each rare letter under the keys the map actually uses", () => {
    // The note's "Reachable in app" column quotes the keystrokes, so a row
    // that changed spelling must not keep the old ones on record.
    for (const letter of RARE) {
      const row = noteRow(letter) ?? "";
      expect(row, `${letter} row missing its keys`).toContain(`\`${sequenceForPreeti(letter)}\``);
    }
  });

  it("no longer says the fix is open", () => {
    expect(NOTE).not.toMatch(/It is open as its own spec/);
  });

  it("still names the composition only clusters that remain split", () => {
    // The note now splits its claim in two: these fourteen ship, and these
    // other clusters do not. Losing the second half would overstate the fix.
    for (const cluster of ["स्व", "स्त्र", "द्र", "क्व"]) {
      expect(cells(noteRow(cluster) ?? "")[0] ?? NOTE, cluster).toContain(cluster);
      expect(NOTE, cluster).toContain(cluster);
    }
  });
});
