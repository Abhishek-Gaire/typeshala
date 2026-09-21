/** Next key plus finger hint for qwerty prompts (spec 0004). */

/** Finger name used by the virtual keyboard hint. */
export type Finger = "pinky" | "ring" | "middle" | "index" | "thumb";

/** Lit key plus the finger that should press it. */
export interface KeyHint {
  key: string;
  finger: Finger;
}

const LEFT_PINKY = new Set(["`", "1", "q", "a", "z"]);
const LEFT_RING = new Set(["2", "w", "s", "x"]);
const LEFT_MIDDLE = new Set(["3", "e", "d", "c"]);
const LEFT_INDEX = new Set(["4", "5", "r", "t", "f", "g", "v", "b"]);
const RIGHT_INDEX = new Set(["6", "7", "y", "u", "h", "j", "n", "m"]);
const RIGHT_MIDDLE = new Set(["8", "i", "k", ","]);
const RIGHT_RING = new Set(["9", "o", "l", "."]);
const RIGHT_PINKY = new Set(["0", "-", "=", "p", "[", "]", "}", ";", "'", "/"]);

/** Map a prompt char to its physical key plus finger. Space uses thumb. */
export function nextKey(char: string): KeyHint {
  if (char === " ") return { key: "Space", finger: "thumb" };
  const lower = char.toLowerCase();
  const key = char === ";" ? ";" : lower.toUpperCase();
  let finger: Finger = "index";
  if (LEFT_PINKY.has(lower)) finger = "pinky";
  else if (LEFT_RING.has(lower)) finger = "ring";
  else if (LEFT_MIDDLE.has(lower)) finger = "middle";
  else if (LEFT_INDEX.has(lower)) finger = "index";
  else if (RIGHT_INDEX.has(lower)) finger = "index";
  else if (RIGHT_MIDDLE.has(lower)) finger = "middle";
  else if (RIGHT_RING.has(lower)) finger = "ring";
  else if (RIGHT_PINKY.has(lower)) finger = "pinky";
  return { key, finger };
}
