/** Romanized session hook: roman keys in, Devanagari units out (specs 0006, 0022). */
import { useEffect, useMemo, useRef, useState } from "react";
import { calcAccuracy, calcWpm } from "../../domain/scoring";
import { countCorrectUnits, deriveFinalUnitErrors, splitUnits } from "../../domain/preeti";
import { advanceRoman, exactCommit, sequenceFor } from "../../domain/romanize";
import { nextKey } from "../../domain/keymap";
import { verifyLog } from "../../infrastructure/tauriApi";
import type { NewAttempt } from "../../domain/datastore";
import type { SessionApi } from "./useTypingSession";

/** Romanized session adds the remaining roman sequence for hints. */
export interface RomanizedSessionApi extends SessionApi {
  /** Remaining roman keys for the next unit, empty for spaces or unknown. */
  sequenceHint: string;
}

interface RomanState {
  units: string[];
  buffer: string;
  keystrokes: number;
  errorHits: number;
  wrongKey: string | null;
}

const FRESH: RomanState = {
  units: [],
  buffer: "",
  keystrokes: 0,
  errorHits: 0,
  wrongKey: null,
};

/**
 * Track typing against a Devanagari prompt through roman sequences.
 * Same SessionApi shape as the other hooks so the classic views bind to
 * one interface, plus `units` for per unit coloring. Units per spec
 * 0006: correct counts completed Devanagari chars, keystrokes plus
 * errorHits count roman presses.
 * One state object so fast keystrokes never read stale values.
 */
export function useRomanizedSession(prompt: string, fingerGuidance: boolean): RomanizedSessionApi {
  const [state, setState] = useState<RomanState>(FRESH);
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
  const sequence = upcoming === "" || upcoming === " " ? "" : sequenceFor(upcoming);
  // While keys stay pending, guide the next key of the sequence so
  // extendable sequences (a before aa, k before ka) show step by step.
  const onPath = sequence !== "" && buffer !== "" && sequence.startsWith(buffer);
  const stepAt = onPath ? Math.min(buffer.length, sequence.length - 1) : 0;
  const hintKey = sequence === "" ? upcoming : sequence.charAt(stepAt);
  const mapped = hintKey === "" ? null : nextKey(hintKey === " " ? " " : hintKey);
  // Display name of the due key, kept as a string so effects and renders that
  // read it do not churn on a fresh object every tick.
  const hintDisplay = mapped?.key ?? "";
  const sequenceHint = sequence === "" ? "" : sequence.slice(stepAt);
  const finalErrors = useMemo(
    () => deriveFinalUnitErrors(promptUnits, units),
    [promptUnits, units],
  );

  // Verification trail (spec 0022, `/check verify`): one line per state change
  // carries the pressed key evidence, the buffer, the committed units, and the
  // guidance values, so typing behavior is checkable from logs alone. Live
  // speed stays out on purpose: it ticks every 100ms and would drown the
  // events that matter, so this fires once per key press.
  useEffect(() => {
    verifyLog("roman_state", {
      units: units.join(""),
      buffer,
      next: upcoming,
      hint: hintDisplay,
      sequenceHint,
      keystrokes,
      errorHits,
      done,
    });
  }, [units, buffer, upcoming, hintDisplay, sequenceHint, keystrokes, errorHits, done]);

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
    finalErrors,
    typeChar(char: string) {
      if (done) return;
      startClock();
      if (char === " ") {
        // A space first completes a pending unit when it matches, then
        // commits itself only when a space is expected. Otherwise the
        // miss is counted, pending keys are dropped, cursor holds.
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
            const flushed = exactCommit(prev.buffer);
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
        // Extendable short vowels (a before aa, k before ka) hold in the
        // buffer until they settle or the next key resolves them. When the
        // pending buffer already equals the unit the prompt expects next,
        // flush it first so "a" then "a" yields अ then a pending "a"
        // instead of a single आ that breaks prompt alignment.
        let baseUnits = prev.units;
        let startBuffer = prev.buffer;
        if (promptUnits.length > 0 && startBuffer !== "") {
          const flushed = exactCommit(startBuffer);
          if (flushed !== null && flushed === promptUnits[baseUnits.length]) {
            baseUnits = [...baseUnits, flushed];
            startBuffer = "";
          }
        }
        const step = advanceRoman(startBuffer, char);
        if (step.error) {
          // Buffer plus this key matches no sequence at all: one error
          // hit, pending keys drop, cursor holds.
          return {
            units: baseUnits,
            buffer: "",
            keystrokes: prev.keystrokes + 1,
            errorHits: prev.errorHits + 1,
            wrongKey: char,
          };
        }
        if (step.commits.length === 0) {
          // A short unit that also leads a longer sequence (a before aa,
          // k before ka) can settle now when it is exactly the unit the
          // prompt expects, instead of waiting for the next key.
          const settled = step.buffer === "" ? null : exactCommit(step.buffer);
          if (
            settled !== null &&
            baseUnits.length < promptUnits.length &&
            settled === promptUnits[baseUnits.length]
          ) {
            return {
              units: [...baseUnits, settled],
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
          if (baseUnits.length + i < promptUnits.length) {
            if (step.commits[i] !== promptUnits[baseUnits.length + i]) misses++;
            kept.push(step.commits[i]);
          }
        }
        if (misses > 0) {
          // Wrong sequence: count the miss, drop the pending keys, hold.
          return {
            units: baseUnits,
            buffer: "",
            keystrokes: prev.keystrokes + 1,
            errorHits: prev.errorHits + misses,
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
          const flushed = exactCommit(buffer);
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
        layout: "romanized",
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
