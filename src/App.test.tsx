/** App layout switch plus Traditional list tests (spec 0007, AC-1, AC-2, AC-6). */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { invoke } from "@tauri-apps/api/core";
import App from "./App";
import { defaultSettings } from "./domain/datastore";
import type { Lesson } from "./domain/datastore";
import enLessons from "./data/lessons/en-qwerty.json";
import tradLessons from "./data/lessons/ne-traditional.json";

vi.mock("@tauri-apps/api/core", () => ({ invoke: vi.fn() }));

const mockInvoke = vi.mocked(invoke);
const allLessons = [...(enLessons as Lesson[]), ...(tradLessons as Lesson[])];

function mockBridge(progressError = false) {
  mockInvoke.mockImplementation(((command: string, args?: Record<string, unknown>) => {
    if (command === "load_lessons") {
      const layout = (args as { layout: string | null }).layout;
      return Promise.resolve(
        layout === null ? allLessons : allLessons.filter((l) => l.layout === layout),
      );
    }
    if (command === "get_progress") {
      if (progressError) return Promise.reject(new Error("corrupt"));
      return Promise.resolve({ attempts: [], bests: [] });
    }
    if (command === "get_settings") return Promise.resolve(defaultSettings());
    if (command === "save_settings") return Promise.resolve(defaultSettings());
    return Promise.reject(new Error("unexpected " + command));
  }) as typeof invoke);
}

beforeEach(() => {
  mockInvoke.mockReset();
});

describe("App Traditional layout", () => {
  it("offers English plus Romanized plus Traditional choices (covers AC-1)", async () => {
    mockBridge();
    render(<App />);
    expect(await screen.findByRole("button", { name: "English" })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "Nepali Romanized" })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "Nepali Traditional" })).toBeInTheDocument();
  });

  it("lists Traditional lessons staged with later ones locked (covers AC-1)", async () => {
    const user = userEvent.setup();
    mockBridge();
    render(<App />);
    await user.click(await screen.findByRole("button", { name: "Nepali Traditional" }));
    expect(await screen.findByText("स्वरहरू")).toBeInTheDocument();
    expect(screen.getByText("संयुक्ताक्षर")).toBeInTheDocument();
    expect(screen.getAllByText("Finish the prior lesson to open this")).toHaveLength(4);
    const starts = screen.getAllByRole("button", { name: "Start" });
    expect(starts[0]).toBeEnabled();
    expect(starts[1]).toBeDisabled();
  });

  it("opens the typing view for the picked Traditional lesson (covers AC-2)", async () => {
    const user = userEvent.setup();
    mockBridge();
    render(<App />);
    await user.click(await screen.findByRole("button", { name: "Nepali Traditional" }));
    const starts = await screen.findAllByRole("button", { name: "Start" });
    await user.click(starts[0]);
    expect(await screen.findByRole("textbox", { name: "स्वरहरू" })).toBeInTheDocument();
  });

  it("still opens the first lesson when progress reads corrupt (covers AC-6)", async () => {
    const user = userEvent.setup();
    mockBridge(true);
    render(<App />);
    await user.click(await screen.findByRole("button", { name: "Nepali Traditional" }));
    expect(await screen.findByText("स्वरहरू")).toBeInTheDocument();
    const starts = screen.getAllByRole("button", { name: "Start" });
    expect(starts[0]).toBeEnabled();
  });
});
