/** LayoutShell min-width tests: app holds 800px with horizontal scroll below it. */
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LayoutShell } from "../../src/components/LayoutShell";

describe("LayoutShell", () => {
  it("keeps content at 800px min with outer horizontal scroll", () => {
    const { container } = render(
      <LayoutShell>
        <p>child</p>
      </LayoutShell>,
    );
    expect(screen.getByText("child")).toBeDefined();
    const outer = container.firstElementChild as HTMLElement;
    expect(outer.className).toContain("overflow-x-auto");
    expect(outer.className).not.toContain("min-w-[800px]");
    const main = container.querySelector("main") as HTMLElement;
    expect(main.className).toContain("min-w-[800px]");
    expect(main.className).toContain("w-full");
  });
});
