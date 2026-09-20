/** Bundled classic drill row tests (spec 0017 AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-9). */
import { describe, expect, it } from "vitest";
import {
  ALL_CLASSIC_DRILLS,
  CLASSIC_DRILLS,
  CLASSIC_DRILLS_TRADITIONAL,
  lintClassicDrills,
} from "../../src/domain/classicDrills";
import { buildPrompt, CLASSIC_KEYS } from "../../src/domain/drillPattern";
import { tokensForPrompt } from "../../src/domain/promptPaging";
import { splitUnits } from "../../src/domain/preeti";

/** Meta every row must keep: id, layout, title, order, category, difficulty. */
const EXPECTED_META: Array<[string, string, string, number, string, number]> = [
  ["cl-home-1-en", "qwerty", "Home L1", 201, "home", 1],
  ["cl-home-2-en", "qwerty", "Home L2", 202, "home", 2],
  ["cl-home-3-en", "qwerty", "Home L3", 203, "home", 3],
  ["cl-top-1-en", "qwerty", "Top L1", 204, "top", 1],
  ["cl-top-2-en", "qwerty", "Top L2", 205, "top", 2],
  ["cl-top-3-en", "qwerty", "Top L3", 206, "top", 3],
  ["cl-bottom-1-en", "qwerty", "Bottom L1", 207, "bottom", 1],
  ["cl-bottom-2-en", "qwerty", "Bottom L2", 208, "bottom", 2],
  ["cl-bottom-3-en", "qwerty", "Bottom L3", 209, "bottom", 3],
  ["cl-all-1-en", "qwerty", "All L1", 210, "all", 1],
  ["cl-all-2-en", "qwerty", "All L2", 211, "all", 2],
  ["cl-all-3-en", "qwerty", "All L3", 212, "all", 3],
  ["cl-home-1-tr", "traditional", "Home L1", 301, "home", 1],
  ["cl-home-2-tr", "traditional", "Home L2", 302, "home", 2],
  ["cl-home-3-tr", "traditional", "Home L3", 303, "home", 3],
  ["cl-top-1-tr", "traditional", "Top L1", 304, "top", 1],
  ["cl-top-2-tr", "traditional", "Top L2", 305, "top", 2],
  ["cl-top-3-tr", "traditional", "Top L3", 306, "top", 3],
  ["cl-bottom-1-tr", "traditional", "Bottom L1", 307, "bottom", 1],
  ["cl-bottom-2-tr", "traditional", "Bottom L2", 308, "bottom", 2],
  ["cl-bottom-3-tr", "traditional", "Bottom L3", 309, "bottom", 3],
  ["cl-all-1-tr", "traditional", "All L1", 310, "all", 1],
  ["cl-all-2-tr", "traditional", "All L2", 311, "all", 2],
  ["cl-all-3-tr", "traditional", "All L3", 312, "all", 3],
];

const tokenCounts = (prompt: string): Map<string, number> => {
  const counts = new Map<string, number>();
  for (const token of tokensForPrompt(prompt)) counts.set(token, (counts.get(token) ?? 0) + 1);
  return counts;
};

describe("bundled drill rows", () => {
  it("keeps every row id, layout, title, order, category, and difficulty", () => {
    expect(
      ALL_CLASSIC_DRILLS.map((row) => [
        row.id,
        row.layout,
        row.title,
        row.order,
        row.category,
        row.difficulty,
      ]),
    ).toEqual(EXPECTED_META);
    expect(CLASSIC_DRILLS).toHaveLength(12);
    expect(CLASSIC_DRILLS_TRADITIONAL).toHaveLength(12);
  });

  it("builds Home English L1 from true finger mirror pairs, ten reps each", () => {
    const home = ALL_CLASSIC_DRILLS.find((row) => row.id === "cl-home-1-en");
    expect(home?.prompt).toBe(
      buildPrompt(
        [
          ["aaa", ";;;"],
          ["sss", "lll"],
          ["ddd", "kkk"],
          ["fff", "jjj"],
          ["ggg", "hhh"],
        ],
        10,
      ),
    );
  });

  it("grows All English L1 to 15 pairs, 300 tokens", () => {
    const all = ALL_CLASSIC_DRILLS.find((row) => row.id === "cl-all-1-en");
    expect(tokensForPrompt(all?.prompt ?? "")).toHaveLength(300);
  });

  it("repeats every Traditional group 30 times at L1 and 10 times at L2/L3", () => {
    for (const row of CLASSIC_DRILLS_TRADITIONAL) {
      const base = row.difficulty === 1 ? 30 : 10;
      const counts = tokenCounts(row.prompt);
      expect(counts.size, row.id).toBeGreaterThan(0);
      for (const [token, count] of counts) {
        expect(count % base, `${row.id} token ${token} counted ${String(count)}`).toBe(0);
      }
    }
  });

  it("holds all 14 Traditional L1 pairs on the All row", () => {
    const all = ALL_CLASSIC_DRILLS.find((row) => row.id === "cl-all-1-tr");
    const tokens = tokensForPrompt(all?.prompt ?? "");
    expect(tokens).toHaveLength(14 * 30);
    expect(new Set(tokens).size).toBe(14);
  });

  it("passes lint on all 24 rows", () => {
    expect(lintClassicDrills()).toEqual([]);
  });

  it("locks the generated prompts against accidental drift", () => {
    expect(ALL_CLASSIC_DRILLS).toMatchSnapshot();
  });
});

describe("english row lengths", () => {
  it("holds 100 tokens on single row Level 1 for AC-1", () => {
    for (const id of ["cl-home-1-en", "cl-top-1-en", "cl-bottom-1-en"]) {
      const row = ALL_CLASSIC_DRILLS.find((r) => r.id === id);
      expect(tokensForPrompt(row?.prompt ?? ""), id).toHaveLength(100);
    }
  });

  it("holds 60 tokens on single row Level 2 and All Level 2 for AC-2", () => {
    for (const id of ["cl-home-2-en", "cl-top-2-en", "cl-bottom-2-en", "cl-all-2-en"]) {
      const row = ALL_CLASSIC_DRILLS.find((r) => r.id === id);
      expect(tokensForPrompt(row?.prompt ?? ""), id).toHaveLength(60);
    }
  });

  it("holds 50 tokens on single row Level 3 and 60 on All Level 3 for AC-3", () => {
    for (const id of ["cl-home-3-en", "cl-top-3-en", "cl-bottom-3-en"]) {
      const row = ALL_CLASSIC_DRILLS.find((r) => r.id === id);
      expect(tokensForPrompt(row?.prompt ?? ""), id).toHaveLength(50);
    }
    const all = ALL_CLASSIC_DRILLS.find((r) => r.id === "cl-all-3-en");
    expect(tokensForPrompt(all?.prompt ?? "")).toHaveLength(60);
  });

  it("builds All Level 2 from one window per hand per row for AC-2", () => {
    const all = ALL_CLASSIC_DRILLS.find((r) => r.id === "cl-all-2-en");
    expect(all?.prompt).toBe(
      buildPrompt([["asd"], ["hjk"], ["qwe"], ["yui"], ["zxc"], ["nm,"]], 10),
    );
  });

  it("builds All Level 3 from two mixed groups per row for AC-3", () => {
    const all = ALL_CLASSIC_DRILLS.find((r) => r.id === "cl-all-3-en");
    expect(all?.prompt).toBe(
      buildPrompt([["a;d"], ["slf"], ["qpe"], ["wor"], ["z/c"], ["x.v"]], 10),
    );
  });
});

describe("traditional row lengths", () => {
  it("holds exact token totals per row for AC-4", () => {
    const expected: Array<[string, number]> = [
      ["cl-home-1-tr", 5 * 30],
      ["cl-home-2-tr", 5 * 10],
      ["cl-home-3-tr", 5 * 10],
      ["cl-top-1-tr", 5 * 30],
      ["cl-top-2-tr", 5 * 10],
      ["cl-top-3-tr", 8 * 10],
      ["cl-bottom-1-tr", 4 * 30],
      ["cl-bottom-2-tr", 5 * 10],
      ["cl-bottom-3-tr", 8 * 10],
      ["cl-all-1-tr", 14 * 30],
      ["cl-all-2-tr", 6 * 10],
      ["cl-all-3-tr", 9 * 10],
    ];
    for (const [id, total] of expected) {
      const row = ALL_CLASSIC_DRILLS.find((r) => r.id === id);
      expect(tokensForPrompt(row?.prompt ?? ""), id).toHaveLength(total);
    }
  });

  it("repeats the two closing Top Level 3 tokens twice by design for AC-4", () => {
    const row = ALL_CLASSIC_DRILLS.find((r) => r.id === "cl-top-3-tr");
    const counts = new Map<string, number>();
    for (const token of tokensForPrompt(row?.prompt ?? "")) {
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
    expect(counts.size).toBe(6);
    for (const [token, count] of counts) {
      if (token === "त्रधय" || token === "भईच") {
        expect(count, token).toBe(20);
      } else {
        expect(count, token).toBe(10);
      }
    }
  });
});

describe("row level guarantees", () => {
  it("keeps single spacing with no lead or trail space on every row", () => {
    for (const row of ALL_CLASSIC_DRILLS) {
      expect(row.prompt, row.id).toBe(row.prompt.trim());
      expect(row.prompt.includes("  "), row.id).toBe(false);
    }
  });

  it("holds zero back to back units on every Level 2 and Level 3 row for AC-6", () => {
    for (const row of ALL_CLASSIC_DRILLS) {
      const diff = row.difficulty ?? 1;
      if (diff <= 1) continue;
      const units = splitUnits(row.prompt).filter((u) => u !== " ");
      for (let i = 1; i < units.length; i++) {
        expect(units[i], `${row.id} at ${String(i)}`).not.toBe(units[i - 1]);
      }
    }
  });

  it("keeps every English token on its screen key set for AC-9", () => {
    const keysFor = (category: string): Set<string> => {
      const rows = category === "all" ? ["home", "top", "bottom"] : [category];
      const keys = new Set<string>();
      for (const r of rows) {
        const entry = CLASSIC_KEYS[r as "home" | "top" | "bottom"];
        for (const k of [...entry.left, ...entry.right]) keys.add(k);
      }
      return keys;
    };
    for (const row of CLASSIC_DRILLS) {
      const keys = keysFor(row.category ?? "all");
      for (const token of tokensForPrompt(row.prompt)) {
        for (const char of token) {
          expect(keys.has(char), `${row.id} token ${token} uses ${char}`).toBe(true);
        }
      }
    }
  });
});
