/** useUiSettings version state tests (spec 0023). */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  getAppVersion,
  getSettings,
  openDownloadPage,
  saveSettings,
} from "../../src/infrastructure/tauriApi";
import { defaultSettings } from "../../src/domain/datastore";
import { useUiSettings } from "../../src/hooks/useUiSettings";

vi.mock("../../src/infrastructure/tauriApi", () => ({
  getSettings: vi.fn(),
  saveSettings: vi.fn(),
  getAppVersion: vi.fn(),
  openDownloadPage: vi.fn(),
}));

const mockGet = vi.mocked(getSettings);
const mockSave = vi.mocked(saveSettings);
const mockVersion = vi.mocked(getAppVersion);
const mockOpen = vi.mocked(openDownloadPage);

beforeEach(() => {
  mockGet.mockReset();
  mockSave.mockReset();
  mockVersion.mockReset();
  mockOpen.mockReset();
  mockGet.mockResolvedValue(defaultSettings());
  mockSave.mockResolvedValue(defaultSettings());
});

describe("useUiSettings version state", () => {
  it("reads the version once and settles on ready (covers AC-2)", async () => {
    mockVersion.mockResolvedValue("1.0.2");
    const { result, rerender } = renderHook(() => useUiSettings());
    await waitFor(() => {
      expect(result.current.versionState).toBe("ready");
    });
    expect(result.current.version).toBe("1.0.2");
    rerender();
    await waitFor(() => {
      expect(result.current.version).toBe("1.0.2");
    });
    expect(mockVersion).toHaveBeenCalledTimes(1);
  });

  it("settles on failed with a null version and no notice (covers AC-6)", async () => {
    mockVersion.mockRejectedValue(new Error("no shell"));
    const { result } = renderHook(() => useUiSettings());
    await waitFor(() => {
      expect(result.current.versionState).toBe("failed");
    });
    expect(result.current.version).toBeNull();
    expect(result.current.notice).toBeNull();
  });

  it("opens the download page and raises a notice only on failure (covers AC-5, AC-8)", async () => {
    mockVersion.mockResolvedValue("1.0.2");
    mockOpen.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useUiSettings());
    await waitFor(() => {
      expect(result.current.versionState).toBe("ready");
    });
    act(() => {
      result.current.getUpdates();
    });
    expect(mockOpen).toHaveBeenCalledTimes(1);
    expect(result.current.notice).toBeNull();

    mockOpen.mockRejectedValueOnce(new Error("no browser"));
    act(() => {
      result.current.getUpdates();
    });
    await waitFor(() => {
      expect(result.current.notice).toBe("settings.openFailed");
    });
  });
});
