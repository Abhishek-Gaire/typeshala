/** Classic drill plus free screens inside the shared shell (spec 0012 AC-1, AC-3, AC-6). */
import { useEffect, useMemo, useRef, useState } from "react";
import type { ClassicCategory, ClassicScreenId } from "../../domain/classicLayout";
import type { LayoutId, Lesson, NewAttempt } from "../../domain/datastore";
import type { StringKey } from "../../i18n/keys";
import { CLASSIC_DRILLS } from "../../domain/classicDrills";
import { codeForNextUnit, lessonsForClassic } from "../../domain/classicLayout";
import {
  PROMPT_PAGE_SIZE,
  chunkGroupsForPages,
  pageIndexForCursor,
  pageStartCursors,
  tokensForPrompt,
} from "../../domain/promptPaging";
import { splitUnits } from "../../domain/preeti";
import { calcWpm } from "../../domain/scoring";
import { ClassicPrompt } from "../../components/ClassicPrompt";
import { ClassicKeyboard, type KeyPress } from "../../components/ClassicKeyboard";
import { Button } from "../../components/Button";
import { useTypingSession } from "../typing/useTypingSession";
import { useTraditionalSession } from "../typing/useTraditionalSession";

/** Unbounded free typing state. No prompt, no save, live speed only. */
function FreeView({
  layout,
  text,
  onStats,
}: {
  layout: LayoutId;
  text: (key: StringKey) => string;
  onStats: (wpm: number) => void;
}) {
  const [typed, setTyped] = useState("");
  const [press, setPress] = useState<KeyPress | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const hasStarted = startRef.current !== null;

  useEffect(() => {
    boxRef.current?.focus();
  }, []);

  useEffect(() => {
    if (hasStarted) {
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
  }, [hasStarted]);

  const wpm = calcWpm(typed.length, elapsedMs);
  useEffect(() => {
    onStats(wpm);
  }, [wpm, onStats]);
  const last = typed.length > 0 ? typed.slice(-1) : "";

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Backspace") {
      e.preventDefault();
      setPress((p) => ({ code: "Backspace", correct: false, n: (p?.n ?? 0) + 1 }));
      setTyped((prev) => prev.slice(0, -1));
    } else if (e.key.length === 1) {
      e.preventDefault();
      if (startRef.current === null) startRef.current = Date.now();
      setPress((p) => ({
        code: e.code !== "" ? e.code : "",
        correct: true,
        n: (p?.n ?? 0) + 1,
      }));
      setTyped((prev) => prev + e.key);
    }
  }

  return (
    <div
      ref={boxRef}
      tabIndex={0}
      onKeyDown={onKey}
      role="textbox"
      aria-label={text("classic.free")}
      className="rounded bg-white p-6 focus:outline-none"
      style={{ outline: "none" }}
    >
      <p className="mb-2 text-sm text-(--color-muted)">{text("free.hint")}</p>
      <p className="min-h-16 text-2xl text-(--color-ink)">{typed === "" ? " " : typed}</p>
      <p role="status" className="mt-2 text-sm">
        {text("typing.wpm")}: {wpm}
      </p>
      <ClassicKeyboard layout={layout} next={last} press={press} />
      <div className="mt-4">
        <Button
          variant="quiet"
          onClick={() => {
            setTyped("");
            setElapsedMs(0);
            startRef.current = null;
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = null;
            boxRef.current?.focus();
          }}
        >
          {text("typing.restart")}
        </Button>
      </div>
    </div>
  );
}

export function ClassicScreen({
  screen,
  level,
  layout,
  text,
  onDone,
  onStats,
}: {
  screen: ClassicCategory | "free";
  level: number;
  layout: LayoutId;
  text: (key: StringKey) => string;
  onDone: (attempt: NewAttempt, lesson: Lesson) => void;
  onStats: (wpm: number) => void;
}) {
  const lesson: Lesson = useMemo(() => {
    if (screen === "free") {
      return { id: "free", layout, title: "free", prompt: " ", order: 0 };
    }
    const pool = CLASSIC_DRILLS.filter(
      (l) => l.layout === (layout === "traditional" ? "traditional" : "qwerty"),
    );
    const hits = lessonsForClassic(pool, screen, level);
    const hit = hits.length > 0 ? hits[0] : undefined;
    return hit ?? { id: "empty", layout, title: "empty", prompt: "", order: 0 };
  }, [screen, level, layout]);

  const english = useTypingSession(lesson.layout === "qwerty" ? lesson.prompt : "", true);
  const traditional = useTraditionalSession(
    lesson.layout === "traditional" ? lesson.prompt : "",
    true,
  );
  const session = lesson.layout === "traditional" ? traditional : english;
  const units = useMemo(() => splitUnits(lesson.prompt), [lesson.prompt]);
  const doneUnits: string[] = session.units ?? session.typed.split("");
  const next: string = doneUnits.length < units.length ? units[doneUnits.length] : "";

  /** Single line paging (spec 0014). Page follows the cursor, so forward
   * typing advances, backspace returns, and restart resets to page 1. */
  const tokens = useMemo(() => tokensForPrompt(lesson.prompt), [lesson.prompt]);
  const pages = useMemo(() => chunkGroupsForPages(tokens, PROMPT_PAGE_SIZE), [tokens]);
  const starts = useMemo(
    () => pageStartCursors(pages, (token) => splitUnits(token).length),
    [pages],
  );
  const pageTotal = Math.max(pages.length, 1);
  const activePage = pages.length === 0 ? 0 : pageIndexForCursor(starts, doneUnits.length);
  const pageStart = starts[activePage] ?? 0;
  const pageEnd = activePage + 1 < starts.length ? starts[activePage + 1] : units.length;
  const pageUnits = units.slice(pageStart, pageEnd);
  const pageTyped = doneUnits.slice(pageStart, pageEnd);

  const saved = useRef(false);
  const startMs = useRef(Date.now());
  useEffect(() => {
    saved.current = false;
    startMs.current = Date.now();
  }, [lesson.id]);
  useEffect(() => {
    onStats(session.wpm);
  }, [session.wpm, onStats]);
  useEffect(() => {
    if (session.done && !saved.current && lesson.prompt !== "") {
      saved.current = true;
      const pending = session.buildAttempt(
        lesson.id,
        new Date(startMs.current).toISOString(),
        Date.now() - startMs.current,
      );
      onDone(pending, lesson);
      session.reset();
      startMs.current = Date.now();
      saved.current = false;
      boxRef.current?.focus();
    }
  }, [session.done, lesson, session, onDone]);

  const boxRef = useRef<HTMLDivElement>(null);
  const [press, setPress] = useState<KeyPress | null>(null);
  useEffect(() => {
    boxRef.current?.focus();
  }, [lesson.id]);

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Backspace") {
      e.preventDefault();
      setPress((p) => ({ code: "Backspace", correct: false, n: (p?.n ?? 0) + 1 }));
      session.backspace();
    } else if (e.key.length === 1) {
      e.preventDefault();
      const expectedCode = codeForNextUnit(next, layout);
      const hitCode = e.code !== "" ? e.code : expectedCode;
      setPress((p) => ({
        code: hitCode,
        correct: expectedCode !== "" && hitCode === expectedCode,
        n: (p?.n ?? 0) + 1,
      }));
      session.typeChar(e.key);
    }
  }

  function handleRestart() {
    english.reset();
    traditional.reset();
    saved.current = false;
    startMs.current = Date.now();
    boxRef.current?.focus();
  }

  if (screen === "free") {
    return <FreeView layout={layout} text={text} onStats={onStats} />;
  }

  if (lesson.prompt === "") return <p role="alert">{text("state.empty")}</p>;

  return (
    <div
      ref={boxRef}
      tabIndex={0}
      onKeyDown={onKey}
      role="textbox"
      aria-label={lesson.title}
      className="flex flex-1 flex-col bg-white focus:outline-none"
      style={{ outline: "none" }}
    >
      <div className="mx-auto flex w-full flex-1 flex-col px-4 pt-6">
        <div className="flex justify-end">
          <Button onClick={handleRestart} aria-label={text("typing.restart")}>
            {text("typing.restart")}
          </Button>
        </div>
        <div className="flex flex-1 items-end justify-center pb-5">
          <ClassicPrompt
            units={pageUnits}
            typed={pageTyped}
            pageIndex={activePage}
            pageTotal={pageTotal}
          />
        </div>
        <ClassicKeyboard layout={layout} next={next} press={press} />
      </div>
    </div>
  );
}

export type { ClassicScreenId };
