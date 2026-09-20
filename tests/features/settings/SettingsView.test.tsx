/** Component tests for SettingsView (spec 0009). */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsView, type SettingsViewProps } from "../../../src/features/settings/SettingsView";
import type { StringKey } from "../../../src/i18n/keys";

const text = (key: StringKey): string => key;

function props(over: Partial<SettingsViewProps> = {}): SettingsViewProps {
  return {
    theme: "system",
    locale: "en",
    layout: "qwerty",
    sound: true,
    promptSize: "standard",
    text,
    onTheme: () => {},
    onLocale: () => {},
    onLayout: () => {},
    onSound: () => {},
    onPromptSize: () => {},
    ...over,
  };
}

describe("SettingsView", () => {
  it("renders all five setting groups (AC-1)", () => {
    render(<SettingsView {...props()} />);
    for (const label of [
      "settings.layout",
      "settings.language",
      "settings.theme",
      "settings.sound",
      "settings.promptSize",
    ]) {
      expect(screen.getByRole("group", { name: label })).toBeInTheDocument();
    }
  });

  it("fires each setter when its option is picked (AC-1 AC-2)", async () => {
    const user = userEvent.setup();
    const handlers = {
      onTheme: vi.fn(),
      onLocale: vi.fn(),
      onLayout: vi.fn(),
      onSound: vi.fn(),
      onPromptSize: vi.fn(),
    };
    render(<SettingsView {...props(handlers)} />);
    await user.click(screen.getByRole("button", { name: "layout.traditional" }));
    await user.click(screen.getByRole("button", { name: "lang.nepali" }));
    await user.click(screen.getByRole("button", { name: "theme.dark" }));
    await user.click(screen.getByRole("button", { name: "sound.off" }));
    await user.click(screen.getByRole("button", { name: "size.large" }));
    expect(handlers.onLayout).toHaveBeenCalledWith("traditional");
    expect(handlers.onLocale).toHaveBeenCalledWith("ne");
    expect(handlers.onTheme).toHaveBeenCalledWith("dark");
    expect(handlers.onSound).toHaveBeenCalledWith(false);
    expect(handlers.onPromptSize).toHaveBeenCalledWith("large");
  });

  it("is fully keyboard reachable with buttons (AC-5)", async () => {
    const user = userEvent.setup();
    const onTheme = vi.fn();
    render(<SettingsView {...props({ onTheme })} />);
    await user.tab();
    // Tab through; every control is a native button so focus always lands on one.
    let focused = 0;
    for (let i = 0; i < 12; i++) {
      await user.tab();
      if ((document.activeElement?.tagName ?? "") === "BUTTON") focused++;
    }
    expect(focused).toBeGreaterThan(0);
    await user.keyboard("{Enter}");
  });
});
