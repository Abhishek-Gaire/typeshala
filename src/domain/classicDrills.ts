/**
 * Bundled classic drill rows. English rows are generated from the screen key
 * set plus a level rule (specs 0017, 0019); Traditional rows are compact token
 * groups with one repeat count (spec 0015, counts corrected by spec 0017,
 * All L1/L2 cross row groups by spec 0019).
 * L1 allows repeats, L2/L3 never repeat back to back.
 * Exception: All L3 English and All L3 Traditional are review sentences (repeat 1), not triples.
 */
import { buildPrompt, englishGroups, type DrillKeyRow, type DrillSpec } from "./drillPattern";
import { drillPassesDifficulty } from "./classicLayout";
import { splitUnits } from "./preeti";
import type { Lesson } from "./datastore";

/** English (QWERTY) row meta plus generated groups, spec 0017. */
const ENGLISH_SPECS: DrillSpec[] = [
  {
    id: "cl-home-1-en",
    layout: "qwerty",
    title: "Home L1",
    order: 201,
    category: "home",
    difficulty: 1,
    groups: englishGroups("home", 1),
    repeat: 10,
  },
  {
    id: "cl-home-2-en",
    layout: "qwerty",
    title: "Home L2",
    order: 202,
    category: "home",
    difficulty: 2,
    groups: englishGroups("home", 2),
    repeat: 10,
  },
  {
    id: "cl-home-3-en",
    layout: "qwerty",
    title: "Home L3",
    order: 203,
    category: "home",
    difficulty: 3,
    groups: englishGroups("home", 3),
    repeat: 10,
  },
  {
    id: "cl-top-1-en",
    layout: "qwerty",
    title: "Top L1",
    order: 204,
    category: "top",
    difficulty: 1,
    groups: englishGroups("top", 1),
    repeat: 10,
  },
  {
    id: "cl-top-2-en",
    layout: "qwerty",
    title: "Top L2",
    order: 205,
    category: "top",
    difficulty: 2,
    groups: englishGroups("top", 2),
    repeat: 10,
  },
  {
    id: "cl-top-3-en",
    layout: "qwerty",
    title: "Top L3",
    order: 206,
    category: "top",
    difficulty: 3,
    groups: englishGroups("top", 3),
    repeat: 10,
  },
  {
    id: "cl-bottom-1-en",
    layout: "qwerty",
    title: "Bottom L1",
    order: 207,
    category: "bottom",
    difficulty: 1,
    groups: englishGroups("bottom", 1),
    repeat: 10,
  },
  {
    id: "cl-bottom-2-en",
    layout: "qwerty",
    title: "Bottom L2",
    order: 208,
    category: "bottom",
    difficulty: 2,
    groups: englishGroups("bottom", 2),
    repeat: 10,
  },
  {
    id: "cl-bottom-3-en",
    layout: "qwerty",
    title: "Bottom L3",
    order: 209,
    category: "bottom",
    difficulty: 3,
    groups: englishGroups("bottom", 3),
    repeat: 10,
  },
  {
    id: "cl-all-1-en",
    layout: "qwerty",
    title: "All L1",
    order: 210,
    category: "all",
    difficulty: 1,
    groups: englishGroups("all", 1),
    repeat: 10,
  },
  {
    id: "cl-all-2-en",
    layout: "qwerty",
    title: "All L2",
    order: 211,
    category: "all",
    difficulty: 2,
    groups: englishGroups("all", 2),
    repeat: 10,
  },
  {
    id: "cl-all-3-en",
    layout: "qwerty",
    title: "All L3",
    order: 212,
    category: "all",
    difficulty: 3,
    groups: englishGroups("all", 3),
    repeat: 1,
  },
];

/** Copy token groups so each spec owns its arrays. */
function cloneGroups(groups: string[][]): string[][] {
  return groups.map((group) => [...group]);
}

/** Traditional L1 pair groups, shared by their row and the All screen. */
const TRADITIONAL_L1_GROUPS: Record<DrillKeyRow, string[][]> = {
  home: [["बस"], ["कि"], ["मप"], ["वा"], ["नज"]],
  top: [["त्रउ"], ["धय"], ["भई"], ["चग"], ["तथ"]],
  bottom: [["शर"], ["ह।"], ["खप"], ["दल"]],
};

// Freeze the shared tables: specs must clone before use, never mutate.
for (const row of Object.values(TRADITIONAL_L1_GROUPS)) {
  for (const group of row) Object.freeze(group);
  Object.freeze(row);
}
Object.freeze(TRADITIONAL_L1_GROUPS);

/** Traditional (Preeti) row meta plus rendered token groups, spec 0015 with spec 0017 counts.
 * Exception: All L3 is review sentences (repeat 1), mirroring All L3 English. */

/**
 * All Level 3 Traditional review sentences.
 * Each sentence is one group of word tokens, emitted once.
 * Vetted: every unit has a Preeti key sequence, no standalone i-matra,
 * zero back to back repeats with spaces ignored, so lint still passes.
 */
export const TRADITIONAL_ALL_L3_SENTENCES: string[] = [
  "राम्रो काम गर।",
  "धेरै राम्रो छ।",
  "सानी नानी खेल।",
  "बाबा घर आउ।",
  "आमा चिया बनाउ।",
  "दाजु किताब पढ।",
  "साथी बाटो हेर।",
  "पानी खा अनि जा।",
  "कलमले लेख।",
  "ठूलो झोला बोक।",
  "चामल भात खाउ।",
  "टोपी किनेर ल्याउ।",
  "शहर बजार घुम।",
  "पैसा हिसाब गर।",
  "गाउँ घर फर्क।",
  "नयाँ पुरानो साट।",
  "भाइ बहिनी बोल।",
  "बिहान उठेर हिँड।",
  "बेलुका खाना खाउ।",
];

/** Split each sentence into its word tokens: one group per sentence. */
function sentenceGroups(sentences: string[]): string[][] {
  return sentences.map((s) => s.split(/\s+/).filter((t) => t.length > 0));
}

/**
 * Traditional All L1 cross row pair tokens (spec 0019): 5 Home with Top
 * then 4 Home with Bottom, each a single token group emitted 30 times.
 */
export const TRADITIONAL_ALL_L1_TOKENS: string[] = [
  "बसत्रउ",
  "किधय",
  "मपभई",
  "वाचग",
  "नजतथ",
  "बसशर",
  "किह।",
  "मपखप",
  "वादल",
];

/**
 * Traditional All L2 cross row triple tokens (spec 0019), each a single
 * token group emitted 10 times. Vetted: every unit has a Preeti sequence,
 * no standalone i matra, zero back to back repeats across the joined prompt.
 */
export const TRADITIONAL_ALL_L2_TOKENS: string[] = [
  "बसित्र",
  "किमच",
  "वानश",
  "त्रबस",
  "धयख",
  "भईद",
  "शहम",
  "खपत",
  "दलक",
];
const TRADITIONAL_SPECS: DrillSpec[] = [
  {
    id: "cl-home-1-tr",
    layout: "traditional",
    title: "Home L1",
    order: 301,
    category: "home",
    difficulty: 1,
    groups: cloneGroups(TRADITIONAL_L1_GROUPS.home),
    repeat: 30,
  },
  {
    id: "cl-home-2-tr",
    layout: "traditional",
    title: "Home L2",
    order: 302,
    category: "home",
    difficulty: 2,
    groups: [["बसि"], ["किम"], ["वान"], ["मपव"], ["नजब"]],
    repeat: 10,
  },
  {
    id: "cl-home-3-tr",
    layout: "traditional",
    title: "Home L3",
    order: 303,
    category: "home",
    difficulty: 3,
    groups: [["बसकि"], ["मपवा"], ["नजमप"], ["बसनज"], ["किवा"]],
    repeat: 10,
  },
  {
    id: "cl-top-1-tr",
    layout: "traditional",
    title: "Top L1",
    order: 304,
    category: "top",
    difficulty: 1,
    groups: cloneGroups(TRADITIONAL_L1_GROUPS.top),
    repeat: 30,
  },
  {
    id: "cl-top-2-tr",
    layout: "traditional",
    title: "Top L2",
    order: 305,
    category: "top",
    difficulty: 2,
    groups: [["त्रधभ"], ["धयई"], ["भईच"], ["तथउ"], ["चगथ"]],
    repeat: 10,
  },
  {
    id: "cl-top-3-tr",
    layout: "traditional",
    title: "Top L3",
    order: 306,
    category: "top",
    difficulty: 3,
    groups: [["त्रधय"], ["भईच"], ["गथउ"], ["त्रभई"], ["धचग"], ["तथउ"], ["त्रधय"], ["भईच"]],
    repeat: 10,
  },
  {
    id: "cl-bottom-1-tr",
    layout: "traditional",
    title: "Bottom L1",
    order: 307,
    category: "bottom",
    difficulty: 1,
    groups: cloneGroups(TRADITIONAL_L1_GROUPS.bottom),
    repeat: 30,
  },
  {
    id: "cl-bottom-2-tr",
    layout: "traditional",
    title: "Bottom L2",
    order: 308,
    category: "bottom",
    difficulty: 2,
    groups: [["शहख"], ["शर"], ["खदल"], ["ह।"], ["खप"]],
    repeat: 10,
  },
  {
    id: "cl-bottom-3-tr",
    layout: "traditional",
    title: "Bottom L3",
    order: 309,
    category: "bottom",
    difficulty: 3,
    groups: [["शहख"], ["शर"], ["खदल"], ["ह।"], ["खप"], ["दल"], ["शर।"], ["हखप"]],
    repeat: 10,
  },
  {
    id: "cl-all-1-tr",
    layout: "traditional",
    title: "All L1",
    order: 310,
    category: "all",
    difficulty: 1,
    groups: TRADITIONAL_ALL_L1_TOKENS.map((token) => [token]),
    repeat: 30,
  },
  {
    id: "cl-all-2-tr",
    layout: "traditional",
    title: "All L2",
    order: 311,
    category: "all",
    difficulty: 2,
    groups: TRADITIONAL_ALL_L2_TOKENS.map((token) => [token]),
    repeat: 10,
  },
  {
    id: "cl-all-3-tr",
    layout: "traditional",
    title: "All L3",
    order: 312,
    category: "all",
    difficulty: 3,
    groups: sentenceGroups(TRADITIONAL_ALL_L3_SENTENCES),
    repeat: 1,
  },
];

/** Build a lesson row from its spec, computing the prompt at module load. */
function lessonFromSpec(spec: DrillSpec): Lesson {
  return {
    id: spec.id,
    layout: spec.layout,
    title: spec.title,
    order: spec.order,
    category: spec.category,
    difficulty: spec.difficulty,
    prompt: buildPrompt(spec.groups, spec.repeat),
  };
}

/** English (QWERTY) drill rows, specs 0017 and 0019. */
export const CLASSIC_DRILLS: Lesson[] = ENGLISH_SPECS.map(lessonFromSpec);

/** Traditional (Preeti) drill rows, spec 0015 with spec 0017 counts and spec 0019 All L1/L2. */
export const CLASSIC_DRILLS_TRADITIONAL: Lesson[] = TRADITIONAL_SPECS.map(lessonFromSpec);

/** All bundled drill rows: English plus Traditional, generated by specs 0017 and 0019. */
export const ALL_CLASSIC_DRILLS: Lesson[] = [...CLASSIC_DRILLS, ...CLASSIC_DRILLS_TRADITIONAL];

/** Lint every bundled drill row against the difficulty rule. */
export function lintClassicDrills(rows: Lesson[] = ALL_CLASSIC_DRILLS): string[] {
  const bad: string[] = [];
  for (const r of rows) {
    const diff = r.difficulty ?? 1;
    const units = splitUnits(r.prompt).filter((u) => u !== " ");
    if (!drillPassesDifficulty(units, diff)) bad.push(r.id);
  }
  return bad;
}
