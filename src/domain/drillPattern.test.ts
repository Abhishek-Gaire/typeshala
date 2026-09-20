/** Drill pattern generator tests (spec 0017 AC-1, AC-2, AC-3, AC-7, AC-9). */
import { describe, expect, it } from "vitest";
import {
  CLASSIC_KEYS,
  buildPrompt,
  englishGroups,
  mirrorPairs,
  mixedTriples,
  sameHandTriples,
} from "./drillPattern";
import { classicRowsFor } from "./classicLayout";

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
  it("builds Level 1 from the category pairs and unions the rows for All", () => {
    expect(englishGroups("home", 1)).toEqual(mirrorPairs(CLASSIC_KEYS.home));
    expect(englishGroups("top", 1)).toEqual(mirrorPairs(CLASSIC_KEYS.top));
    expect(englishGroups("bottom", 1)).toEqual(mirrorPairs(CLASSIC_KEYS.bottom));
    expect(englishGroups("all", 1)).toEqual([
      ...mirrorPairs(CLASSIC_KEYS.home),
      ...mirrorPairs(CLASSIC_KEYS.top),
      ...mirrorPairs(CLASSIC_KEYS.bottom),
    ]);
    expect(englishGroups("all", 1)).toHaveLength(15);
  });

  it("builds Level 2 as left then right windows, All as one window per hand per row", () => {
    expect(englishGroups("home", 2)).toEqual([
      ["asd"],
      ["sdf"],
      ["dfg"],
      ["hjk"],
      ["jkl"],
      ["kl;"],
    ]);
    expect(englishGroups("all", 2)).toEqual([["asd"], ["hjk"], ["qwe"], ["yui"], ["zxc"], ["nm,"]]);
  });

  it("builds Level 3 as mixed groups, All as two groups per row", () => {
    expect(englishGroups("bottom", 3)).toEqual(mixedTriples(CLASSIC_KEYS.bottom));
    expect(englishGroups("all", 3)).toEqual([["a;d"], ["slf"], ["qpe"], ["wor"], ["z/c"], ["x.v"]]);
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

  it("keeps every generated token on its screen key set", () => {
    for (const category of ["home", "top", "bottom", "all"] as const) {
      const keys = keysFor(category);
      for (const difficulty of [1, 2, 3]) {
        for (const group of englishGroups(category, difficulty)) {
          for (const token of group) {
            for (const char of token) {
              expect(keys.has(char), `${category} ${token} uses ${char}`).toBe(true);
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

  it("keeps every Level 3 token as three distinct chars with no back to back for AC-3", () => {
    for (const category of ["home", "top", "bottom", "all"] as const) {
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
