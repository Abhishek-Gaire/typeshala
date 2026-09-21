/**
 * Preeti font key map transcribed from the reference charts
 * `public/preeti1.png`, `public/preeti2.png`, and `public/preeti3.png`.
 *
 * The charts print rows as `Character = Keys`. Keys list physical presses in
 * order and use `+` only for readability, so `k+m` means press `k` then `m`.
 * `Alt+NNNN` entries are legacy Windows code points for glyphs that have no
 * direct key on a modern board.
 *
 * This is reference data. The scored runtime map lives in
 * `src/domain/preeti.ts`; extend that one when a lesson needs a new unit.
 * Alt-glyph names are best effort from small chart text.
 *
 * The PNG charts are screenshots from third-party websites. This project does
 * not own them; they are bundled for reference only and all rights remain with
 * their original authors. This transcription is provided on the same basis.
 */

/** One chart row: the produced character plus the physical key sequence. */
export interface PreetiKeyEntry {
  /** Devanagari character or mark produced by the sequence. */
  character: string;
  /** Physical keys in order, `+` separated as printed in the chart. */
  keys: string;
}

/** Vowels, consonants, conjuncts, and matras from the main chart table. */
export const PREETI_KEYMAP: PreetiKeyEntry[] = [
  // independent vowels
  { character: "अ", keys: "c" },
  { character: "आ", keys: "c+f" },
  { character: "इ", keys: "O" },
  { character: "ई", keys: "O+{" },
  { character: "उ", keys: "p" },
  { character: "ऊ", keys: "p+m" },
  { character: "ऋ", keys: "C" },
  { character: "ए", keys: "P" },
  { character: "ऐ", keys: "P+]" },
  { character: "ओ", keys: "c+f+]" },
  { character: "औ", keys: "c+f+}" },
  { character: "अं", keys: "c++" },
  { character: "अ:", keys: "c+M" },

  // consonants
  { character: "क", keys: "s" },
  { character: "ख", keys: "v" },
  { character: "ग", keys: "u" },
  { character: "घ", keys: "3" },
  { character: "ङ", keys: "Alt+0170" },
  { character: "च", keys: "r" },
  { character: "छ", keys: "5" },
  { character: "ज", keys: "h" },
  { character: "झ", keys: "e+m" },
  { character: "ञ", keys: "`" },
  { character: "ट", keys: "6" },
  { character: "ठ", keys: "7" },
  { character: "ड", keys: "8" },
  { character: "ढ", keys: "9" },
  { character: "ण", keys: "0+f" },
  { character: "त", keys: "t" },
  { character: "थ", keys: "y" },
  { character: "द", keys: "b" },
  { character: "ध", keys: "w" },
  { character: "न", keys: "g" },
  { character: "प", keys: "k" },
  { character: "फ", keys: "k+m" },
  { character: "ब", keys: "a" },
  { character: "भ", keys: "e" },
  { character: "म", keys: "d" },
  { character: "य", keys: "o" },
  { character: "र", keys: "/" },
  { character: "ल", keys: "n" },
  { character: "व", keys: "j" },
  { character: "श", keys: "z" },
  { character: "ष", keys: "i+f" },
  { character: "स", keys: ";" },
  { character: "ह", keys: "x" },

  // conjuncts
  { character: "क्ष", keys: "I+f" },
  { character: "त्र", keys: "q" },
  { character: "ज्ञ", keys: "1" },
  { character: "त्त", keys: "Q" },
  { character: "क्त", keys: "Q+m" },
  { character: "द्ध", keys: "4" },
  { character: "द्य", keys: "B" },
  { character: "द्द", keys: "2" },
  { character: "दृ", keys: "b+[" },
  { character: "रु", keys: "?" },
  { character: "श्र", keys: ">" },
  { character: "ऱ", keys: "X" },
  { character: "ट्ट", keys: "Alt+0248" },
  { character: "द्व", keys: "Alt+0216" },
  { character: "ट्ट", keys: "Alt+0204" },
  { character: "ठ्ठ", keys: "Alt+0136" },
  { character: "ट्ठ", keys: "Alt+0229" },
  { character: "हृ", keys: "Alt+0155" },
  { character: "रू", keys: "Alt+0191" },
  { character: "ङ्ख", keys: "x|" },
  { character: "ङ्क", keys: "X" },
  { character: "ङ्ग", keys: "Alt+0132" },

  // half forms and dead consonants
  { character: "ष", keys: "S" },
  { character: "ख्", keys: "V" },
  { character: "ग्", keys: "U" },
  { character: "घ्", keys: "Alt+0163" },
  { character: "झ्", keys: "(Alt+0170)+\\" },
  { character: "च्", keys: "R" },
  { character: "ज्", keys: "H" },
  { character: "झ", keys: "Alt+0137" },
  { character: "ण्", keys: "0" },
  { character: "त्", keys: "T" },
  { character: "थ्", keys: "Y" },
  // Chart W row is ambiguous at chart size (likely misread): the runtime
  // follows the unanimous Shuvayatra mirror (W -> half ध), see the
  // differences note. Full ङ lives on "," in the app.
  { character: "ङ्", keys: "W" },
  { character: "न्", keys: "G" },
  { character: "प्", keys: "K" },
  { character: "फ्", keys: "Alt+0207" },
  { character: "ब्", keys: "A" },
  { character: "भ्", keys: "E" },
  { character: "व्", keys: "J" },
  { character: "श्", keys: "Z" },
  { character: "ह्", keys: "X" },
  { character: "र्", keys: "Alt+0165+o" },

  // matras and signs
  { character: "ा", keys: "f" },
  { character: "ि", keys: "l" },
  { character: "ी", keys: "L" },
  { character: "ु", keys: "'" },
  { character: "ू", keys: '"' },
  { character: "ृ", keys: "[" },
  { character: "े", keys: "]" },
  { character: "ै", keys: "}" },
  { character: "ं", keys: "+" },
  { character: "ः", keys: "M" },
  { character: "ँ", keys: "F" },
  { character: "्", keys: "\\" },
  { character: "्र", keys: "|" },
  { character: "ञ्", keys: "~" },
];

/** Legacy Alt-code glyphs that have no entry in the main chart table. */
export const PREETI_ALT_KEYMAP: PreetiKeyEntry[] = [
  { character: "‘", keys: "Alt+0133" },
  { character: "ष", keys: "Alt+0136" },
  { character: "ञ्", keys: "Alt+0139" },
  { character: "ऱ", keys: "Alt+0140" },
  { character: "‘", keys: "Alt+0145" },
  { character: "ङ्", keys: "Alt+0149" },
  { character: "–", keys: "Alt+0150" },
  { character: "—", keys: "Alt+0151" },
  { character: ";", keys: "Alt+0152" },
  { character: "ँ", keys: "Alt+0161" },
  { character: "द्द", keys: "Alt+0162" },
  { character: "्र", keys: "Alt+0165" },
  { character: "ऱ", keys: "Alt+0167" },
  { character: "ट्ठ", keys: "Alt+0171" },
  { character: "ट्ठ", keys: "Alt+0176" },
  { character: "+", keys: "Alt+0177" },
  { character: "झ", keys: "Alt+0180" },
  { character: "ॠ", keys: "Alt+0205" },
  { character: "ॡ", keys: "Alt+0206" },
  { character: "…", keys: "Alt+0210" },
  { character: "=", keys: "Alt+0214" },
  { character: ";", keys: "Alt+0217" },
  { character: "’", keys: "Alt+0218" },
  { character: "!", keys: "Alt+0219" },
  { character: "%", keys: "Alt+0220" },
  { character: "द्य", keys: "Alt+0223" },
  { character: "”", keys: "Alt+0230" },
  { character: "ॐ", keys: "Alt+0231" },
  { character: "/", keys: "Alt+0247" },
];

/** Devanagari digits, punctuation, and marks from the charts. */
export const PREETI_SYMBOL_KEYMAP: PreetiKeyEntry[] = [
  { character: "१", keys: "!" },
  { character: "२", keys: "@" },
  { character: "३", keys: "#" },
  { character: "४", keys: "$" },
  { character: "५", keys: "%" },
  { character: "६", keys: "^" },
  { character: "७", keys: "&" },
  { character: "८", keys: "*" },
  { character: "९", keys: "(" },
  { character: "०", keys: ")" },
  { character: "।", keys: "." },
  { character: ",", keys: "," },
  { character: "(", keys: "-" },
  { character: ")", keys: "_" },
  { character: "?", keys: "<" },
  { character: "”", keys: "Alt+0198" },
];

const ALL_ENTRIES: PreetiKeyEntry[] = [
  ...PREETI_KEYMAP,
  ...PREETI_ALT_KEYMAP,
  ...PREETI_SYMBOL_KEYMAP,
];

/** Every chart sequence that produces a character, chart order preserved. */
export function keysForCharacter(character: string): string[] {
  return ALL_ENTRIES.filter((entry) => entry.character === character).map((entry) => entry.keys);
}

/** Every chart character a printed key sequence produces, order preserved. */
export function charactersForKeys(keys: string): string[] {
  return ALL_ENTRIES.filter((entry) => entry.keys === keys).map((entry) => entry.character);
}
