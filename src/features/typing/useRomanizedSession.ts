/** Romanized session hook: roman keys in, Devanagari out (spec 0006). */
import { useMemo, useRef, useState } from "react";
import { calcAccuracy, calcWpm, countCorrect, deriveFinalErrors } from "../../domain/scoring";
import { advanceRoman, exactCommit, sequenceFor } from "../../domain/romanize";
import { nextKey } from "../../domain/keymap";
import type { NewAttempt } from "../../domain/datastore";
import type { SessionApi } from "./useTypingSession";

interface RomanState {
  completed: string;
  buffer: string;
  keystrokes: number;
  errorHits: number;
}

const FRESH: RomanState = { completed: "", buffer: "", keystrokes: 0, errorHits: 0 };

/**
 * Track typing against a Devanagari prompt through roman sequences.
 * Same SessionApi shape as the English hook so TypingView binds to one
 * interface. Units per spec 0006: correctChars counts completed
 * Devanagari chars, keystrokes plus errorHits count roman presses.
 * One state object so fast keystrokes never read stale values.
 */
export function useRomanizedSession(prompt: string, fingerGuidance: boolean): SessionApi {
  const [state, setState] = useState<RomanState>(FRESH);
  const startRef = useRef<number | null>(null);

  const { completed, keystrokes, errorHits } = state;
  const done = completed.length >= prompt.length && prompt.length > 0;
  const elapsed = startRef.current === null ? 0 : Date.now() - startRef.current;
  const wpm = useMemo(
    () => calcWpm(countCorrect(prompt, completed), elapsed),
    [prompt, completed, elapsed],
  );
  const accuracy = calcAccuracy(keystrokes, errorHits);
  const upcoming = done ? "" : (prompt[completed.length] ?? "");
  const sequence = upcoming === "" || upcoming === " " ? "" : sequenceFor(upcoming);
  const firstKey = sequence === "" ? upcoming : sequence.charAt(0);
  const mapped = firstKey === "" ? null : nextKey(firstKey === " " ? " " : firstKey);
  const finalErrors = useMemo(() => deriveFinalErrors(prompt, completed), [prompt, completed]);

  function startClock() {
    if (startRef.current === null) startRef.current = Date.now();
  }

  return {
    typed: completed,
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
          if (prompt.length === 0) {
            return {
              ...prev,
              buffer: "",
              keystrokes: prev.keystrokes + 1,
              errorHits: prev.errorHits + 1,
            };
          }
          let completed = prev.completed;
          let misses = 0;
          const flushed = exactCommit(prev.buffer);
          if (flushed !== null) {
            if (flushed !== prompt[completed.length]) misses += 1;
            completed = (completed + flushed).slice(0, Math.max(prompt.length, 0));
            if (completed.length >= prompt.length) {
              return {
                completed,
                buffer: "",
                keystrokes: prev.keystrokes + 1,
                errorHits: prev.errorHits + misses,
              };
            }
          }
          const expected = prompt[completed.length];
          if (expected === " ") {
            return {
              ...prev,
              completed: completed + " ",
              buffer: "",
              keystrokes: prev.keystrokes + 1,
              errorHits: prev.errorHits + misses,
            };
          }
          return {
            ...prev,
            completed,
            buffer: "",
            keystrokes: prev.keystrokes + 1,
            errorHits: prev.errorHits + misses + 1,
          };
        });
        return;
      }
      setState((prev) => {
        // Short vowels (a/i/u) are extendable (aa/ii/uu), so they sit
        // pending. When the pending buffer already equals the expected
        // char, flush it first so "a"+"a" yields अ then pending "a"
        // instead of a single आ that breaks prompt alignment.
        let completedBase = prev.completed;
        let startBuffer = prev.buffer;
        if (prompt.length > 0 && startBuffer !== "") {
          const flushed = exactCommit(startBuffer);
          const expected = prompt[completedBase.length];
          if (flushed !== null && flushed === expected) {
            completedBase = (completedBase + flushed).slice(0, prompt.length);
            startBuffer = "";
          }
        }
        const step = advanceRoman(startBuffer, char);
        const base = completedBase.length;
        const joined = step.commits.join("");
        const capped = (completedBase + joined).slice(0, Math.max(prompt.length, 0));
        let misses = 0;
        for (let i = 0; i < joined.length; i++) {
          if (joined[i] !== prompt[base + i]) misses++;
        }
        let completed = prompt.length === 0 ? prev.completed : capped;
        let buffer = step.buffer;
        if (buffer !== "" && prompt.length > 0 && completed.length + 1 === prompt.length) {
          const flushed = exactCommit(buffer);
          if (flushed !== null && flushed === prompt[completed.length]) {
            completed = completed + flushed;
            buffer = "";
          }
        }
        return {
          completed,
          buffer,
          keystrokes: prev.keystrokes + 1,
          errorHits: prev.errorHits + misses + (step.error ? 1 : 0),
        };
      });
    },
    backspace() {
      setState((prev) =>
        prev.buffer !== ""
          ? { ...prev, buffer: "" }
          : { ...prev, completed: prev.completed.slice(0, -1) },
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
        layout: "romanized",
        startedAt: startedIso,
        durationMs: safeDuration,
        wpm: calcWpm(countCorrect(prompt, completed), safeDuration),
        accuracy: calcAccuracy(keystrokes, errorHits),
        errors: deriveFinalErrors(prompt, completed),
        completed: true,
      } satisfies NewAttempt;
    },
  };
}

/** Full roman sequence hint for the next Devanagari char, empty for spaces. */
export function useSequenceHint(prompt: string, completed: string): string {
  const upcoming = prompt[completed.length] ?? "";
  if (upcoming === "" || upcoming === " ") return "";
  return sequenceFor(upcoming);
}
