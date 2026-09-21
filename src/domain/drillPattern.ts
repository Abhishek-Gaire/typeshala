/**
 * Classic drill pattern generators (specs 0017, 0019).
 * English rows are built from the screen key set plus a level rule.
 * Pure code with no framework imports.
 */
import type { ClassicCategory } from "./classicLayout";
import type { LayoutId } from "./datastore";

/** One drill row before its prompt is built. */
export interface DrillSpec {
  id: string;
  layout: LayoutId;
  title: string;
  order: number;
  category: ClassicCategory;
  difficulty: number;
  /** Ordered token groups. A group is emitted whole on every repeat. */
  groups: string[][];
  /** How many times each group is emitted. */
  repeat: number;
}

/** The three drill key rows, in All screen order. */
export type DrillKeyRow = "home" | "top" | "bottom";

/** Physical key set per screen, the same five rows the keyboard paints. */
export const CLASSIC_KEYS: Record<DrillKeyRow, { left: string[]; right: string[] }> = {
  home: { left: ["a", "s", "d", "f", "g"], right: ["h", "j", "k", "l", ";"] },
  top: { left: ["q", "w", "e", "r", "t"], right: ["y", "u", "i", "o", "p"] },
  bottom: { left: ["z", "x", "c", "v", "b"], right: ["n", "m", ",", ".", "/"] },
};

/**
 * All Level 3 review sentences (not char triples).
 * Each sentence is one group of word tokens, emitted once.
 * Covers a-z plus `, . / ;`, capitals teach Shift.
 * Vetted: no consecutive duplicate chars (spaces excluded),
 * so the existing char-level lint still passes.
 */
export const ALL_L3_SENTENCES: string[] = [
  "The quick brown fox jumps over the lazy dog.",
  "Pack my box with five dozen liquor jugs.",
  "Vex a dwarf, jog, blink quickly.",
  "Crazy Frederick bought many jugs of whisky.",
  "Sip cup and/or juice; relax, enjoy calm air.",
  "Bright vixens waltz; nymphs quiz jack doves.",
  "How vexingly quick daft zebras jump.",
  "Five boxing wizards jump quickly.",
];

/** All Level 3 groups: each sentence split into its word tokens. */
export function allLevel3SentenceGroups(): string[][] {
  return ALL_L3_SENTENCES.map((s) => s.split(/\s+/).filter((t) => t.length > 0));
}

const PAIR_MEMBER_REPEAT = 3;

/**
 * All Level 2 finger column triples (spec 0019), top then home then bottom
 * of the same finger, left hand columns then right hand columns.
 */
export function columnTriples(): string[][] {
  const triples: string[][] = [];
  for (let i = 0; i < 5; i++) {
    triples.push([
      `${CLASSIC_KEYS.top.left[i]}${CLASSIC_KEYS.home.left[i]}${CLASSIC_KEYS.bottom.left[i]}`,
    ]);
  }
  for (let i = 0; i < 5; i++) {
    triples.push([
      `${CLASSIC_KEYS.top.right[i]}${CLASSIC_KEYS.home.right[i]}${CLASSIC_KEYS.bottom.right[i]}`,
    ]);
  }
  return triples;
}

/**
 * All Level 1 vertical pairs (spec 0019): per finger column, top with home
 * then home with bottom, each member tripled, in column order.
 */
export function columnPairs(): string[][] {
  const pairs: string[][] = [];
  for (let i = 0; i < 5; i++) {
    const top = CLASSIC_KEYS.top.left[i];
    const home = CLASSIC_KEYS.home.left[i];
    const bottom = CLASSIC_KEYS.bottom.left[i];
    pairs.push([top.repeat(PAIR_MEMBER_REPEAT), home.repeat(PAIR_MEMBER_REPEAT)]);
    pairs.push([home.repeat(PAIR_MEMBER_REPEAT), bottom.repeat(PAIR_MEMBER_REPEAT)]);
  }
  for (let i = 0; i < 5; i++) {
    const top = CLASSIC_KEYS.top.right[i];
    const home = CLASSIC_KEYS.home.right[i];
    const bottom = CLASSIC_KEYS.bottom.right[i];
    pairs.push([top.repeat(PAIR_MEMBER_REPEAT), home.repeat(PAIR_MEMBER_REPEAT)]);
    pairs.push([home.repeat(PAIR_MEMBER_REPEAT), bottom.repeat(PAIR_MEMBER_REPEAT)]);
  }
  return pairs;
}

/** Level 1 groups: left[i] with right[4 - i], each pair member tripled. */
export function mirrorPairs(keys: { left: string[]; right: string[] }): string[][] {
  if (keys.left.length === 0 || keys.left.length !== keys.right.length) {
    throw new Error("drill pattern: mirror pairs need equal non-empty hands");
  }
  return keys.left.map((left, i) => [
    left.repeat(PAIR_MEMBER_REPEAT),
    keys.right[keys.right.length - 1 - i].repeat(PAIR_MEMBER_REPEAT),
  ]);
}

/** Level 2 groups: the three sliding windows of three keys on one hand. */
export function sameHandTriples(hand: string[]): string[][] {
  if (hand.length < 3) {
    throw new Error("drill pattern: a hand needs at least three keys for triples");
  }
  const triples: string[][] = [];
  for (let i = 0; i + 3 <= hand.length; i++) {
    triples.push([hand.slice(i, i + 3).join("")]);
  }
  return triples;
}

/** Level 3 groups: left[i], right[4 - i], left[i + 2] joined as one token. */
export function mixedTriples(keys: { left: string[]; right: string[] }): string[][] {
  if (keys.left.length === 0 || keys.left.length !== keys.right.length) {
    throw new Error("drill pattern: mixed triples need equal non-empty hands");
  }
  return keys.left.map((left, i) => [
    `${left}${keys.right[keys.right.length - 1 - i]}${keys.left[(i + 2) % keys.left.length]}`,
  ]);
}

/**
 * Token groups for one English screen and level.
 * All Level 1 uses cross row vertical pairs, All Level 2 uses finger
 * column triples (spec 0019). All Level 3 is review sentences (repeat 1).
 */
export function englishGroups(category: ClassicCategory, difficulty: number): string[][] {
  if (difficulty === 1) {
    if (category === "all") return columnPairs();
    return mirrorPairs(CLASSIC_KEYS[category]);
  }
  if (difficulty === 2) {
    if (category === "all") return columnTriples();
    const keys = CLASSIC_KEYS[category];
    return [...sameHandTriples(keys.left), ...sameHandTriples(keys.right)];
  }
  if (difficulty === 3) {
    if (category === "all") return allLevel3SentenceGroups();
    return mixedTriples(CLASSIC_KEYS[category]);
  }
  throw new Error(`drill pattern: unsupported difficulty ${String(difficulty)}`);
}

/** Join groups into a prompt: each group emitted repeat times, single spaces. */
export function buildPrompt(groups: string[][], repeat: number): string {
  if (!Number.isInteger(repeat) || repeat < 1) {
    throw new Error(`drill pattern: repeat must be a positive integer, got ${String(repeat)}`);
  }
  if (groups.length === 0) {
    throw new Error("drill pattern: at least one group is required");
  }
  const emissions: string[] = [];
  for (const group of groups) {
    if (group.length === 0) {
      throw new Error("drill pattern: a group must hold at least one token");
    }
    for (const token of group) {
      if (token.length === 0) {
        throw new Error("drill pattern: a token must not be empty");
      }
      if (/\s/.test(token)) {
        throw new Error("drill pattern: a token must not hold whitespace");
      }
    }
    const text = group.join(" ");
    for (let i = 0; i < repeat; i++) emissions.push(text);
  }
  return emissions.join(" ");
}
