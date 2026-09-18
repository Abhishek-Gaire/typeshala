/** Session hook holding prompt vs typed plus live scores (spec 0004). */
import { useEffect, useMemo, useRef, useState } from "react";
import { calcAccuracy, calcWpm, countCorrect, deriveFinalErrors } from "../../domain/scoring";
import { nextKey } from "../../domain/keymap";
import type { NewAttempt } from "../../domain/datastore";

export interface SessionApi {
  typed: string;
  /** Completed prompt units for unit scored layouts, null for char layouts. */
  units: string[] | null;
  keystrokes: number;
  errorHits: number;
  /** Last wrongly pressed physical key, cleared on the next press. Null when none. */
  wrongKey: string | null;
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
  const [wrongKey, setWrongKey] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const done = typed.length >= prompt.length && prompt.length > 0;

  useEffect(() => {
    if (startRef.current !== null && !done) {
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - (startRef.current ?? Date.now()));
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
    // Keystrokes (and prompt) re-run the effect so the interval actually
    // starts on the first key: startRef mutation alone never re-renders.
  }, [done, keystrokes, prompt]);

  const wpm = useMemo(
    () => calcWpm(countCorrect(prompt, typed), elapsedMs),
    [prompt, typed, elapsedMs],
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
    wrongKey,
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
      setKeystrokes((k) => k + 1);
      if (char !== expected) {
        // Wrong key: count the miss but hold the cursor. Only the
        // expected key advances to the next unit.
        setErrorHits((e) => e + 1);
        setWrongKey(char);
        return;
      }
      setWrongKey(null);
      setTyped((prev) => (prev.length >= prompt.length ? prev : prev + char));
    },
    backspace() {
      setWrongKey(null);
      setTyped((prev) => prev.slice(0, -1));
    },
    reset() {
      setWrongKey(null);
      setTyped("");
      setKeystrokes(0);
      setErrorHits(0);
      setElapsedMs(0);
      startRef.current = null;
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
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
