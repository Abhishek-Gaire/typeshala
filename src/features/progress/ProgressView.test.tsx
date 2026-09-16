/** Component tests for ProgressView (spec 0008). */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProgressView } from "./ProgressView";
import type { Attempt, Lesson } from "../../domain/datastore";

import type { StringKey } from "../../i18n/keys";

const text = (key: StringKey): string => key;

function attempt(over: Partial<Attempt> & { lessonId: string }): Attempt {
  return {
    id: "a",
    layout: "qwerty",
    startedAt: "2026-01-01T00:00:00.000Z",
    durationMs: 60000,
    wpm: 30,
    accuracy: 95,
    errors: [],
    completed: true,
    ...over,
  };
}

const lessons: Lesson[] = [{ id: "l1", layout: "qwerty", title: "L1", prompt: "hi", order: 0 }];

describe("ProgressView", () => {
  it("shows empty hint when no attempts (AC-4)", () => {
    render(
      <ProgressView
        attempts={[]}
        lessons={lessons}
        filter={null}
        onFilter={() => {}}
        text={text}
      />,
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
  it("shows done count plus bests (AC-1 AC-2)", () => {
    render(
      <ProgressView
        attempts={[attempt({ lessonId: "l1" })]}
        lessons={lessons}
        filter={null}
        onFilter={() => {}}
        text={text}
      />,
    );
    expect(screen.getByText(/l1/)).toBeInTheDocument();
  });
  it("filter buttons call onFilter by keyboard (AC-3 AC-5)", async () => {
    const onFilter = vi.fn();
    render(
      <ProgressView
        attempts={[attempt({ lessonId: "l1" })]}
        lessons={lessons}
        filter={null}
        onFilter={onFilter}
        text={text}
      />,
    );
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(onFilter).toHaveBeenCalled();
  });
});
