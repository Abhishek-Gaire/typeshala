/**
 * Classic drill pattern generators (spec 0017).
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

const KEY_ROWS: DrillKeyRow[] = ["home", "top", "bottom"];

const PAIR_MEMBER_REPEAT = 3;

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
 * All is a mixed review: Level 2 samples the first window per hand per row,
 * Level 3 samples the first two mixed groups per row.
 */
export function englishGroups(category: ClassicCategory, difficulty: number): string[][] {
  if (difficulty === 1) {
    if (category === "all") return KEY_ROWS.flatMap((row) => mirrorPairs(CLASSIC_KEYS[row]));
    return mirrorPairs(CLASSIC_KEYS[category]);
  }
  if (difficulty === 2) {
    if (category === "all") {
      return KEY_ROWS.flatMap((row) => {
        const keys = CLASSIC_KEYS[row];
        const leftWindows = sameHandTriples(keys.left);
        const rightWindows = sameHandTriples(keys.right);
        if (leftWindows.length === 0 || rightWindows.length === 0) {
          throw new Error("drill pattern: a hand needs at least one triple window");
        }
        return [leftWindows[0], rightWindows[0]];
      });
    }
    const keys = CLASSIC_KEYS[category];
    return [...sameHandTriples(keys.left), ...sameHandTriples(keys.right)];
  }
  if (difficulty === 3) {
    if (category === "all") {
      return KEY_ROWS.flatMap((row) => {
        const groups = mixedTriples(CLASSIC_KEYS[row]).slice(0, 2);
        if (groups.length < 2) {
          throw new Error("drill pattern: a row needs at least two mixed groups");
        }
        return groups;
      });
    }
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
