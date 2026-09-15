/** Session hook holding prompt vs typed plus live scores (spec 0004). */
import { useMemo, useRef, useState } from "react";
import { calcAccuracy, calcWpm, countCorrect, deriveFinalErrors } from "../../domain/scoring";
import { nextKey } from "../../domain/keymap";
import type { NewAttempt } from "../../domain/datastore";

export interface SessionApi {
  typed: string;
  /** Completed prompt units for unit scored layouts, null for char layouts. */
  units: string[] | null;
  keystrokes: number;
  errorHits: number;
  done: boolean;
  wpm: number;
  accuracy: number;
  hint: string;
  finger: string;
  finalErrors: number[];
  typeChar: (char: string) => void;
  backspace: () => void;
  reset: () => void;
  buildAttempt: (lessonId: string, startedIso: string, durationMs: number) => NewAttempt;
}

/** Track typing against a prompt with cumulative error hits for accuracy. */
export function useTypingSession(prompt: string, fingerGuidance: boolean): SessionApi {
  const [typed, setTyped] = useState("");
  const [keystrokes, setKeystrokes] = useState(0);
  const [errorHits, setErrorHits] = useState(0);
  const startRef = useRef<number | null>(null);

  const done = typed.length >= prompt.length && prompt.length > 0;
  const elapsed = startRef.current === null ? 0 : Date.now() - startRef.current;
  const wpm = useMemo(
    () => calcWpm(countCorrect(prompt, typed), elapsed),
    [prompt, typed, elapsed],
  );
  const accuracy = calcAccuracy(keystrokes, errorHits);
  const upcoming = done ? "" : (prompt[typed.length] ?? "");
  const mapped = upcoming.length === 0 ? null : nextKey(upcoming);
  const finalErrors = useMemo(() => deriveFinalErrors(prompt, typed), [prompt, typed]);

  return {
    typed,
    units: null,
    keystrokes,
    errorHits,
    done,
    wpm,
    accuracy,
    hint: mapped?.key ?? "",
    finger: fingerGuidance ? (mapped?.finger ?? "") : "",
    finalErrors,
    typeChar(char: string) {
      if (done) return;
      if (startRef.current === null) startRef.current = Date.now();
      const expected = prompt[typed.length];
      setTyped((prev) => (prev.length >= prompt.length ? prev : prev + char));
      setKeystrokes((k) => k + 1);
      if (char !== expected) setErrorHits((e) => e + 1);
    },
    backspace() {
      setTyped((prev) => prev.slice(0, -1));
    },
    reset() {
      setTyped("");
      setKeystrokes(0);
      setErrorHits(0);
      startRef.current = null;
    },
    buildAttempt(lessonId: string, startedIso: string, durationMs: number) {
      const safeDuration = Math.max(durationMs, 1);
      return {
        lessonId,
        layout: "qwerty",
        startedAt: startedIso,
        durationMs: safeDuration,
        wpm: calcWpm(countCorrect(prompt, typed), safeDuration),
        accuracy: calcAccuracy(keystrokes, errorHits),
        errors: deriveFinalErrors(prompt, typed),
        completed: true,
      };
    },
  };
}
