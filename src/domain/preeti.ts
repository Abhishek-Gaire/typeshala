/**
 * Traditional Preeti to Devanagari step logic (spec 0007).
 * Pure domain code with no framework imports.
 *
 * Fixed Traditional key assignment for the tutor, in Preeti style
 * (one press per base glyph, aspirates plus diphthongs plus conjuncts
 * as short sequences). One sequence per Devanagari unit used in
 * lessons, no variants. Prompts may hold conjunct clusters (joined
 * letter groups) plus matra marks (vowel signs); each cluster or
 * signed char counts as one scoring unit (see `splitUnits`).
 *
 * Units in this file mean prompt units (single chars, matras, or
 * conjunct clusters), not raw chars. Callers pass completed unit
 * counts where `scoring.ts` takes correct chars; the WPM scale for
 * this layout is units per minute by design.
 */

/** One physical key sequence per Devanagari unit used in lessons. */
export const PREETI_MAP: Record<string, string> = {
  a: "अ",
  A: "आ",
  i: "इ",
  I: "ई",
  u: "उ",
  U: "ऊ",
  e: "ए",
  ai: "ऐ",
  o: "ओ",
  au: "औ",
  k: "क",
  K: "ख",
  g: "ग",
  G: "घ",
  W: "ङ",
  c: "च",
  C: "छ",
  j: "ज",
  J: "झ",
  Y: "ञ",
  T: "ट",
  Th: "ठ",
  D: "ड",
  Dh: "ढ",
  N: "ण",
  t: "त",
  th: "थ",
  d: "द",
  dh: "ध",
  n: "न",
  p: "प",
  ph: "फ",
  b: "ब",
  bh: "भ",
  m: "म",
  y: "य",
  r: "र",
  l: "ल",
  v: "व",
  s: "स",
  x: "श",
  S: "ष",
  h: "ह",
  f: "ा",
  F: "ि",
  q: "ी",
  Q: "ु",
  V: "ू",
  H: "े",
  E: "ो",
  M: "ं",
  "]kS": "क्ष",
  "]jY": "ज्ञ",
  "]tr": "त्र",
  "]xr": "श्र",
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
