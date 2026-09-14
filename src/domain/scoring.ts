/**
 * Typing scores plus session state (spec 0004).
 * Pure domain code with no framework imports.
 */

/** Session phase: idle to active on first key, active to done at last char. */
export type SessionStatus = "idle" | "active" | "done";

/** Minimal typing session held by the view hook. */
export interface TypingSession {
  status: SessionStatus;
  typed: string;
  keystrokes: number;
  errorHits: number;
  startedAt: number | null;
}

/** Fresh session before any key. */
export function newSession(): TypingSession {
  return { status: "idle", typed: "", keystrokes: 0, errorHits: 0, startedAt: null };
}

/**
 * Words per minute: correct chars divided by 5 divided by minutes elapsed.
 * Returns 0 when time has not passed yet.
 */
export function calcWpm(correctChars: number, durationMs: number): number {
  if (durationMs <= 0 || correctChars <= 0) return 0;
  const minutes = durationMs / 60000;
  return Math.round((correctChars / 5 / minutes) * 10) / 10;
}

/**
 * Accuracy: keystrokes minus error hits divided by keystrokes times 100.
 * Error hits counts each wrong press even if later fixed by backspace.
 */
export function calcAccuracy(keystrokes: number, errorHits: number): number {
  if (keystrokes <= 0) return 100;
  const value = ((keystrokes - errorHits) / keystrokes) * 100;
  return Math.round(value * 10) / 10;
}

/** Count prompt chars that match typed chars in order. */
export function countCorrect(prompt: string, typed: string): number {
  let good = 0;
  const limit = Math.min(prompt.length, typed.length);
  for (let i = 0; i < limit; i++) {
    if (typed[i] === prompt[i]) good++;
  }
  return good;
}

/**
 * Final error spots in prompt order after corrections.
 * Holds prompt indexes where typed char exists and differs.
 */
export function deriveFinalErrors(prompt: string, typed: string): number[] {
  const spots: number[] = [];
  const limit = Math.min(prompt.length, typed.length);
  for (let i = 0; i < limit; i++) {
    if (typed[i] !== prompt[i]) spots.push(i);
  }
  return spots;
}
