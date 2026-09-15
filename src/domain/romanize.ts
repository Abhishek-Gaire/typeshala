/**
 * Roman to Devanagari step logic (spec 0006).
 * Pure domain code with no framework imports.
 * One fixed sequence per char, no spelling variants.
 * Lessons use simple chars only: no conjuncts, no matras.
 */

/** One roman sequence per Devanagari char used in lessons. */
export const ROMAN_MAP: Record<string, string> = {
  a: "अ",
  aa: "आ",
  i: "इ",
  ii: "ई",
  u: "उ",
  uu: "ऊ",
  e: "ए",
  ai: "ऐ",
  o: "ओ",
  au: "औ",
  ka: "क",
  kha: "ख",
  ga: "ग",
  gha: "घ",
  nga: "ङ",
  ca: "च",
  cha: "छ",
  ja: "ज",
  jha: "झ",
  Ta: "ट",
  Tha: "ठ",
  Da: "ड",
  Dha: "ढ",
  Na: "ण",
  ta: "त",
  tha: "थ",
  da: "द",
  dha: "ध",
  na: "न",
  pa: "प",
  pha: "फ",
  ba: "ब",
  bha: "भ",
  ma: "म",
  ya: "य",
  ra: "र",
  la: "ल",
  va: "व",
  sha: "श",
  Sha: "ष",
  sa: "स",
  ha: "ह",
};

const SEQUENCES = Object.keys(ROMAN_MAP);

/** True when some known sequence starts with the buffer. */
function isPrefix(buffer: string): boolean {
  return SEQUENCES.some((s) => s.startsWith(buffer));
}

/** True when the buffer is exact and some longer sequence extends it. */
function isExtendable(buffer: string): boolean {
  return buffer in ROMAN_MAP && SEQUENCES.some((s) => s !== buffer && s.startsWith(buffer));
}

/** Outcome of feeding one roman key into the pending buffer. */
export interface RomanAdvance {
  commits: string[];
  buffer: string;
  error: boolean;
}

/**
 * Feed one roman key into the buffer.
 * Pending while the buffer could still grow into a known sequence.
 * Complete chars land in commits when fully matched.
 * When the buffer matches nothing, commit the longest exact prefix
 * first (so "ak" yields अ then a pending "k"), and flag error only
 * when no prefix matches at all (so "x" is one error hit).
 */
export function advanceRoman(buffer: string, key: string): RomanAdvance {
  const commits: string[] = [];
  let buf = buffer + key;
  for (;;) {
    const exact = buf in ROMAN_MAP ? ROMAN_MAP[buf] : undefined;
    if (exact !== undefined && !isExtendable(buf)) {
      commits.push(exact);
      return { commits, buffer: "", error: false };
    }
    if (isPrefix(buf)) return { commits, buffer: buf, error: false };
    let cut = -1;
    for (let c = buf.length - 1; c > 0; c--) {
      if (buf.slice(0, c) in ROMAN_MAP) {
        cut = c;
        break;
      }
    }
    if (cut < 0) return { commits, buffer: "", error: true };
    commits.push(ROMAN_MAP[buf.slice(0, cut)]);
    buf = buf.slice(cut);
  }
}

/** Devanagari char back to its roman sequence for hints. Empty when unknown. */
export function sequenceFor(char: string): string {
  for (const [seq, target] of Object.entries(ROMAN_MAP)) {
    if (target === char) return seq;
  }
  return "";
}

/**
 * Commit char for an exact pending buffer, null when not exact.
 * Used to flush a short vowel before a space or at the end of a prompt.
 */
export function exactCommit(buffer: string): string | null {
  return buffer !== "" && buffer in ROMAN_MAP ? ROMAN_MAP[buffer] : null;
}
