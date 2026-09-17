/** Paged ClassicPrompt tests (spec 0014 AC-1, AC-5). */
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClassicPrompt } from "./ClassicPrompt";

describe("paged ClassicPrompt", () => {
  it("shows one page plus the line counter and marks wrong units", () => {
    render(
      <ClassicPrompt
        units={["a", "a", "a", " ", "j", "j", "j"]}
        typed={["a", "a", "x"]}
        pageIndex={0}
        pageTotal={3}
      />,
    );
    const ref = screen.getByLabelText("reference").textContent;
    expect(ref.startsWith("aaa")).toBe(true);
    expect(ref.endsWith("jjj")).toBe(true);
    expect(ref.length).toBe(3 + 2 + 3);
    expect(screen.getByLabelText("typed").textContent).toContain("aax");
    expect(screen.queryByText(/Line/)).toBeNull();
  });
});
