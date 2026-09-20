import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResultView } from "../../../src/features/results/ResultView";
import type { Attempt } from "../../../src/domain/datastore";

function attempt(): Attempt {
  return {
    id: "a1",
    lessonId: "en-home",
    layout: "qwerty",
    startedAt: "2026-09-15T00:00:00Z",
    durationMs: 1000,
    wpm: 16,
    accuracy: 96,
    errors: [],
    completed: true,
  };
}

const text = (key: string) => key;

describe("ResultView", () => {
  it("shows next button only when a next lesson exists (covers AC-4)", async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    const { rerender } = render(
      <ResultView
        attempt={attempt()}
        lastNote={null}
        text={text}
        hasNext
        onAgain={() => {}}
        onLessons={() => {}}
        onNext={onNext}
      />,
    );
    await user.click(screen.getByText("result.next"));
    expect(onNext).toHaveBeenCalledTimes(1);
    rerender(
      <ResultView
        attempt={attempt()}
        lastNote={null}
        text={text}
        hasNext={false}
        onAgain={() => {}}
        onLessons={() => {}}
        onNext={onNext}
      />,
    );
    expect(screen.queryByText("result.next")).not.toBeInTheDocument();
  });
});
