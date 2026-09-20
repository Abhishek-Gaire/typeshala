/** useUiSettings settings-slice tests (spec 0009: sound, system theme, size, notice keys). */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { getSettings, saveSettings } from "../../src/infrastructure/tauriApi";
import { defaultSettings } from "../../src/domain/datastore";
import { useUiSettings } from "../../src/hooks/useUiSettings";

vi.mock("../../src/infrastructure/tauriApi", () => ({
  getSettings: vi.fn(),
  saveSettings: vi.fn(),
}));

const mockGet = vi.mocked(getSettings);
const mockSave = vi.mocked(saveSettings);

beforeEach(() => {
  mockGet.mockReset();
  mockSave.mockReset();
  mockSave.mockResolvedValue(defaultSettings());
});

describe("useUiSettings settings slice", () => {
  it("exposes sound plus persists a sound toggle (AC-1 AC-2)", async () => {
    mockGet.mockResolvedValueOnce({ ...defaultSettings(), sound: true });
    const { result } = renderHook(() => useUiSettings());
    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });
    expect(result.current.sound).toBe(true);
    act(() => {
      result.current.setSound(false);
    });
    expect(result.current.sound).toBe(false);
    expect(mockSave).toHaveBeenCalledWith({ sound: false });
  });

  it("maps stored px to standard and large labels (AC-4)", async () => {
    mockGet.mockResolvedValueOnce({ ...defaultSettings(), promptSize: 40 });
    const { result } = renderHook(() => useUiSettings());
    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });
    expect(result.current.promptSize).toBe("large");
    act(() => {
      result.current.setPromptSize("standard");
    });
    expect(mockSave).toHaveBeenCalledWith({ promptSize: 28 });
  });

  it("seeds a standard 28 default (AC-4 fix)", () => {
    expect(defaultSettings().promptSize).toBe(28);
  });

  it("uses i18n notice keys on load fail and save fail (AC-3 AC-5)", async () => {
    mockGet.mockRejectedValueOnce(new Error("missing store"));
    const { result } = renderHook(() => useUiSettings());
    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });
    expect(result.current.notice).toBe("settings.restoredDefaults");

    mockGet.mockResolvedValueOnce(defaultSettings());
    const { result: r2 } = renderHook(() => useUiSettings());
    await waitFor(() => {
      expect(r2.current.loaded).toBe(true);
    });
    mockSave.mockRejectedValueOnce(new Error("write failed"));
    act(() => {
      r2.current.setTheme("dark");
    });
    await waitFor(() => {
      expect(r2.current.notice).toBe("settings.saveFailed");
    });
  });

  it("applies the dark class for an explicit dark theme (AC-2)", async () => {
    mockGet.mockResolvedValueOnce({ ...defaultSettings(), theme: "dark" });
    const { result } = renderHook(() => useUiSettings());
    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
