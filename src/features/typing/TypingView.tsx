/** Typing view with large prompt, live scores, lit key (spec 0004, AC-2, AC-3). */
import { useEffect, useMemo, useRef } from "react";
import type { Lesson } from "../../domain/datastore";
import type { PromptSize } from "../../styles/tokens";
import { promptFontSize } from "../../styles/tokens";
import type { StringKey } from "../../i18n/keys";
import { Button } from "../../components/Button";
import { useTypingSession } from "./useTypingSession";
import { useRomanizedSession, useSequenceHint } from "./useRomanizedSession";
import { usePreetiSequenceHint, useTraditionalSession } from "./useTraditionalSession";
import { splitUnits } from "../../domain/preeti";
import { VirtualKeyboard } from "./VirtualKeyboard";
import type { NewAttempt } from "../../domain/datastore";

export function TypingView({
  lesson,
  size,
  fingerGuidance,
  text,
  onDone,
  onBack,
}: {
  lesson: Lesson;
  size: PromptSize;
  fingerGuidance: boolean;
  text: (key: StringKey) => string;
  onDone: (attempt: NewAttempt, durationMs: number, startedIso: string) => void;
  onBack: () => void;
}) {
  const english = useTypingSession(lesson.layout === "qwerty" ? lesson.prompt : "", fingerGuidance);
  const roman = useRomanizedSession(
    lesson.layout === "romanized" ? lesson.prompt : "",
    fingerGuidance,
  );
  const traditional = useTraditionalSession(
    lesson.layout === "traditional" ? lesson.prompt : "",
    fingerGuidance,
  );
  const session =
    lesson.layout === "romanized" ? roman : lesson.layout === "traditional" ? traditional : english;
  const sequence = useSequenceHint(lesson.prompt, session.typed);
  const promptUnits = useMemo(() => splitUnits(lesson.prompt), [lesson.prompt]);
  const completedUnits = session.units ?? [];
  const preetiSequence = usePreetiSequenceHint(lesson.prompt, traditional.units ?? []);
  const shownSequence =
    lesson.layout === "romanized"
      ? sequence
      : lesson.layout === "traditional"
        ? preetiSequence
        : "";
  const startedIso = useRef(new Date().toISOString());
  const startMs = useRef(Date.now());
  const saved = useRef(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    boxRef.current?.focus();
  }, [lesson.id]);

  useEffect(() => {
    if (session.done && !saved.current) {
      saved.current = true;
      onDone(
        session.buildAttempt(lesson.id, startedIso.current, Date.now() - startMs.current),
        Date.now() - startMs.current,
        startedIso.current,
      );
    }
  }, [session.done, lesson.id, onDone, session]);

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Backspace") {
      e.preventDefault();
      session.backspace();
    } else if (e.key.length === 1) {
      e.preventDefault();
      session.typeChar(e.key);
    }
  }

  return (
    <section aria-label="typing">
      <div
        ref={boxRef}
        tabIndex={0}
        onKeyDown={onKey}
        role="textbox"
        aria-label={lesson.title}
        className="rounded-xl bg-(--color-surface) p-6 outline-none focus-visible:ring-2"
      >
        <p className="leading-relaxed font-medium" style={{ fontSize: promptFontSize(size) }}>
          {lesson.layout === "traditional" && session.units !== null
            ? promptUnits.map((unit, i) => {
                const typedUnit = i < completedUnits.length ? completedUnits[i] : null;
                const color =
                  typedUnit === null
                    ? "text-(--color-ink-soft)"
                    : typedUnit === unit
                      ? "text-(--color-ok)"
                      : "text-(--color-bad)";
                const caret = i === completedUnits.length ? "underline" : "";
                return (
                  <span key={i} className={`${color} ${caret}`}>
                    {unit}
                  </span>
                );
              })
            : lesson.prompt.split("").map((char, i) => {
                const hasTyped = i < session.typed.length;
                const typedChar = hasTyped ? session.typed.charAt(i) : null;
                const color =
                  typedChar === null
                    ? "text-(--color-ink-soft)"
                    : typedChar === char
                      ? "text-(--color-ok)"
                      : "text-(--color-bad)";
                const caret = i === session.typed.length ? "underline" : "";
                return (
                  <span key={i} className={`${color} ${caret}`}>
                    {char}
                  </span>
                );
              })}
        </p>
      </div>
      <div className="mt-4 flex gap-6 text-(--color-ink)" role="status">
        <span>
          {text("typing.wpm")}: {session.wpm}
        </span>
        <span>
          {text("typing.accuracy")}: {session.accuracy}%
        </span>
        {shownSequence !== "" && (
          <span>
            {text("typing.sequence")}: {shownSequence}
          </span>
        )}
      </div>
      <VirtualKeyboard
        lit={session.hint}
        finger={session.finger === "" ? "" : `${text("typing.finger")} ${session.finger}`}
      />
      <div className="mt-6 flex gap-3">
        <Button
          variant="quiet"
          onClick={() => {
            session.reset();
            saved.current = false;
            startedIso.current = new Date().toISOString();
            startMs.current = Date.now();
            boxRef.current?.focus();
          }}
        >
          {text("typing.restart")}
        </Button>
        <Button
          variant="quiet"
          onClick={() => {
            onBack();
          }}
        >
          {text("typing.back")}
        </Button>
      </div>
    </section>
  );
}
