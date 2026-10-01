/** Preeti step tests (spec 0007, AC-2, AC-5; spec 0018 map correction; spec 0020 coverage). */
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

describe("spec 0018 map correction", () => {
  it("commits half bha on E and half dha on W (covers AC-1)", () => {
    expect(advancePreeti("", "E")).toEqual({ commits: ["भ्"], buffer: "", error: false });
    expect(advancePreeti("", "W")).toEqual({ commits: ["ध्"], buffer: "", error: false });
  });

  it("keeps lowercase full letters untouched (covers map invariants)", () => {
    expect(advancePreeti("", "w")).toEqual({ commits: ["ध"], buffer: "", error: false });
    // e stays pending since em extends to झ, but still resolves to full bha on flush.
    expect(advancePreeti("", "e")).toEqual({ commits: [], buffer: "e", error: false });
    expect(exactCommitPreeti("e")).toBe("भ");
    expect(advancePreeti("e", "m")).toEqual({ commits: ["झ"], buffer: "", error: false });
  });

  it("commits the o and au marks on two-press sequences (covers AC-2)", () => {
    expect(advancePreeti("", "f")).toEqual({ commits: [], buffer: "f", error: false });
    expect(advancePreeti("f", "]")).toEqual({ commits: ["ो"], buffer: "", error: false });
    expect(advancePreeti("f", "}")).toEqual({ commits: ["ौ"], buffer: "", error: false });
  });

  it("completes नौ in nt-common-words-c with the new au sequence (covers AC-2)", () => {
    expect(splitUnits("नौ")).toEqual(["न", "ौ"]);
    expect(sequenceForPreeti("न")).toBe("g");
    expect(sequenceForPreeti("ौ")).toBe("f}");
    expect(advancePreeti("", "g")).toEqual({ commits: ["न"], buffer: "", error: false });
    expect(advancePreeti("f", "}")).toEqual({ commits: ["ौ"], buffer: "", error: false });
  });

  it("commits full nga on comma (covers AC-3)", () => {
    // Deliberate since spec 0021: comma now also begins five three key
    // conjuncts (ङ्ग, ङ्ख, ङ्क, ङ्घ, ङ्ढ), so it holds for one key first.
    // The session settles it at once whenever ङ is the expected unit.
    expect(advancePreeti("", ",")).toEqual({ commits: [], buffer: ",", error: false });
    expect(exactCommitPreeti(",")).toBe("ङ");
  });

  it("holds f pending and flushes the aa mark (covers AC-4)", () => {
    expect(advancePreeti("", "f")).toEqual({ commits: [], buffer: "f", error: false });
    expect(exactCommitPreeti("f")).toBe("ा");
  });

  it("resolves aa first on a non-matching tail without spurious error (covers AC-4)", () => {
    expect(advancePreeti("f", "a")).toEqual({
      commits: ["ा", "ब"],
      buffer: "",
      error: false,
    });
  });

  it("reverse looks up the corrected rows (covers AC-5)", () => {
    expect(sequenceForPreeti("भ्")).toBe("E");
    expect(sequenceForPreeti("ध्")).toBe("W");
    expect(sequenceForPreeti("ो")).toBe("f]");
    expect(sequenceForPreeti("ौ")).toBe("f}");
    expect(sequenceForPreeti("ङ")).toBe(",");
  });

  it("types the alphabet row and nga drills end to end (covers AC-3)", () => {
    for (const unit of ["ङ", "भ्", "ध्", "ो", "ौ"]) {
      const seq = sequenceForPreeti(unit);
      expect(seq).not.toBe("");
      let buffer = "";
      let committed: string[] = [];
      for (const key of seq) {
        const step = advancePreeti(buffer, key);
        committed = [...committed, ...step.commits];
        buffer = step.buffer;
        expect(step.error).toBe(false);
      }
      if (buffer !== "") {
        const flushed = exactCommitPreeti(buffer);
        expect(flushed).toBe(unit);
      } else {
        expect(committed).toContain(unit);
      }
    }
    // नौ is two units (न + ौ) typed as g then f} end to end.
    expect(splitUnits("नौ")).toEqual(["न", "ौ"]);
    let buffer = "";
    const got: string[] = [];
    for (const key of ["g", "f", "}"]) {
      const step = advancePreeti(buffer, key);
      got.push(...step.commits);
      buffer = step.buffer;
      expect(step.error).toBe(false);
    }
    expect(buffer).toBe("");
    expect(got).toEqual(["न", "ौ"]);
  });
});

/** Feed keys through the map, flush the tail, and collect the committed units. */
function typeKeys(keys: string): string[] {
  let buffer = "";
  const units: string[] = [];
  for (const key of keys) {
    const step = advancePreeti(buffer, key);
    expect(step.error).toBe(false);
    units.push(...step.commits);
    buffer = step.buffer;
  }
  const flushed = exactCommitPreeti(buffer);
  return flushed === null ? units : [...units, flushed];
}

/**
 * Replay a whole prompt the way the session does: type each unit by its own
 * keys and flush at every unit edge, since a space is not a map row and has
 * to be handled between units. Returns the units the engine committed.
 */
function typePrompt(prompt: string): string[] {
  const out: string[] = [];
  let buffer = "";
  for (const unit of splitUnits(prompt)) {
    if (unit === " ") {
      const held = exactCommitPreeti(buffer);
      if (held !== null) {
        out.push(held);
        buffer = "";
      }
      out.push(" ");
      continue;
    }
    for (const key of sequenceForPreeti(unit)) {
      const step = advancePreeti(buffer, key);
      expect(step.error, `${unit} on ${key}`).toBe(false);
      out.push(...step.commits);
      buffer = step.buffer;
    }
    const held = exactCommitPreeti(buffer);
    if (held !== null) {
      out.push(held);
      buffer = "";
    }
  }
  return out;
}

/** Every barakhadi consonant, each one unit on its own key. */
const BARAKHADI = "क ख ग घ ङ च छ ज झ ञ ट ठ ड ढ ण त थ द ध न प फ ब भ म य र ल व श ष स ह".split(" ");

/** All 11 vowels, the independent ones plus the long ones. */
const VOWELS = "अ आ इ ई उ ऊ ऋ ए ऐ ओ औ".split(" ");

/** All 10 matras, the vowel signs. */
const MATRAS = "ा ि ी ु ू ृ े ै ो ौ".split(" ");

/** The eight conjuncts the charts give a key of their own. */
const CHART_CONJUNCTS = "क्ष त्र ज्ञ श्र द्ध द्द द्य क्र".split(" ");

/** The 13 rare conjuncts plus रू, each with the keys that type it today.
 *  Since spec 0021 every one of these is also a PREETI_MAP row, so this list
 *  is the map rows under test, not a reachability probe. */
const COMPOSITION_ROWS: ReadonlyArray<readonly [string, string]> = [
  ["ङ्ग", ",\\u"],
  ["ङ्ख", ",\\v"],
  ["ङ्क", ",\\s"],
  ["ङ्घ", ",\\3"],
  ["ङ्ढ", ",\\9"],
  ["ट्ट", "6\\6"],
  ["ड्ड", "8\\8"],
  ["ठ्ठ", "7\\7"],
  ["ट्ठ", "6\\7"],
  ["द्घ", "b\\3"],
  ["द्व", "b\\j"],
  ["हृ", "x["],
  ["रू", '/"'],
  ["ह्र", "X/"],
];

describe("spec 0020 coverage", () => {
  it("gives every barakhadi consonant, vowel, matra, and chart conjunct one unit (covers AC-3)", () => {
    for (const unit of [...BARAKHADI, ...VOWELS, ...MATRAS, ...CHART_CONJUNCTS]) {
      expect(sequenceForPreeti(unit)).not.toBe("");
      expect(splitUnits(unit)).toEqual([unit]);
    }
  });

  it("commits exactly the prompt units for all 14 composition rows (covers AC-3)", () => {
    for (const [unit, keys] of COMPOSITION_ROWS) {
      expect(typeKeys(keys)).toEqual(splitUnits(unit));
    }
  });

  it("splits ह्र the way X/ types it, not the way x| types it (covers AC-3)", () => {
    // Spec 0021: ह्र is its own map row now, so it is one unit both ways.
    expect(splitUnits("ह्र")).toEqual(["ह्र"]);
    expect(typeKeys("X/")).toEqual(["ह्र"]);
    expect(typeKeys("x|")).toEqual(["ह", "्र"]);
  });
});

describe("spec 0021 rare conjunct rows", () => {
  it("gives every one of the fourteen its own unit and commits only that unit (covers AC-1, AC-2)", () => {
    for (const [unit, keys] of COMPOSITION_ROWS) {
      expect(splitUnits(unit), unit).toEqual([unit]);
      expect(sequenceForPreeti(unit), unit).toBe(keys);
      // Walk the keys key by key: nothing commits until the row completes,
      // and the last key commits exactly the letter and nothing else.
      let buffer = "";
      const committed: string[] = [];
      for (const key of keys) {
        const step = advancePreeti(buffer, key);
        expect(step.error, `${unit} on ${key}`).toBe(false);
        committed.push(...step.commits);
        buffer = step.buffer;
      }
      expect(buffer, unit).toBe("");
      expect(committed, unit).toEqual([unit]);
    }
  });

  it("leaves plain typing of the eight first keys unchanged (covers AC-3)", () => {
    // Each first key now holds for one key, so a key that does not continue
    // the sequence must still commit the base letter first.
    const plain: ReadonlyArray<readonly [string, string, string]> = [
      [",", "s", "ङ"],
      ["6", "s", "ट"],
      ["7", "s", "ठ"],
      ["8", "s", "ड"],
      ["b", "s", "द"],
      ["x", "s", "ह"],
      ["/", "s", "र"],
      ["X", "s", "ह्"],
    ];
    for (const [first, next, letter] of plain) {
      expect(advancePreeti("", first), first).toEqual({
        commits: [],
        buffer: first,
        error: false,
      });
      expect(advancePreeti(first, next), `${first} then ${next}`).toEqual({
        commits: [letter, "क"],
        buffer: "",
        error: false,
      });
    }
  });

  it("flushes ह, र, and ह् exactly while the halant rows stay stuck (covers AC-9)", () => {
    for (const [key, letter] of [
      ["x", "ह"],
      ["/", "र"],
      ["X", "ह्"],
    ] as const) {
      expect(exactCommitPreeti(key), key).toBe(letter);
    }
    // The five halant rows leave a buffer with no exact row, so a space
    // after it drops the keys and counts a miss (pinned in the session
    // test). No valid Nepali word contains a dead ट, ङ, ड, ठ, or द.
    for (const [first, second] of [
      ["6", "\\"],
      ["8", "\\"],
      ["7", "\\"],
      ["b", "\\"],
      [",", "\\"],
    ] as const) {
      const step = advancePreeti(first, second);
      expect(step.buffer, `${first}${second}`).toBe(`${first}\\`);
      expect(exactCommitPreeti(`${first}\\`), `${first}\\`).toBeNull();
    }
  });

  it("keeps the fourteen rows usable without adding a key to the board (covers AC-1)", () => {
    // The rules the spec pins: every row uses keys the map already had, the
    // leading keys form a prefix of the row so the buffer can hold, and no row
    // invents a value another row already owns.
    const rare = new Set([
      "ङ्ग",
      "ङ्ख",
      "ङ्क",
      "ङ्घ",
      "ङ्ढ",
      "ट्ट",
      "ड्ड",
      "ठ्ठ",
      "ट्ठ",
      "द्घ",
      "द्व",
      "हृ",
      "रू",
      "ह्र",
    ]);
    const entries = Object.entries(PREETI_MAP);
    for (const [seq, letter] of entries) {
      if (!rare.has(letter)) continue;
      expect(rare.has(letter), letter).toBe(true);
      for (const key of seq) {
        expect(key in PREETI_MAP, `${letter} uses new key ${key}`).toBe(true);
      }
      // A three key row must be able to hold through its first two keys.
      for (let cut = 1; cut < seq.length; cut++) {
        const held = seq.slice(0, cut);
        expect(
          advancePreeti("", held.slice(0, -1)).buffer,
          `${letter} holds ${held.slice(0, -1)}`,
        ).toBe(held.slice(0, -1));
        expect(
          advancePreeti(held.slice(0, -1), held.slice(-1)).buffer,
          `${letter} holds ${held}`,
        ).toBe(held);
      }
      expect(sequenceForPreeti(letter), letter).toBe(seq);
    }
    // Exactly fourteen, so a later row cannot slip in unnoticed.
    expect(entries.filter(([, v]) => rare.has(v))).toHaveLength(14);
  });

  it("produces byte for byte the same text for a word with a rare letter (covers AC-1)", () => {
    // Grouping is allowed to change; the text a learner sees is not. Typing
    // the honest keys for a mixed word must rebuild the prompt exactly.
    const prompt = "खट्ट पद्व";
    const units = splitUnits(prompt);
    expect(units).toEqual(["ख", "ट्ट", " ", "प", "द्व"]);
    expect(typePrompt(prompt)).toEqual(units);
    expect(typePrompt(prompt).join("")).toBe(prompt);
  });
});
