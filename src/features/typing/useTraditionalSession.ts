/** Traditional session hook: Preeti keys in, Devanagari units out (spec 0007). */
import { useMemo, useRef, useState } from "react";
import { calcAccuracy, calcWpm } from "../../domain/scoring";
import {
  advancePreeti,
  countCorrectUnits,
  deriveFinalUnitErrors,
  exactCommitPreeti,
  sequenceForPreeti,
  splitUnits,
} from "../../domain/preeti";
import { nextKey } from "../../domain/keymap";
import type { NewAttempt } from "../../domain/datastore";
import type { SessionApi } from "./useTypingSession";

interface TraditionalState {
  units: string[];
  buffer: string;
  keystrokes: number;
  errorHits: number;
}

const FRESH: TraditionalState = { units: [], buffer: "", keystrokes: 0, errorHits: 0 };

/**
 * Track typing against a Devanagari prompt through Preeti sequences.
 * Same SessionApi shape as the other hooks so TypingView binds to one
 * interface, plus `units` for per unit coloring. Units per spec 0007:
 * correct counts completed Devanagari units (chars, matras, conjunct
 * clusters), keystrokes plus errorHits count physical presses.
 * One state object so fast keystrokes never read stale values.
 */
export function useTraditionalSession(prompt: string, fingerGuidance: boolean): SessionApi {
  const [state, setState] = useState<TraditionalState>(FRESH);
  const startRef = useRef<number | null>(null);

  const promptUnits = useMemo(() => splitUnits(prompt), [prompt]);
  const { units, keystrokes, errorHits } = state;
  const typed = useMemo(() => units.join(""), [units]);
  const done = units.length >= promptUnits.length && promptUnits.length > 0;
  const elapsed = startRef.current === null ? 0 : Date.now() - startRef.current;
  const wpm = useMemo(
    () => calcWpm(countCorrectUnits(promptUnits, units), elapsed),
    [promptUnits, units, elapsed],
  );
  const accuracy = calcAccuracy(keystrokes, errorHits);
  const upcoming = done ? "" : (promptUnits[units.length] ?? "");
  const sequence = upcoming === "" || upcoming === " " ? "" : sequenceForPreeti(upcoming);
  const firstKey = sequence === "" ? upcoming : sequence.charAt(0);
  const mapped = firstKey === "" ? null : nextKey(firstKey === " " ? " " : firstKey);
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
    done,
    wpm,
    accuracy,
    hint: mapped?.key ?? "",
    finger: fingerGuidance ? (mapped?.finger ?? "") : "",
    finalErrors,
    typeChar(char: string) {
      if (done) return;
      startClock();
      if (char === " ") {
        setState((prev) => {
          if (promptUnits.length === 0) {
            return {
              ...prev,
              buffer: "",
              keystrokes: prev.keystrokes + 1,
              errorHits: prev.errorHits + 1,
            };
          }
          let nextUnits = prev.units;
          let misses = 0;
          const flushed = exactCommitPreeti(prev.buffer);
          if (flushed !== null) {
            if (flushed !== promptUnits[nextUnits.length]) misses += 1;
            nextUnits = [...nextUnits, flushed].slice(0, promptUnits.length);
            if (nextUnits.length >= promptUnits.length) {
              return {
                units: nextUnits,
                buffer: "",
                keystrokes: prev.keystrokes + 1,
                errorHits: prev.errorHits + misses,
              };
            }
          }
          const expected = promptUnits[nextUnits.length];
          if (expected === " ") {
            return {
              ...prev,
              units: [...nextUnits, " "].slice(0, promptUnits.length),
              buffer: "",
              keystrokes: prev.keystrokes + 1,
              errorHits: prev.errorHits + misses,
            };
          }
          return {
            ...prev,
            units: nextUnits,
            buffer: "",
            keystrokes: prev.keystrokes + 1,
            errorHits: prev.errorHits + misses + 1,
          };
        });
        return;
      }
      setState((prev) => {
        // Short units (a/t/p) are extendable (ai/th/ph), so they sit
        // pending. When the pending buffer already equals the expected
        // unit, flush it first so "t"+"h" after त still aligns instead
        // of merging into थ.
        let baseUnits = prev.units;
        let startBuffer = prev.buffer;
        if (promptUnits.length > 0 && startBuffer !== "") {
          const flushed = exactCommitPreeti(startBuffer);
          const expected = promptUnits[baseUnits.length];
          if (flushed !== null && flushed === expected) {
            baseUnits = [...baseUnits, flushed].slice(0, promptUnits.length);
            startBuffer = "";
          }
        }
        const step = advancePreeti(startBuffer, char);
        const base = baseUnits.length;
        let misses = 0;
        const kept: string[] = [];
        for (let i = 0; i < step.commits.length; i++) {
          if (base + i < promptUnits.length) {
            if (step.commits[i] !== promptUnits[base + i]) misses++;
            kept.push(step.commits[i]);
          }
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
          errorHits: prev.errorHits + misses + (step.error ? 1 : 0),
        };
      });
    },
    backspace() {
      setState((prev) =>
        prev.buffer !== "" ? { ...prev, buffer: "" } : { ...prev, units: prev.units.slice(0, -1) },
      );
    },
    reset() {
      setState(FRESH);
      startRef.current = null;
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
