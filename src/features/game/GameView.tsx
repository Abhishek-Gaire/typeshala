/**
 * Falling words game view (spec 0010).
 * Local React loop on `requestAnimationFrame`, styled divs on tokens.
 * Transient score only, never calls the lesson store.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../components/Button";
import { cleanWords, startGame, tickGame, typeGame, type GameState } from "../../domain/game";
import type { StringKey } from "../../i18n/keys";

interface Props {
  prompts: string[];
  text: (key: StringKey) => string;
  onQuit: () => void;
}

export function GameView({ prompts, text, onQuit }: Props) {
  const words = useMemo(() => cleanWords(prompts), [prompts]);
  const [run, setRun] = useState<GameState | null>(null);
  const [best, setBest] = useState(0);
  const raf = useRef(0);
  const last = useRef(0);

  useEffect(() => {
    if (run?.phase !== "active") return;
    last.current = performance.now();
    const loop = (now: number) => {
      const delta = now - last.current;
      last.current = now;
      setRun((s) => (s === null ? s : tickGame(s, words, Math.min(delta, 100))));
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf.current);
    };
  }, [run?.phase, words]);

  const phase = run?.phase;
  const score = run?.score ?? 0;
  useEffect(() => {
    if (phase === "done") {
      setBest((b) => Math.max(b, score));
    }
  }, [phase, score]);
  useEffect(() => {
    if (run?.phase !== "active") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setRun((s) => (s === null ? s : { ...s, phase: "paused" as const }));
        return;
      }
      const target = e.target as HTMLElement | null;
      const onButton = target?.tagName === "BUTTON";
      if (e.key === " " || e.key === "Enter") {
        if (onButton) return;
        if (e.key === " ") return;
      }
      if (e.key.length === 1 || e.key === "Backspace") {
        e.preventDefault();
        setRun((s) => (s === null ? s : typeGame(s, e.key)));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [run?.phase]);

  if (words.length === 0) {
    return <p role="status">{text("state.empty")}</p>;
  }

  if (run === null) {
    return (
      <div>
        <Button
          autoFocus
          onClick={() => {
            setRun(startGame(words));
          }}
        >
          {text("game.start")}
        </Button>
      </div>
    );
  }

  if (run.phase === "paused") {
    return (
      <div className="flex gap-2">
        <Button
          autoFocus
          onClick={() => {
            setRun({ ...run, phase: "active" });
          }}
        >
          {text("game.resume")}
        </Button>
        <Button variant="quiet" onClick={onQuit}>
          {text("game.quit")}
        </Button>
      </div>
    );
  }

  if (run.phase === "done") {
    return (
      <div>
        <p role="status" className="mb-4 text-xl">
          {text("game.over")}: {run.score}
        </p>
        <p className="mb-4 text-base">
          {text("game.best")}: {best}
        </p>
        <div className="flex gap-2">
          <Button
            autoFocus
            onClick={() => {
              setRun(startGame(words));
            }}
          >
            {text("game.restart")}
          </Button>
          <Button variant="quiet" onClick={onQuit}>
            {text("game.quit")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex gap-4 text-lg" role="status" aria-live="polite">
        <span>
          {text("game.score")}: {run.score}
        </span>
        <span>
          {text("game.lives")}: {run.lives}
        </span>
        <span>
          {text("game.level")}: {run.level}
        </span>
      </div>
      <div
        className="relative mb-4 h-105 overflow-hidden rounded-xl border border-(--color-muted)"
        aria-hidden="true"
      >
        {run.words.map((w) => (
          <span
            key={w.id}
            className="absolute text-2xl font-semibold text-(--color-ink)"
            style={{ left: `${String(w.lane * 80)}%`, top: `${String((w.y / 400) * 100)}%` }}
          >
            {w.text}
          </span>
        ))}
      </div>
      <p className="mb-4 text-xl" aria-live="polite">
        {run.buffer || " "}
      </p>
      <div className="flex gap-2">
        <Button
          variant="quiet"
          onClick={() => {
            setRun({ ...run, phase: "paused" });
          }}
        >
          {text("game.pause")}
        </Button>
        <Button
          variant="quiet"
          onClick={() => {
            setRun(startGame(words));
          }}
        >
          {text("game.restart")}
        </Button>
        <Button variant="quiet" onClick={onQuit}>
          {text("game.quit")}
        </Button>
      </div>
    </div>
  );
}
