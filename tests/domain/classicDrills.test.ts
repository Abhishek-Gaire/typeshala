/** Bundled classic drill row tests (spec 0017 plus spec 0019 AC-1 through AC-7). */
import { describe, expect, it } from "vitest";
import {
  ALL_CLASSIC_DRILLS,
  CLASSIC_DRILLS,
  CLASSIC_DRILLS_TRADITIONAL,
  lintClassicDrills,
  TRADITIONAL_ALL_L1_TOKENS,
  TRADITIONAL_ALL_L2_TOKENS,
  TRADITIONAL_ALL_L3_SENTENCES,
} from "../../src/domain/classicDrills";
import {
  ALL_L3_SENTENCES,
  buildPrompt,
  CLASSIC_KEYS,
  columnPairs,
  columnTriples,
} from "../../src/domain/drillPattern";
import { tokensForPrompt } from "../../src/domain/promptPaging";
import { sequenceForPreeti, splitUnits } from "../../src/domain/preeti";

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

  it("builds All English L1 from cross row columns, 20 pairs and 400 tokens (spec 0019 AC-1)", () => {
    const all = ALL_CLASSIC_DRILLS.find((row) => row.id === "cl-all-1-en");
    expect(all?.prompt).toBe(buildPrompt(columnPairs(), 10));
    expect(tokensForPrompt(all?.prompt ?? "")).toHaveLength(400);
  });

  it("repeats every Traditional group 30 times at L1 and 10 times at L2/L3 (All L3 is sentences)", () => {
    for (const row of CLASSIC_DRILLS_TRADITIONAL) {
      if (row.id === "cl-all-3-tr") continue;
      const base = row.difficulty === 1 ? 30 : 10;
      const counts = tokenCounts(row.prompt);
      expect(counts.size, row.id).toBeGreaterThan(0);
      for (const [token, count] of counts) {
        expect(count % base, `${row.id} token ${token} counted ${String(count)}`).toBe(0);
      }
    }
  });

  it("holds the nine cross row Traditional L1 pairs on the All row (spec 0019 AC-3)", () => {
    const all = ALL_CLASSIC_DRILLS.find((row) => row.id === "cl-all-1-tr");
    expect(all?.prompt).toBe(
      buildPrompt(
        TRADITIONAL_ALL_L1_TOKENS.map((t) => [t]),
        30,
      ),
    );
    const tokens = tokensForPrompt(all?.prompt ?? "");
    expect(tokens).toHaveLength(9 * 30);
    expect(new Set(tokens).size).toBe(9);
  });

  it("holds the nine cross row Traditional L2 triples on the All row (spec 0019 AC-4)", () => {
    const all = ALL_CLASSIC_DRILLS.find((row) => row.id === "cl-all-2-tr");
    expect(all?.prompt).toBe(
      buildPrompt(
        TRADITIONAL_ALL_L2_TOKENS.map((t) => [t]),
        10,
      ),
    );
    const tokens = tokensForPrompt(all?.prompt ?? "");
    expect(tokens).toHaveLength(9 * 10);
    expect(new Set(tokens).size).toBe(9);
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

  it("holds 60 tokens on single row Level 2 and 100 on All Level 2 columns (spec 0019 AC-2)", () => {
    for (const id of ["cl-home-2-en", "cl-top-2-en", "cl-bottom-2-en"]) {
      const row = ALL_CLASSIC_DRILLS.find((r) => r.id === id);
      expect(tokensForPrompt(row?.prompt ?? ""), id).toHaveLength(60);
    }
    const all = ALL_CLASSIC_DRILLS.find((r) => r.id === "cl-all-2-en");
    expect(tokensForPrompt(all?.prompt ?? ""), "cl-all-2-en").toHaveLength(100);
  });

  it("holds 50 tokens on single row Level 3 and 56 on All Level 3 sentences", () => {
    for (const id of ["cl-home-3-en", "cl-top-3-en", "cl-bottom-3-en"]) {
      const row = ALL_CLASSIC_DRILLS.find((r) => r.id === id);
      expect(tokensForPrompt(row?.prompt ?? ""), id).toHaveLength(50);
    }
    const all = ALL_CLASSIC_DRILLS.find((r) => r.id === "cl-all-3-en");
    expect(tokensForPrompt(all?.prompt ?? "")).toHaveLength(56);
  });

  it("builds All Level 2 from finger column triples for AC-2 (spec 0019)", () => {
    const all = ALL_CLASSIC_DRILLS.find((r) => r.id === "cl-all-2-en");
    expect(all?.prompt).toBe(buildPrompt(columnTriples(), 10));
  });

  it("holds three distinct chars per All Level 2 token with no back to back (spec 0019 AC-2)", () => {
    const all = ALL_CLASSIC_DRILLS.find((r) => r.id === "cl-all-2-en");
    for (const token of tokensForPrompt(all?.prompt ?? "")) {
      expect(token).toHaveLength(3);
      expect(new Set(token).size).toBe(3);
    }
  });

  it("builds All Level 3 from review sentences emitted once", () => {
    const all = ALL_CLASSIC_DRILLS.find((r) => r.id === "cl-all-3-en");
    expect(all?.prompt).toBe(ALL_L3_SENTENCES.join(" "));
  });

  it("builds Traditional All Level 3 from review sentences emitted once", () => {
    const all = ALL_CLASSIC_DRILLS.find((r) => r.id === "cl-all-3-tr");
    expect(all?.prompt).toBe(TRADITIONAL_ALL_L3_SENTENCES.join(" "));
    expect(tokensForPrompt(all?.prompt ?? "")).toHaveLength(57);
  });

  it("keeps every Traditional All L3 unit on a real Preeti key sequence", () => {
    const all = ALL_CLASSIC_DRILLS.find((r) => r.id === "cl-all-3-tr");
    for (const unit of splitUnits(all?.prompt ?? "")) {
      if (unit === " ") continue;
      expect(sequenceForPreeti(unit), `unit ${unit}`).not.toBe("");
    }
    expect(splitUnits(all?.prompt ?? "")).not.toContain("ि");
  });
});

describe("traditional row lengths", () => {
  it("holds exact token totals per row for AC-4 (spec 0019 All L1/L2)", () => {
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
      ["cl-all-1-tr", 9 * 30],
      ["cl-all-2-tr", 9 * 10],
      ["cl-all-3-tr", 57],
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

describe("all cross row content rules (spec 0019 AC-1 through AC-4)", () => {
  it("shares no English All Level 1 group with any row local Level 1 group", () => {
    const local = new Set<string>();
    for (const id of ["cl-home-1-en", "cl-top-1-en", "cl-bottom-1-en"]) {
      const row = ALL_CLASSIC_DRILLS.find((r) => r.id === id);
      const tokens = tokensForPrompt(row?.prompt ?? "");
      for (let i = 0; i + 2 <= tokens.length; i += 2) {
        local.add(`${tokens[i]} ${tokens[i + 1]}`);
      }
    }
    const all = ALL_CLASSIC_DRILLS.find((r) => r.id === "cl-all-1-en");
    const allTokens = tokensForPrompt(all?.prompt ?? "");
    for (let i = 0; i + 2 <= allTokens.length; i += 2) {
      expect(local.has(`${allTokens[i]} ${allTokens[i + 1]}`)).toBe(false);
    }
  });

  it("lists the exact Traditional All cross row tokens in order", () => {
    expect(TRADITIONAL_ALL_L1_TOKENS).toEqual([
      "बसत्रउ",
      "किधय",
      "मपभई",
      "वाचग",
      "नजतथ",
      "बसशर",
      "किह।",
      "मपखप",
      "वादल",
    ]);
    expect(TRADITIONAL_ALL_L2_TOKENS).toEqual([
      "बसित्र",
      "किमच",
      "वानश",
      "त्रबस",
      "धयख",
      "भईद",
      "शहम",
      "खपत",
      "दलक",
    ]);
  });

  it("shares no Traditional All Level 1 or 2 group with any row local group", () => {
    const localL1 = new Set<string>();
    for (const id of ["cl-home-1-tr", "cl-top-1-tr", "cl-bottom-1-tr"]) {
      for (const token of tokensForPrompt(
        ALL_CLASSIC_DRILLS.find((r) => r.id === id)?.prompt ?? "",
      )) {
        localL1.add(token);
      }
    }
    for (const token of TRADITIONAL_ALL_L1_TOKENS) {
      expect(localL1.has(token), token).toBe(false);
    }
    const localL2 = new Set<string>();
    for (const id of ["cl-home-2-tr", "cl-top-2-tr", "cl-bottom-2-tr"]) {
      for (const token of tokensForPrompt(
        ALL_CLASSIC_DRILLS.find((r) => r.id === id)?.prompt ?? "",
      )) {
        localL2.add(token);
      }
    }
    for (const token of TRADITIONAL_ALL_L2_TOKENS) {
      expect(localL2.has(token), token).toBe(false);
    }
  });

  it("keeps every Traditional All unit on a real Preeti key sequence with no standalone i matra", () => {
    for (const id of ["cl-all-1-tr", "cl-all-2-tr"]) {
      const row = ALL_CLASSIC_DRILLS.find((r) => r.id === id);
      for (const unit of splitUnits(row?.prompt ?? "")) {
        if (unit === " ") continue;
        expect(sequenceForPreeti(unit), `${id} unit ${unit}`).not.toBe("");
      }
      expect(splitUnits(row?.prompt ?? ""), id).not.toContain("ि");
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
          expect(keys.has(char.toLowerCase()), `${row.id} token ${token} uses ${char}`).toBe(true);
        }
      }
    }
  });
});
