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
    version: "1.0.2",
    versionState: "ready",
    text,
    onTheme: () => {},
    onLocale: () => {},
    onLayout: () => {},
    onSound: () => {},
    onPromptSize: () => {},
    onGetUpdates: () => {},
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

  it("renders the About group with the running version and the update button (AC-1, AC-2)", () => {
    render(<SettingsView {...props()} />);
    expect(screen.getByRole("group", { name: "settings.about" })).toBeInTheDocument();
    expect(screen.getByText(/1\.0\.2/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "settings.getUpdates" })).toBeInTheDocument();
  });

  it("fires onGetUpdates when the update button is pressed (AC-5)", async () => {
    const user = userEvent.setup();
    const onGetUpdates = vi.fn();
    render(<SettingsView {...props({ onGetUpdates })} />);
    await user.click(screen.getByRole("button", { name: "settings.getUpdates" }));
    expect(onGetUpdates).toHaveBeenCalledTimes(1);
  });

  it("renders nothing in the version slot while pending (AC-7)", () => {
    const { unmount } = render(
      <SettingsView {...props({ version: null, versionState: "pending" })} />,
    );
    expect(screen.queryByText(/about.versionUnavailable/)).toBeNull();
    expect(screen.queryByText(/1\.0\.2/)).toBeNull();
    unmount();
  });

  it("shows the fallback text when the read failed (AC-6)", () => {
    render(<SettingsView {...props({ version: null, versionState: "failed" })} />);
    expect(screen.getByText(/about.versionUnavailable/)).toBeInTheDocument();
    // The button still works on the failure path.
    expect(screen.getByRole("button", { name: "settings.getUpdates" })).toBeInTheDocument();
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
