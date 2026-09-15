/** TypingView romanized branch tests (spec 0006, AC-2, AC-3). */
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TypingView } from "./TypingView";
import type { Lesson, NewAttempt } from "../../domain/datastore";
import type { StringKey } from "../../i18n/keys";

const text = (key: StringKey) => key;

function romanLesson(prompt = "ए"): Lesson {
  return { id: "ne-test", layout: "romanized", title: "Nepali test", prompt, order: 1 };
}

function englishLesson(): Lesson {
  return { id: "en-test", layout: "qwerty", title: "English test", prompt: "a", order: 1 };
}

describe("TypingView romanized", () => {
  it("shows Devanagari prompt plus full sequence hint plus lit key (covers AC-2, AC-3)", () => {
    render(
      <TypingView
        lesson={romanLesson()}
        size="standard"
        fingerGuidance
        text={text}
        onDone={() => {}}
        onBack={() => {}}
      />,
    );
    expect(screen.getByText("ए")).toBeInTheDocument();
    const status = screen.getByRole("status");
    expect(status.textContent).toContain("typing.sequence");
    expect(status.textContent).toContain("e");
    expect(status.textContent).toContain("typing.wpm");
    expect(status.textContent).toContain("typing.accuracy");
    expect(screen.getByLabelText("keyboard")).toBeInTheDocument();
    const lit = screen.getByText("E");
    expect(lit).toHaveAttribute("aria-current", "true");
  });

  it("types a full prompt by keyboard and saves once (covers AC-2, AC-4)", async () => {
    const user = userEvent.setup();
    const onDone = vi.fn<(attempt: NewAttempt) => void>();
    render(
      <TypingView
        lesson={romanLesson()}
        size="standard"
        fingerGuidance
        text={text}
        onDone={onDone}
        onBack={() => {}}
      />,
    );
    const box = screen.getByRole("textbox", { name: "Nepali test" });
    await user.click(box);
    await user.keyboard("e");
    await waitFor(() => {
      expect(onDone).toHaveBeenCalledTimes(1);
    });
    const attempt = onDone.mock.calls[0][0];
    expect(attempt.lessonId).toBe("ne-test");
    expect(attempt.layout).toBe("romanized");
    expect(attempt.completed).toBe(true);
  });

  it("keeps restart plus back reachable by keyboard (covers AC-2)", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(
      <TypingView
        lesson={romanLesson()}
        size="standard"
        fingerGuidance
        text={text}
        onDone={() => {}}
        onBack={onBack}
      />,
    );
    const restart = screen.getByRole("button", { name: "typing.restart" });
    const back = screen.getByRole("button", { name: "typing.back" });
    expect(restart).toBeInTheDocument();
    expect(back).toBeInTheDocument();
    await user.click(restart);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    await user.click(back);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("hides the sequence hint for English lessons (covers AC-2)", () => {
    render(
      <TypingView
        lesson={englishLesson()}
        size="standard"
        fingerGuidance
        text={text}
        onDone={() => {}}
        onBack={() => {}}
      />,
    );
    expect(screen.getByRole("status").textContent).not.toContain("typing.sequence");
  });
});
