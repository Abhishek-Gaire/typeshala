/** Drill pattern generator tests (spec 0017 AC-1, AC-2, AC-3, AC-7, AC-9; spec 0019 AC-1, AC-2). */
import { describe, expect, it } from "vitest";
import {
  ALL_L3_SENTENCES,
  CLASSIC_KEYS,
  buildPrompt,
  columnPairs,
  columnTriples,
  englishGroups,
  mirrorPairs,
  mixedTriples,
  sameHandTriples,
} from "../../src/domain/drillPattern";
import { classicRowsFor } from "../../src/domain/classicLayout";

describe("mirrorPairs", () => {
  it("pairs each left key with its true finger mirror, each member tripled", () => {
    expect(mirrorPairs(CLASSIC_KEYS.home)).toEqual([
      ["aaa", ";;;"],
      ["sss", "lll"],
      ["ddd", "kkk"],
      ["fff", "jjj"],
      ["ggg", "hhh"],
    ]);
    expect(mirrorPairs(CLASSIC_KEYS.top)).toEqual([
      ["qqq", "ppp"],
      ["www", "ooo"],
      ["eee", "iii"],
      ["rrr", "uuu"],
      ["ttt", "yyy"],
    ]);
    expect(mirrorPairs(CLASSIC_KEYS.bottom)).toEqual([
      ["zzz", "///"],
      ["xxx", "..."],
      ["ccc", ",,,"],
      ["vvv", "mmm"],
      ["bbb", "nnn"],
    ]);
  });
});

describe("sameHandTriples", () => {
  it("returns the three sliding windows of one hand", () => {
    expect(sameHandTriples(CLASSIC_KEYS.home.left)).toEqual([["asd"], ["sdf"], ["dfg"]]);
    expect(sameHandTriples(CLASSIC_KEYS.home.right)).toEqual([["hjk"], ["jkl"], ["kl;"]]);
    expect(sameHandTriples(CLASSIC_KEYS.top.right)).toEqual([["yui"], ["uio"], ["iop"]]);
    expect(sameHandTriples(CLASSIC_KEYS.bottom.right)).toEqual([["nm,"], ["m,."], [",./"]]);
  });
});

describe("columnTriples", () => {
  it("returns the ten finger column triples, top home bottom per finger (spec 0019 AC-2)", () => {
    expect(columnTriples()).toEqual([
      ["qaz"],
      ["wsx"],
      ["edc"],
      ["rfv"],
      ["tgb"],
      ["yhn"],
      ["ujm"],
      ["ik,"],
      ["ol."],
      ["p;/"],
    ]);
  });

  it("holds three distinct chars per triple for AC-2", () => {
    for (const group of columnTriples()) {
      expect(group[0]).toHaveLength(3);
      expect(new Set(group[0]).size).toBe(3);
    }
  });
});

describe("columnPairs", () => {
  it("returns the twenty vertical pairs, top-home then home-bottom per column (spec 0019 AC-1)", () => {
    expect(columnPairs()).toEqual([
      ["qqq", "aaa"],
      ["aaa", "zzz"],
      ["www", "sss"],
      ["sss", "xxx"],
      ["eee", "ddd"],
      ["ddd", "ccc"],
      ["rrr", "fff"],
      ["fff", "vvv"],
      ["ttt", "ggg"],
      ["ggg", "bbb"],
      ["yyy", "hhh"],
      ["hhh", "nnn"],
      ["uuu", "jjj"],
      ["jjj", "mmm"],
      ["iii", "kkk"],
      ["kkk", ",,,"],
      ["ooo", "lll"],
      ["lll", "..."],
      ["ppp", ";;;"],
      [";;;", "///"],
    ]);
  });

  it("triples each member so every token repeats one char three times (spec 0019 AC-1)", () => {
    for (const group of columnPairs()) {
      expect(group).toHaveLength(2);
      for (const token of group) {
        expect(token).toHaveLength(3);
        expect(new Set(token).size).toBe(1);
      }
    }
  });

  it("shares no group with any row local Level 1 set for AC-1", () => {
    const local = new Set(
      [
        ...mirrorPairs(CLASSIC_KEYS.home),
        ...mirrorPairs(CLASSIC_KEYS.top),
        ...mirrorPairs(CLASSIC_KEYS.bottom),
      ].map((g) => g.join(" ")),
    );
    for (const group of columnPairs()) {
      expect(local.has(group.join(" ")), group.join(" ")).toBe(false);
    }
  });
});

describe("mixedTriples", () => {
  it("alternates a left key, its mirror, then the left key two ahead", () => {
    expect(mixedTriples(CLASSIC_KEYS.home)).toEqual([["a;d"], ["slf"], ["dkg"], ["fja"], ["ghs"]]);
    expect(mixedTriples(CLASSIC_KEYS.top)).toEqual([["qpe"], ["wor"], ["eit"], ["ruq"], ["tyw"]]);
    expect(mixedTriples(CLASSIC_KEYS.bottom)).toEqual([
      ["z/c"],
      ["x.v"],
      ["c,b"],
      ["vmz"],
      ["bnx"],
    ]);
  });
});

describe("englishGroups", () => {
  it("builds Level 1 from the category pairs and cross row columns for All (spec 0019 AC-1)", () => {
    expect(englishGroups("home", 1)).toEqual(mirrorPairs(CLASSIC_KEYS.home));
    expect(englishGroups("top", 1)).toEqual(mirrorPairs(CLASSIC_KEYS.top));
    expect(englishGroups("bottom", 1)).toEqual(mirrorPairs(CLASSIC_KEYS.bottom));
    expect(englishGroups("all", 1)).toEqual(columnPairs());
    expect(englishGroups("all", 1)).toHaveLength(20);
  });

  it("builds Level 2 as left then right windows, All as finger column triples (spec 0019 AC-2)", () => {
    expect(englishGroups("home", 2)).toEqual([
      ["asd"],
      ["sdf"],
      ["dfg"],
      ["hjk"],
      ["jkl"],
      ["kl;"],
    ]);
    expect(englishGroups("all", 2)).toEqual(columnTriples());
    expect(englishGroups("all", 2)).toHaveLength(10);
  });

  it("builds Level 3 as mixed groups, All as review sentences", () => {
    expect(englishGroups("bottom", 3)).toEqual(mixedTriples(CLASSIC_KEYS.bottom));
    expect(englishGroups("all", 3)).toEqual(
      ALL_L3_SENTENCES.map((s) => s.split(/\s+/).filter((t) => t.length > 0)),
    );
  });

  it("rejects an unknown difficulty", () => {
    expect(() => englishGroups("home", 4)).toThrow();
  });
});

describe("key purity", () => {
  const keysFor = (category: "home" | "top" | "bottom" | "all"): Set<string> => {
    const rows = category === "all" ? (["home", "top", "bottom"] as const) : [category];
    const keys = new Set<string>();
    for (const row of rows) {
      for (const key of [...CLASSIC_KEYS[row].left, ...CLASSIC_KEYS[row].right]) keys.add(key);
    }
    return keys;
  };

  it("keeps every generated token on its screen key set (case-insensitive for All L3 sentences)", () => {
    for (const category of ["home", "top", "bottom", "all"] as const) {
      const keys = keysFor(category);
      for (const difficulty of [1, 2, 3]) {
        for (const group of englishGroups(category, difficulty)) {
          for (const token of group) {
            for (const char of token) {
              expect(keys.has(char.toLowerCase()), `${category} ${token} uses ${char}`).toBe(true);
            }
          }
        }
      }
    }
  });
});

describe("buildPrompt", () => {
  it("emits every group in order, repeat times, with single spaces", () => {
    expect(
      buildPrompt(
        [
          ["aaa", ";;;"],
          ["sss", "lll"],
        ],
        2,
      ),
    ).toBe("aaa ;;; aaa ;;; sss lll sss lll");
    expect(buildPrompt([["asd"], ["jkl"]], 3)).toBe("asd asd asd jkl jkl jkl");
  });

  it("emits once when repeat is one", () => {
    expect(buildPrompt([["aaa", ";;;"]], 1)).toBe("aaa ;;;");
    expect(buildPrompt([["asd"]], 1)).toBe("asd");
  });

  it("fails fast on invalid rule data", () => {
    expect(() => buildPrompt([], 1)).toThrow();
    expect(() => buildPrompt([[]], 1)).toThrow();
    expect(() => buildPrompt([["aa", ""]], 1)).toThrow();
    expect(() => buildPrompt([["aa"]], 0)).toThrow();
    expect(() => buildPrompt([["aa"]], -1)).toThrow();
    expect(() => buildPrompt([["aa"]], 1.5)).toThrow();
  });

  it("rejects tokens holding whitespace so counts cannot split silently", () => {
    expect(() => buildPrompt([["a b"]], 1)).toThrow();
    expect(() => buildPrompt([["a\tb"]], 1)).toThrow();
    expect(() => buildPrompt([["a\nb"]], 1)).toThrow();
  });
});

describe("generator validation", () => {
  it("rejects mismatched or empty hands instead of emitting undefined", () => {
    expect(() => mirrorPairs({ left: ["a", "s"], right: [";"] })).toThrow();
    expect(() => mirrorPairs({ left: [], right: [] })).toThrow();
    expect(() => mixedTriples({ left: ["a", "s"], right: [";"] })).toThrow();
    expect(() => mixedTriples({ left: [], right: [] })).toThrow();
  });

  it("rejects short hands at the source instead of embedding undefined", () => {
    expect(() => sameHandTriples([])).toThrow();
    expect(() => sameHandTriples(["a", "s"])).toThrow();
  });
});

describe("screen key geometry", () => {
  it("holds five keys per hand on every row for AC-9", () => {
    for (const row of ["home", "top", "bottom"] as const) {
      expect(CLASSIC_KEYS[row].left).toHaveLength(5);
      expect(CLASSIC_KEYS[row].right).toHaveLength(5);
    }
  });

  it("matches the board geometry painted by classicLayout", () => {
    const board = classicRowsFor("qwerty");
    const firstTen = (rowIndex: number): string[] =>
      board[rowIndex]
        .filter((k) => k.kind === "char")
        .map((k) => k.base)
        .slice(0, 10);
    expect([...CLASSIC_KEYS.top.left, ...CLASSIC_KEYS.top.right]).toEqual(firstTen(1));
    expect([...CLASSIC_KEYS.home.left, ...CLASSIC_KEYS.home.right]).toEqual(firstTen(2));
    expect([...CLASSIC_KEYS.bottom.left, ...CLASSIC_KEYS.bottom.right]).toEqual(firstTen(3));
  });
});

describe("english Level 2 full sets", () => {
  it("builds top windows left then right for AC-2", () => {
    expect(englishGroups("top", 2)).toEqual([["qwe"], ["wer"], ["ert"], ["yui"], ["uio"], ["iop"]]);
  });

  it("builds bottom windows left then right for AC-2", () => {
    expect(englishGroups("bottom", 2)).toEqual([
      ["zxc"],
      ["xcv"],
      ["cvb"],
      ["nm,"],
      ["m,."],
      [",./"],
    ]);
  });

  it("keeps every Level 2 token as three distinct chars with no back to back for AC-2", () => {
    for (const category of ["home", "top", "bottom", "all"] as const) {
      for (const group of englishGroups(category, 2)) {
        const token = group[0];
        expect(token).toHaveLength(3);
        expect(new Set(token).size).toBe(3);
      }
    }
  });
});

describe("english Level 3 full sets", () => {
  it("builds home mixed groups for AC-3", () => {
    expect(englishGroups("home", 3)).toEqual(mixedTriples(CLASSIC_KEYS.home));
  });

  it("builds top mixed groups for AC-3", () => {
    expect(englishGroups("top", 3)).toEqual([["qpe"], ["wor"], ["eit"], ["ruq"], ["tyw"]]);
  });

  it("keeps every row-local Level 3 token as three distinct chars (All L3 is sentences)", () => {
    for (const category of ["home", "top", "bottom"] as const) {
      for (const group of englishGroups(category, 3)) {
        const token = group[0];
        expect(token).toHaveLength(3);
        expect(new Set(token).size).toBe(3);
      }
    }
  });
});

describe("englishGroups validation", () => {
  it("rejects out of range difficulties for AC-7", () => {
    expect(() => englishGroups("home", 0)).toThrow();
    expect(() => englishGroups("home", 5)).toThrow();
    expect(() => englishGroups("all", 99)).toThrow();
  });
});
