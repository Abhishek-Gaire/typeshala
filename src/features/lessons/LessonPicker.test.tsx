import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LessonPicker } from "./LessonPicker";
import type { LessonWithProgress } from "../../domain/progression";

function row(
  id: string,
  status: LessonWithProgress["status"],
  best: LessonWithProgress["best"] = null,
  level = "home-row",
): LessonWithProgress {
  return {
    lesson: { id, layout: "qwerty", title: id, prompt: "abc", order: 1, level },
    status,
    best,
  };
}

const text = (key: string) => key;

describe("LessonPicker", () => {
  it("shows empty hint when no lessons (covers AC-5)", () => {
    render(<LessonPicker rows={[]} text={text} onPick={() => {}} />);
    expect(screen.getByText("lesson.emptyHint")).toBeInTheDocument();
  });

  it("disables locked lessons and shows bests (covers AC-1, AC-3)", async () => {
    const user = userEvent.setup();
    const onPick = vi.fn();
    render(
      <LessonPicker
        rows={[
          row("a", "done", { lessonId: "a", wpm: 30, accuracy: 95, attempts: 2 }),
          row("b", "locked"),
        ]}
        text={text}
        onPick={onPick}
      />,
    );
    expect(screen.getByText(/30/)).toBeInTheDocument();
    const buttons = screen.getAllByRole("button");
    expect(buttons[1]).toBeDisabled();
    await user.click(buttons[0]);
    expect(onPick).toHaveBeenCalledWith("a");
  });

  it("groups rows by level with headings (covers AC-1)", () => {
    render(
      <LessonPicker
        rows={[row("a", "open", null, "home-row"), row("b", "locked", null, "words")]}
        text={text}
        onPick={() => {}}
      />,
    );
    expect(screen.getByText("home-row")).toBeInTheDocument();
    expect(screen.getByText("words")).toBeInTheDocument();
  });
});
