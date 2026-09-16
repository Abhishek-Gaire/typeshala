/**
 * Classic practice shell domain (spec 0012).
 * Pure code with no framework imports.
 * Rows describe physical keys. Glyph labels come from layout
 * tables only, never from reading a screenshot.
 */
import { PREETI_MAP } from "./preeti";
import type { LayoutId, Lesson } from "./datastore";

export type ClassicKind = "char" | "modifier" | "space";
export type ClassicScreenId = "home" | "top" | "bottom" | "all" | "game" | "free";
export type ClassicCategory = "home" | "top" | "bottom" | "all";

/** One key on the classic five row board. */
export interface ClassicKey {
  code: string;
  row: number;
  kind: ClassicKind;
  /** Unshifted physical label, e.g. "d" or "4". */
  base: string;
  /** Shifted physical label where one exists, e.g. "D" or "$". */
  shifted?: string;
}

/** Physical geometry: number row plus Tab, Caps, Shift, Ctrl, Alt, Backspace, Enter, Space. */
const ROWS: Array<Array<{ code: string; base: string; shifted?: string; kind: ClassicKind }>> = [
  [
    { code: "Backquote", base: "`", shifted: "~", kind: "char" },
    { code: "Digit1", base: "1", shifted: "!", kind: "char" },
    { code: "Digit2", base: "2", shifted: "@", kind: "char" },
    { code: "Digit3", base: "3", shifted: "#", kind: "char" },
    { code: "Digit4", base: "4", shifted: "$", kind: "char" },
    { code: "Digit5", base: "5", shifted: "%", kind: "char" },
    { code: "Digit6", base: "6", shifted: "^", kind: "char" },
    { code: "Digit7", base: "7", shifted: "&", kind: "char" },
    { code: "Digit8", base: "8", shifted: "*", kind: "char" },
    { code: "Digit9", base: "9", shifted: "(", kind: "char" },
    { code: "Digit0", base: "0", shifted: ")", kind: "char" },
    { code: "Minus", base: "-", shifted: "_", kind: "char" },
    { code: "Equal", base: "=", shifted: "+", kind: "char" },
    { code: "Backspace", base: "Backspace", kind: "modifier" },
  ],
  [
    { code: "Tab", base: "Tab", kind: "modifier" },
    { code: "KeyQ", base: "q", shifted: "Q", kind: "char" },
    { code: "KeyW", base: "w", shifted: "W", kind: "char" },
    { code: "KeyE", base: "e", shifted: "E", kind: "char" },
    { code: "KeyR", base: "r", shifted: "R", kind: "char" },
    { code: "KeyT", base: "t", shifted: "T", kind: "char" },
    { code: "KeyY", base: "y", shifted: "Y", kind: "char" },
    { code: "KeyU", base: "u", shifted: "U", kind: "char" },
    { code: "KeyI", base: "i", shifted: "I", kind: "char" },
    { code: "KeyO", base: "o", shifted: "O", kind: "char" },
    { code: "KeyP", base: "p", shifted: "P", kind: "char" },
    { code: "BracketLeft", base: "[", shifted: "{", kind: "char" },
    { code: "BracketRight", base: "]", shifted: "}", kind: "char" },
    { code: "Backslash", base: "\\", shifted: "|", kind: "char" },
  ],
  [
    { code: "CapsLock", base: "Caps", kind: "modifier" },
    { code: "KeyA", base: "a", shifted: "A", kind: "char" },
    { code: "KeyS", base: "s", shifted: "S", kind: "char" },
    { code: "KeyD", base: "d", shifted: "D", kind: "char" },
    { code: "KeyF", base: "f", shifted: "F", kind: "char" },
    { code: "KeyG", base: "g", shifted: "G", kind: "char" },
    { code: "KeyH", base: "h", shifted: "H", kind: "char" },
    { code: "KeyJ", base: "j", shifted: "J", kind: "char" },
    { code: "KeyK", base: "k", shifted: "K", kind: "char" },
    { code: "KeyL", base: "l", shifted: "L", kind: "char" },
    { code: "Semicolon", base: ";", shifted: ":", kind: "char" },
    { code: "Quote", base: "'", shifted: '"', kind: "char" },
    { code: "Enter", base: "Enter", kind: "modifier" },
  ],
  [
    { code: "ShiftLeft", base: "Shift", kind: "modifier" },
    { code: "KeyZ", base: "z", shifted: "Z", kind: "char" },
    { code: "KeyX", base: "x", shifted: "X", kind: "char" },
    { code: "KeyC", base: "c", shifted: "C", kind: "char" },
    { code: "KeyV", base: "v", shifted: "V", kind: "char" },
    { code: "KeyB", base: "b", shifted: "B", kind: "char" },
    { code: "KeyN", base: "n", shifted: "N", kind: "char" },
    { code: "KeyM", base: "m", shifted: "M", kind: "char" },
    { code: "Comma", base: ",", shifted: "<", kind: "char" },
    { code: "Period", base: ".", shifted: ">", kind: "char" },
    { code: "Slash", base: "/", shifted: "?", kind: "char" },
    { code: "ShiftRight", base: "Shift", kind: "modifier" },
  ],
  [
    { code: "ControlLeft", base: "Ctrl", kind: "modifier" },
    { code: "AltLeft", base: "Alt", kind: "modifier" },
    { code: "Space", base: " ", kind: "space" },
    { code: "AltRight", base: "Alt", kind: "modifier" },
    { code: "ControlRight", base: "Ctrl", kind: "modifier" },
  ],
];

/** Full board rows with row numbers attached. Geometry is shared by every layout. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function classicRowsFor(_layout: LayoutId): ClassicKey[][] {
  return ROWS.map((row, i) =>
    row.map((k) => ({ code: k.code, row: i, kind: k.kind, base: k.base, shifted: k.shifted })),
  );
}

/** Glyph label for one key in a layout. Traditional uses the Preeti map inverse. */
export function glyphForKey(key: ClassicKey, layout: LayoutId): { main: string; alt?: string } {
  if (key.kind !== "char") return { main: "" };
  if (layout === "traditional") {
    const main = PREETI_MAP[key.base] ?? "";
    const alt = key.shifted !== undefined ? (PREETI_MAP[key.shifted] ?? undefined) : undefined;
    return { main, alt: alt === main ? undefined : alt };
  }
  const main = key.base.length === 1 ? key.base : "";
  return {
    main: /[a-z]/i.test(main) ? main.toUpperCase() : main,
    alt:
      key.shifted !== undefined &&
      key.shifted.length === 1 &&
      key.shifted !== key.base.toUpperCase()
        ? key.shifted
        : undefined,
  };
}

/** Old level names map to classic drill categories. Unknown maps to all. */
export function mapLevelToCategory(level?: string): ClassicCategory {
  if (level === "home-row") return "home";
  if (level === "top-row") return "top";
  if (level === "bottom-row") return "bottom";
  return "all";
}

/** True when the same unit appears twice in a row. */
export function hasConsecutiveRepeat(units: string[]): boolean {
  for (let i = 1; i < units.length; i++) {
    if (units[i] === units[i - 1]) return true;
  }
  return false;
}

/** Difficulty rule: L1 may repeat, L2 and L3 must not repeat back to back. */
export function drillPassesDifficulty(units: string[], difficulty: number): boolean {
  if (difficulty <= 1) return true;
  return !hasConsecutiveRepeat(units);
}

/** Filter bundled lessons to one classic drill screen. Old rows fall back via level map. */
export function lessonsForClassic(
  lessons: Lesson[],
  category: ClassicCategory,
  difficulty: number,
): Lesson[] {
  return lessons.filter((l) => {
    const cat = l.category ?? mapLevelToCategory(l.level);
    const diff = l.difficulty ?? 1;
    return cat === category && diff === difficulty;
  });
}

/** Code of the physical key that produces a typed char. Space maps to Space. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function codeForChar(char: string, _layout: LayoutId): string {
  if (char === " ") return "Space";
  for (const row of ROWS) {
    for (const k of row) {
      if (k.kind !== "char") continue;
      if (k.base === char || k.base.toLowerCase() === char.toLowerCase()) return k.code;
      if (k.shifted === char) return k.code;
    }
  }
  return "";
}

/** Code of the physical key that types the next unit. Space maps to Space. */
export function codeForNextUnit(next: string, layout: LayoutId): string {
  if (next === " ") return "Space";
  if (layout === "traditional") {
    for (const row of ROWS) {
      for (const k of row) {
        if (k.kind !== "char") continue;
        if (PREETI_MAP[k.base] === next) return k.code;
        if (k.shifted !== undefined && PREETI_MAP[k.shifted] === next) return k.code;
      }
    }
    return "";
  }
  const lower = next.toLowerCase();
  for (const row of ROWS) {
    for (const k of row) {
      if (k.kind !== "char") continue;
      if (k.base.toLowerCase() === lower) return k.code;
    }
  }
  return "";
}
