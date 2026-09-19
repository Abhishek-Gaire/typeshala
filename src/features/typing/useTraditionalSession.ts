/** Traditional session hook: Preeti keys in, Devanagari units out (spec 0007). */
import { useEffect, useMemo, useRef, useState } from "react";
import { calcAccuracy, calcWpm } from "../../domain/scoring";
import {
  advancePreeti,
  countCorrectUnits,
  deriveFinalUnitErrors,
  exactCommitPreeti,
  isCombiningMark,
  sequenceForPreeti,
  splitUnits,
} from "../../domain/preeti";
import { nextKey } from "../../domain/keymap";
import type { NewAttempt } from "../../domain/datastore";
import type { SessionApi } from "./useTypingSession";

/** Traditional session adds the remaining Preeti sequence for hints. */
export interface TraditionalSessionApi extends SessionApi {
  /** Remaining physical keys for the next unit, empty for spaces or unknown. */
  sequenceHint: string;
  /** Pending combining mark typed before its base, for immediate feedback. */
  pendingMark: string;
}

interface TraditionalState {
  units: string[];
  buffer: string;
  keystrokes: number;
  errorHits: number;
  wrongKey: string | null;
}

const FRESH: TraditionalState = {
  units: [],
  buffer: "",
  keystrokes: 0,
  errorHits: 0,
  wrongKey: null,
};

/**
 * Track typing against a Devanagari prompt through Preeti sequences.
 * Same SessionApi shape as the other hooks so TypingView binds to one
 * interface, plus `units` for per unit coloring. Units per spec 0007:
 * correct counts completed Devanagari units (chars, matras, conjunct
 * clusters), keystrokes plus errorHits count physical presses.
 * One state object so fast keystrokes never read stale values.
 */
export function useTraditionalSession(
  prompt: string,
  fingerGuidance: boolean,
): TraditionalSessionApi {
  const [state, setState] = useState<TraditionalState>(FRESH);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const promptUnits = useMemo(() => splitUnits(prompt), [prompt]);
  const { units, buffer, keystrokes, errorHits, wrongKey } = state;
  const typed = useMemo(() => units.join(""), [units]);
  const done = units.length >= promptUnits.length && promptUnits.length > 0;

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
    // Keystrokes/units re-run the effect so the interval actually starts
    // on the first key: startRef mutation alone never re-renders.
  }, [done, promptUnits.length, keystrokes, units.length]);

  const wpm = useMemo(
    () => calcWpm(countCorrectUnits(promptUnits, units), elapsedMs),
    [promptUnits, units, elapsedMs],
  );
  const accuracy = calcAccuracy(keystrokes, errorHits);
  const upcoming = done ? "" : (promptUnits[units.length] ?? "");
  const sequence = upcoming === "" || upcoming === " " ? "" : sequenceForPreeti(upcoming);
  // While keys stay pending, guide the next key of the sequence so multi-key
  // units (pre-posed i-matra, vowel composition) show step by step progress.
  const onPath = sequence !== "" && buffer !== "" && sequence.startsWith(buffer);
  const stepAt = onPath ? Math.min(buffer.length, sequence.length - 1) : 0;
  const hintKey = sequence === "" ? upcoming : sequence.charAt(stepAt);
  const mapped = hintKey === "" ? null : nextKey(hintKey === " " ? " " : hintKey);
  const sequenceHint = sequence === "" ? "" : sequence.slice(stepAt);
  // A pending attaching mark (pre-posed ि) is shown at once so the press
  // never looks ignored while it waits for its base consonant. Only when it
  // is on the expected sequence, so a stray mark never lights up.
  const settledPending = buffer === "" ? null : exactCommitPreeti(buffer);
  const pendingMark =
    onPath && settledPending !== null && isCombiningMark(settledPending) ? settledPending : "";
  const finalErrors = useMemo(
    () => deriveFinalUnitErrors(promptUnits, units),
    [promptUnits, units],
  );

  function startClock() {
    if (startRef.current === null) startRef.current = Date.now();
  }

  return {
    typed,
    units,
    keystrokes,
    errorHits,
    wrongKey,
    done,
    wpm,
    accuracy,
    hint: mapped?.key ?? "",
    finger: fingerGuidance ? (mapped?.finger ?? "") : "",
    sequenceHint,
    pendingMark,
    finalErrors,
    typeChar(char: string) {
      if (done) return;
      startClock();
      if (char === " ") {
        // Wrong keys never advance: a space first completes a pending
        // unit when it matches, then commits itself only when a space
        // is expected. Otherwise the miss is counted, pending keys are
        // dropped, cursor holds.
        setState((prev) => {
          const miss = {
            ...prev,
            buffer: "",
            keystrokes: prev.keystrokes + 1,
            errorHits: prev.errorHits + 1,
            wrongKey: char,
          };
          if (promptUnits.length === 0) return miss;
          let nextUnits = prev.units;
          if (prev.buffer !== "") {
            const flushed = exactCommitPreeti(prev.buffer);
            if (flushed === null || flushed !== promptUnits[nextUnits.length]) return miss;
            nextUnits = [...nextUnits, flushed];
          }
          if (promptUnits[nextUnits.length] !== " ") {
            // Space was only the terminator for the pending unit.
            return {
              units: nextUnits.slice(0, promptUnits.length),
              buffer: "",
              keystrokes: prev.keystrokes + 1,
              errorHits: prev.errorHits,
              wrongKey: null,
            };
          }
          const doneUnits = [...nextUnits, " "].slice(0, promptUnits.length);
          if (doneUnits.length >= promptUnits.length) {
            return {
              units: doneUnits,
              buffer: "",
              keystrokes: prev.keystrokes + 1,
              errorHits: prev.errorHits,
              wrongKey: null,
            };
          }
          return {
            ...prev,
            units: doneUnits,
            buffer: "",
            keystrokes: prev.keystrokes + 1,
            wrongKey: null,
          };
        });
        return;
      }
      setState((prev) => {
        // Extendable short units (k before फ, t before थ, c before आ) hold
        // in the buffer until they settle or the next key resolves them.
        const baseUnits = prev.units;
        const step = advancePreeti(prev.buffer, char);
        const base = baseUnits.length;
        if (step.commits.length === 0) {
          // A short unit that also leads a longer sequence (k before फ,
          // t before थ, c before आ) can settle now when it is exactly the
          // unit the drill expects, instead of waiting for the next key.
          const settled = step.buffer === "" ? null : exactCommitPreeti(step.buffer);
          if (settled !== null && base < promptUnits.length && settled === promptUnits[base]) {
            return {
              units: [...baseUnits, settled].slice(0, promptUnits.length),
              buffer: "",
              keystrokes: prev.keystrokes + 1,
              errorHits: prev.errorHits,
              wrongKey: null,
            };
          }
          // Otherwise hold the keys, no verdict yet.
          return {
            units: baseUnits,
            buffer: step.buffer,
            keystrokes: prev.keystrokes + 1,
            errorHits: prev.errorHits,
            wrongKey: prev.wrongKey,
          };
        }
        let misses = 0;
        const kept: string[] = [];
        for (let i = 0; i < step.commits.length; i++) {
          if (base + i < promptUnits.length) {
            if (step.commits[i] !== promptUnits[base + i]) misses++;
            kept.push(step.commits[i]);
          }
        }
        if (misses > 0 || step.error) {
          // Wrong key: count the miss, drop the pending keys, hold.
          return {
            units: baseUnits,
            buffer: "",
            keystrokes: prev.keystrokes + 1,
            errorHits: prev.errorHits + misses + (step.error ? 1 : 0),
            wrongKey: char,
          };
        }
        let nextUnits = [...baseUnits, ...kept];
        let buffer = step.buffer;
        if (
          buffer !== "" &&
          promptUnits.length > 0 &&
          nextUnits.length + 1 === promptUnits.length
        ) {
          const flushed = exactCommitPreeti(buffer);
          if (flushed !== null && flushed === promptUnits[nextUnits.length]) {
            nextUnits = [...nextUnits, flushed];
            buffer = "";
          }
        }
        return {
          units: nextUnits,
          buffer,
          keystrokes: prev.keystrokes + 1,
          errorHits: prev.errorHits,
          wrongKey: null,
        };
      });
    },
    backspace() {
      setState((prev) =>
        prev.buffer !== ""
          ? { ...prev, buffer: "", wrongKey: null }
          : { ...prev, units: prev.units.slice(0, -1), wrongKey: null },
      );
    },
    reset() {
      setState(FRESH);
      setElapsedMs(0);
      startRef.current = null;
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    },
    buildAttempt(lessonId: string, startedIso: string, durationMs: number) {
      const safeDuration = Math.max(durationMs, 1);
      return {
        lessonId,
        layout: "traditional",
        startedAt: startedIso,
        durationMs: safeDuration,
        wpm: calcWpm(countCorrectUnits(promptUnits, units), safeDuration),
        accuracy: calcAccuracy(keystrokes, errorHits),
        errors: deriveFinalUnitErrors(promptUnits, units),
        completed: true,
      } satisfies NewAttempt;
    },
  };
}

/** Full Preeti sequence hint for the next Devanagari unit, empty for spaces. */
export function usePreetiSequenceHint(prompt: string, completedUnits: string[]): string {
  const upcoming = splitUnits(prompt)[completedUnits.length] ?? "";
  if (upcoming === "" || upcoming === " ") return "";
  return sequenceForPreeti(upcoming);
}
