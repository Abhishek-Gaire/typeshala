/** useUiSettings layout tests (spec 0006, AC-1). */
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

describe("useUiSettings layout", () => {
  it("exposes the saved romanized layout once loaded (covers AC-1)", async () => {
    mockGet.mockResolvedValueOnce({ ...defaultSettings(), layout: "romanized" });
    const { result } = renderHook(() => useUiSettings());
    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });
    expect(result.current.layout).toBe("romanized");
  });

  it("persists a layout switch through the settings port (covers AC-1)", async () => {
    mockGet.mockResolvedValueOnce(defaultSettings());
    const { result } = renderHook(() => useUiSettings());
    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });
    act(() => {
      result.current.setLayout("romanized");
    });
    expect(result.current.layout).toBe("romanized");
    expect(mockSave).toHaveBeenCalledWith({ layout: "romanized" });
  });

  it("falls back with a notice when settings cannot load (covers AC-6)", async () => {
    mockGet.mockRejectedValueOnce(new Error("missing store"));
    const { result } = renderHook(() => useUiSettings());
    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });
    expect(result.current.layout).toBe("qwerty");
    expect(result.current.notice).not.toBeNull();
  });
});
