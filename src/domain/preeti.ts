/**
 * Traditional Preeti to Devanagari step logic (spec 0007).
 * Pure domain code with no framework imports.
 *
 * Real Traditional (Preeti) key assignment, physical-key based: each
 * string key below is the literal character a standard key (or Shift+key)
 * produces on a normal QWERTY board — this is the actual layout, not a
 * phonetic scheme. Cross-checked against the long-standing open-source
 * Preeti-to-Unicode mapping (Shuvayatra/preeti) and reduced to what a
 * modern browser keyboard event can express directly.
 *
 * Two behaviors beyond a flat lookup are required for correctness, and
 * both are handled as DATA (extra multi-key sequences below) rather than
 * new state-machine logic — the existing buffer/prefix matching in
 * `advancePreeti` already supports them once the table is right:
 *
 *   1. Pre-posed i-matra: "ि" (key `l`) is typed BEFORE its consonant
 *      (matching how it visually reads) but stored AFTER it in Unicode.
 *      Handled via explicit `l`+consonant sequences (e.g. "ls" -> "कि").
 *   2. Long-vowel composition: अ+ा=आ, अ+ा+े=ओ, अ+ा+ै=औ, ए+े=ऐ are each
 *      typed as 2-3 keystrokes but committed as one unit.
 *   3. Composed vowel marks: ो (f+]) and ौ (f+}) are typed as two presses
 *      but committed as one unit, matching the long-vowel pattern above.
 *   4. Consonant "upgrades": फ, झ, and ऊ have no key of their own — they
 *      come from a base key followed immediately by `m`. The physical
 *      `m` key has no letter on its own in Traditional; it only acts as
 *      this modifier right after क(प)/भ/उ's keys.
 *
 * Deliberately left out as single units (documented, not silent): 13 rare
 * conjuncts plus reph. All 13 are typeable today by halant and matra
 * composition (`,\s` for ङ्क, `6\7` for ट्ठ, `b\j` for द्व), but they score
 * as two or three units rather than one, which is a scoring decision, not a
 * missing key. `X` stays `ह्` and `x|` is not ङ्ख (that chart row is
 * misread; it composes to ह्र). Reph is blocked by dead key unreachability,
 * not by the map. Coverage evidence and triage:
 * docs/specs/0020-preeti-legacy-conjunct-gaps.md
 *
 * Units in this file mean prompt units (single chars, matras, or
 * conjunct clusters), not raw chars. Callers pass completed unit
 * counts where `scoring.ts` takes correct chars; the WPM scale for
 * this layout is units per minute by design.
 */

/** One physical key (or Shift+key literal) to its Traditional output. */
export const PREETI_MAP: Record<string, string> = {
  // independent vowels
  c: "अ",
  i: "ई",
  O: "इ",
  p: "उ",
  C: "ऋ",
  P: "ए",

  // long vowels, composed from short-vowel + matra keys typed in sequence
  cf: "आ",
  "cf]": "ओ",
  "cf}": "औ",
  "P]": "ऐ",

  // matras (vowel signs). "l" (ि) is pre-posed — see the l+consonant
  // combos below rather than relying on this single-key entry alone.
  f: "ा",
  l: "ि",
  L: "ी",
  "'": "ु",
  '"': "ू",
  "[": "ृ",
  "]": "े",
  "}": "ै",
  "f]": "ो",
  "f}": "ौ",
  F: "ँ",
  M: "ः",
  "+": "ं",

  // full consonants/conjuncts (base, digit-row, and single-key conjuncts)
  s: "क",
  v: "ख",
  u: "ग",
  "`": "ञ",
  r: "च",
  h: "ज",
  t: "त",
  y: "थ",
  b: "द",
  w: "ध",
  g: "न",
  k: "प",
  e: "भ",
  a: "ब",
  d: "म",
  o: "य",
  "/": "र",
  n: "ल",
  j: "व",
  z: "श",
  ";": "स",
  x: "ह",
  "3": "घ",
  "5": "छ",
  "6": "ट",
  "7": "ठ",
  "8": "ड",
  "9": "ढ",
  "1": "ज्ञ",
  q: "त्र",
  Q: "त्त",
  B: "द्य",

  // consonants with an inherent halant (Shift + base key)
  S: "ष",
  V: "ख्",
  U: "ग्",
  R: "च्",
  H: "ज्",
  T: "त्",
  Y: "थ्",
  D: "म्",
  W: "ध्",
  G: "न्",
  K: "प्",
  E: "भ्",
  A: "ब्",
  J: "व्",
  Z: "श्",
  X: "ह्",
  N: "ण",
  ":": "स्",

  // full ङ lives on comma (spec 0018): genuine Alt+0170 is unreachable
  // in browsers, and comma is otherwise unused by the map.
  ",": "ङ",

  // half-forms and short conjuncts living on the digit row
  "0": "ण्",
  "2": "द्द",
  "4": "द्ध",

  // conjunct only reachable via Shift, not otherwise covered
  I: "क्ष",

  // Devanagari digits (Shift + digit row — a clean 1:1, no legacy quirks)
  "!": "१",
  "@": "२",
  "#": "३",
  $: "४",
  "%": "५",
  "^": "६",
  "&": "७",
  "*": "८",
  "(": "९",
  ")": "०",

  // consonant "upgrades" — `m` has no letter of its own in Traditional;
  // it only acts as a modifier immediately after these specific keys
  km: "फ",
  em: "झ",
  pm: "ऊ",
  qm: "क्र",
  Qm: "क्त",

  // punctuation & marks
  ".": "।",
  "\\": "्",
  "|": "्र",
  "~": "ञ्",
  ">": "श्र",
  "?": "रु",

  // pre-posed i-matra combinations (l + consonant, typed in visual order)
  ls: "कि",
  lv: "खि",
  lu: "गि",
  "l`": "ञि",
  lr: "चि",
  lh: "जि",
  lt: "ति",
  ly: "थि",
  lb: "दि",
  lw: "धि",
  lg: "नि",
  lk: "पि",
  le: "भि",
  la: "बि",
  ld: "मि",
  lo: "यि",
  "l/": "रि",
  ln: "लि",
  lj: "वि",
  lz: "शि",
  "l;": "सि",
  lx: "हि",
  l3: "घि",
  l5: "छि",
  l6: "टि",
  l7: "ठि",
  l8: "डि",
  l9: "ढि",
  l1: "ज्ञि",
  lq: "त्रि",
  lQ: "त्ति",
  lB: "द्यि",
  lkm: "फि",
  lem: "झि",
};

const SEQUENCES = Object.keys(PREETI_MAP);

/** Multi char units (conjunct clusters), longest first for greedy split. */
const CLUSTERS = Object.values(PREETI_MAP)
  .filter((unit) => unit.length > 1)
  .sort((a, b) => b.length - a.length);

/** True when some known sequence starts with the buffer. */
function isPrefix(buffer: string): boolean {
  return SEQUENCES.some((s) => s.startsWith(buffer));
}

/** True when the buffer is exact and some longer sequence extends it. */
function isExtendable(buffer: string): boolean {
  return buffer in PREETI_MAP && SEQUENCES.some((s) => s !== buffer && s.startsWith(buffer));
}

/** Outcome of feeding one physical key into the pending buffer. */
export interface PreetiAdvance {
  commits: string[];
  buffer: string;
  error: boolean;
}

/**
 * Feed one physical key into the buffer.
 * Pending while the buffer could still grow into a known sequence.
 * Complete units land in commits when fully matched.
 * When the buffer matches nothing, commit the longest exact prefix
 * first and flag error only when no prefix matches at all.
 */
export function advancePreeti(buffer: string, key: string): PreetiAdvance {
  const commits: string[] = [];
  let buf = buffer + key;
  for (;;) {
    const exact = buf in PREETI_MAP ? PREETI_MAP[buf] : undefined;
    if (exact !== undefined && !isExtendable(buf)) {
      commits.push(exact);
      return { commits, buffer: "", error: false };
    }
    if (isPrefix(buf)) return { commits, buffer: buf, error: false };
    let cut = -1;
    for (let c = buf.length - 1; c > 0; c--) {
      if (buf.slice(0, c) in PREETI_MAP) {
        cut = c;
        break;
      }
    }
    if (cut < 0) return { commits, buffer: "", error: true };
    commits.push(PREETI_MAP[buf.slice(0, cut)]);
    buf = buf.slice(cut);
  }
}

/** True for a single Devanagari mark that must shape with a base before it.
 * Separate spans break the shaper and draw a dotted circle placeholder. */
export function isCombiningMark(unit: string): boolean {
  return unit.length === 1 && /[\u0900-\u0903\u093A-\u094F\u0951-\u0957\u0962\u0963]/.test(unit);
}

/** Devanagari unit back to its physical sequence for hints. Empty when unknown. */
export function sequenceForPreeti(unit: string): string {
  for (const [seq, target] of Object.entries(PREETI_MAP)) {
    if (target === unit) return seq;
  }
  return "";
}

/**
 * Commit unit for an exact pending buffer, null when not exact.
 * Used to flush a short unit before a space or at the end of a prompt.
 */
export function exactCommitPreeti(buffer: string): string | null {
  return buffer !== "" && buffer in PREETI_MAP ? PREETI_MAP[buffer] : null;
}

/**
 * Split a prompt into scoring units: conjunct clusters stay whole,
 * every other char (letters, matras, spaces) is its own unit.
 * Greedy longest match so क्ष never splits into क plus halant plus ष.
 */
export function splitUnits(prompt: string): string[] {
  const units: string[] = [];
  let at = 0;
  while (at < prompt.length) {
    const cluster = CLUSTERS.find((c) => prompt.startsWith(c, at));
    if (cluster !== undefined) {
      units.push(cluster);
      at += cluster.length;
    } else {
      units.push(prompt[at]);
      at += 1;
    }
  }
  return units;
}

/** Count prompt units that match typed units in order. */
export function countCorrectUnits(promptUnits: string[], typedUnits: string[]): number {
  let good = 0;
  const limit = Math.min(promptUnits.length, typedUnits.length);
  for (let i = 0; i < limit; i++) {
    if (typedUnits[i] === promptUnits[i]) good++;
  }
  return good;
}

/**
 * Final error spots in prompt unit order after corrections.
 * Holds unit indexes where a typed unit exists and differs.
 */
export function deriveFinalUnitErrors(promptUnits: string[], typedUnits: string[]): number[] {
  const spots: number[] = [];
  const limit = Math.min(promptUnits.length, typedUnits.length);
  for (let i = 0; i < limit; i++) {
    if (typedUnits[i] !== promptUnits[i]) spots.push(i);
  }
  return spots;
}
