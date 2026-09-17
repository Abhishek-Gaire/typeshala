/** Paged ClassicPrompt tests (spec 0014 AC-1, AC-5). */
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClassicPrompt } from "./ClassicPrompt";

describe("paged ClassicPrompt", () => {
  it("shows one page with no counter row and marks wrong units", () => {
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

  it("keeps each slice on a single centered line with horizontal scroll", () => {
    render(<ClassicPrompt units={["a", "s", "d"]} typed={[]} pageIndex={0} pageTotal={1} />);
    const prompt = screen.getByLabelText("prompt");
    expect(prompt.className).toContain("whitespace-nowrap");
    expect(prompt.className).toContain("overflow-x-auto");
    expect(prompt.className).toContain("mx-auto");
    expect(prompt.className).toContain("w-fit");
    expect(prompt.className).toContain("max-w-full");
    for (const label of ["reference", "typed"] as const) {
      const line = screen.getByLabelText(label);
      expect(line.className).toContain("whitespace-nowrap");
      expect(line.className).toContain("w-max");
    }
  });
});
