/** Classic shell menu tests: Perform restarts, Lessons navigates, Help shows About. */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ClassicShell } from "../../src/components/ClassicShell";
import type { StringKey } from "../../src/i18n/keys";

const text = (key: StringKey): string => key;

function renderShell(overrides: Partial<Parameters<typeof ClassicShell>[0]> = {}) {
  const props: Parameters<typeof ClassicShell>[0] = {
    screen: "home",
    level: 1,
    layout: "qwerty",
    name: "",
    avgWpm: 0,
    version: "1.0.2",
    versionState: "ready",
    text,
    onScreen: vi.fn(),
    onLevel: vi.fn(),
    onLayout: vi.fn(),
    onName: vi.fn(),
    onSettings: vi.fn(),
    onRestart: vi.fn(),
    children: null,
    ...overrides,
  };
  render(<ClassicShell {...props} />);
  return props;
}

describe("classic shell menus", () => {
  it("Perform menu calls onRestart", () => {
    const props = renderShell();
    fireEvent.click(screen.getByRole("button", { name: "menu.perform" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "menu.restart" }));
    expect(props.onRestart).toHaveBeenCalledTimes(1);
  });

  it("Lessons menu navigates to each drill screen", () => {
    const props = renderShell();
    fireEvent.click(screen.getByRole("button", { name: "menu.lessons" }));
    const items = screen.getAllByRole("menuitem");
    expect(items).toHaveLength(4);
    fireEvent.click(screen.getByRole("menuitem", { name: "classic.top" }));
    expect(props.onScreen).toHaveBeenCalledWith("top");
  });

  it("Help menu opens an About dialog that closes", () => {
    renderShell();
    fireEvent.click(screen.getByRole("button", { name: "menu.help" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "menu.about" }));
    expect(screen.getByRole("dialog", { name: "about.title" })).toBeDefined();
    expect(screen.getByText(/1\.0\.2/)).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "menu.close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("About shows the fallback when the version read failed (spec 0023 AC-6)", () => {
    renderShell({ version: null, versionState: "failed" });
    fireEvent.click(screen.getByRole("button", { name: "menu.help" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "menu.about" }));
    expect(screen.getByText(/about.versionUnavailable/)).toBeDefined();
  });

  it("Options still opens settings directly", () => {
    const props = renderShell();
    fireEvent.click(screen.getByRole("button", { name: "menu.options" }));
    expect(props.onSettings).toHaveBeenCalledTimes(1);
  });
});

describe("classic shell toolbar layout", () => {
  it("sizes to content on one row with wrap fallback", () => {
    renderShell();
    const toolbar = screen.getByRole("toolbar", { name: "screens" });
    expect(toolbar.className).toContain("w-fit");
    expect(toolbar.className).toContain("max-w-full");
    expect(toolbar.className).toContain("flex-wrap");
    for (const key of [
      "classic.home",
      "classic.top",
      "classic.bottom",
      "classic.all",
      "classic.game",
      "classic.free",
    ] as const) {
      expect(screen.getByRole("button", { name: key })).toBeDefined();
    }
    expect(screen.getByRole("group", { name: "classic.level" })).toBeDefined();
    expect(screen.getByRole("group", { name: "language" })).toBeDefined();
  });

  it("switches all three layouts from the toolbar (spec 0022 AC-1)", () => {
    const props = renderShell();
    fireEvent.click(screen.getByRole("button", { name: "layout.traditional" }));
    expect(props.onLayout).toHaveBeenCalledWith("traditional");
    fireEvent.click(screen.getByRole("button", { name: "layout.romanized" }));
    expect(props.onLayout).toHaveBeenCalledWith("romanized");
    fireEvent.click(screen.getByRole("button", { name: "layout.english" }));
    expect(props.onLayout).toHaveBeenCalledWith("qwerty");
  });

  it("marks only the active layout pressed", () => {
    renderShell({ layout: "romanized" });
    expect(
      screen.getByRole("button", { name: "layout.romanized" }).getAttribute("aria-pressed"),
    ).toBe("true");
    expect(
      screen.getByRole("button", { name: "layout.english" }).getAttribute("aria-pressed"),
    ).toBe("false");
  });
});
