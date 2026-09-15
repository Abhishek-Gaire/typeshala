/**
 * Transient falling words game state (spec 0010).
 * Pure logic only, never touches the lesson store.
 * Tick uses elapsed time so speed stays fair on slow machines.
 */

export type GamePhase = "idle" | "active" | "paused" | "done";

/** One falling word on screen. Transient, never saved. */
export interface GameWord {
  id: string;
  text: string;
  lane: number;
  y: number;
  speed: number;
}

/** Transient run state. Score derives from cleared plus level. */
export interface GameState {
  phase: GamePhase;
  score: number;
  lives: number;
  level: number;
  cleared: number;
  missed: number;
  words: GameWord[];
  buffer: string;
  elapsedMs: number;
  spawnInMs: number;
}

export const START_LIVES = 3;
export const START_SPEED_PX_S = 40;
export const SPEED_GAIN_PER_LEVEL = 0.1;
export const CLEARS_PER_LEVEL = 8;
export const MAX_WORDS = 3;
export const SPAWN_MS = 1500;
export const FALL_HEIGHT = 400;

/**
 * Clean bundled `Lesson.prompt` text into playable tokens.
 * Split on non letters, drop tokens shorter than 2, dedupe.
 */
export function cleanWords(prompts: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const prompt of prompts) {
    // Split on anything outside ASCII letters plus the Devanagari block.
    // The range is a plain block range, no combined emoji or surrogate pair,
    // so the misleading class warning does not apply here.
    // eslint-disable-next-line no-misleading-character-class
    for (const token of prompt.split(/[^A-Za-z\u0900-\u097F]+/u)) {
      if (token.length < 2 || seen.has(token)) continue;
      seen.add(token);
      out.push(token);
    }
  }
  return out;
}

function speedFor(level: number): number {
  return START_SPEED_PX_S * (1 + SPEED_GAIN_PER_LEVEL * (level - 1));
}

/** Random source for spawns. Inject a stub in tests for deterministic runs. */
export type Rng = () => number;

/** Start a run from a cleaned word list. Empty list throws. */
export function startGame(words: string[], rng: Rng = Math.random): GameState {
  if (words.length === 0) throw new Error("empty word list");
  const first = spawnWord(words, 0, 1, rng);
  return {
    phase: "active",
    score: 0,
    lives: START_LIVES,
    level: 1,
    cleared: 0,
    missed: 0,
    words: [first],
    buffer: "",
    elapsedMs: 0,
    spawnInMs: SPAWN_MS,
  };
}

function spawnWord(words: string[], elapsedMs: number, level: number, rng: Rng): GameWord {
  const text = words[Math.floor(rng() * words.length)] ?? "";
  return {
    id: `w${String(elapsedMs)}-${String(Math.floor(rng() * 1000000))}`,
    text,
    lane: rng(),
    y: 0,
    speed: speedFor(level),
  };
}

/** Advance fall positions by elapsed ms. Returns landed words as misses. */
export function tickGame(
  state: GameState,
  words: string[],
  deltaMs: number,
  rng: Rng = Math.random,
): GameState {
  if (state.phase !== "active") return state;
  const elapsedMs = state.elapsedMs + deltaMs;
  let { lives, missed, spawnInMs, level } = state;
  const { cleared, score } = state;
  let landed = 0;
  const moved = state.words
    .map((w) => ({ ...w, y: w.y + (w.speed * deltaMs) / 1000 }))
    .filter((w) => {
      if (w.y >= FALL_HEIGHT) {
        missed += 1;
        lives -= 1;
        landed += 1;
        return false;
      }
      return true;
    });
  spawnInMs -= deltaMs;
  const live = [...moved];
  if (spawnInMs <= 0 && live.length < MAX_WORDS && words.length > 0) {
    live.push(spawnWord(words, elapsedMs, level, rng));
    spawnInMs = SPAWN_MS;
  }
  const nextLevel = 1 + Math.floor(cleared / CLEARS_PER_LEVEL);
  if (nextLevel !== level) level = nextLevel;
  const phase: GamePhase = lives <= 0 ? "done" : "active";
  return {
    ...state,
    phase,
    lives,
    missed,
    cleared,
    level,
    words: live,
    buffer: landed > 0 ? "" : state.buffer,
    elapsedMs,
    spawnInMs,
    score,
  };
}

/**
 * Match a keystroke against shown words.
 * Buffer grows per key, backspace edits it, full match clears the word.
 * qwerty match is case insensitive, Devanagari match is exact.
 */
export function typeGame(state: GameState, key: string): GameState {
  if (state.phase !== "active") return state;
  let buffer = key === "Backspace" ? state.buffer.slice(0, -1) : state.buffer + key;
  if (buffer.length > 24) buffer = buffer.slice(-24);
  const norm = (s: string) => (/[\u0900-\u097F]/.test(s) ? s : s.toLowerCase());
  const hit = state.words.find((w) => norm(w.text) === norm(buffer));
  if (hit === undefined) return { ...state, buffer };
  const cleared = state.cleared + 1;
  const level = 1 + Math.floor(cleared / CLEARS_PER_LEVEL);
  return {
    ...state,
    buffer: "",
    cleared,
    level,
    score: state.score + 10 * level,
    words: state.words.filter((w) => w.id !== hit.id),
  };
}
