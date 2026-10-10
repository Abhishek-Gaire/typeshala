import { beforeEach, describe, expect, it, vi } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import { getVersion } from "@tauri-apps/api/app";
import { openUrl } from "@tauri-apps/plugin-opener";
import {
  DOWNLOAD_PAGE_URL,
  getAppVersion,
  getLesson,
  getProgress,
  getSettings,
  isTauri,
  loadLessons,
  openDownloadPage,
  saveResult,
  saveSettings,
  toBridgeError,
} from "../../src/infrastructure/tauriApi";
import { BridgeError } from "../../src/domain/datastore";

vi.mock("@tauri-apps/api/core", () => ({ invoke: vi.fn() }));
vi.mock("@tauri-apps/api/app", () => ({ getVersion: vi.fn() }));
vi.mock("@tauri-apps/plugin-opener", () => ({ openUrl: vi.fn() }));

const mockInvoke = vi.mocked(invoke);
const mockGetVersion = vi.mocked(getVersion);
const mockOpenUrl = vi.mocked(openUrl);

beforeEach(() => {
  mockInvoke.mockReset();
  mockGetVersion.mockReset();
  mockOpenUrl.mockReset();
});

describe("getAppVersion (spec 0023)", () => {
  it("returns the version the shell reports", async () => {
    mockGetVersion.mockResolvedValueOnce("1.0.2");
    await expect(getAppVersion()).resolves.toBe("1.0.2");
  });

  it("normalizes a shell read failure to a BridgeError, covers AC-11", async () => {
    mockGetVersion.mockRejectedValueOnce("no shell");
    await expect(getAppVersion()).rejects.toBeInstanceOf(BridgeError);
  });
});

describe("openDownloadPage (spec 0023)", () => {
  it("opens the download page constant unchanged, covers AC-5", async () => {
    mockOpenUrl.mockResolvedValueOnce(undefined);
    await openDownloadPage();
    expect(mockOpenUrl).toHaveBeenCalledWith(DOWNLOAD_PAGE_URL);
    expect(DOWNLOAD_PAGE_URL).toBe("https://typeshala.abhishekgaire.com.np");
  });

  it("normalizes an opener failure to a BridgeError, covers AC-8", async () => {
    mockOpenUrl.mockRejectedValueOnce({ code: "opener-failed", message: "no browser" });
    await expect(openDownloadPage()).rejects.toMatchObject({ code: "opener-failed" });
  });
});

describe("loadLessons", () => {
  it("passes the layout through, covers AC-2", async () => {
    mockInvoke.mockResolvedValueOnce([]);
    await loadLessons("qwerty");
    expect(mockInvoke).toHaveBeenCalledWith("load_lessons", { layout: "qwerty" });
  });

  it("sends null when no layout is given, covers AC-2", async () => {
    mockInvoke.mockResolvedValueOnce([]);
    await loadLessons();
    expect(mockInvoke).toHaveBeenCalledWith("load_lessons", { layout: null });
  });
});

describe("getLesson", () => {
  it("passes the id through, covers AC-2", async () => {
    mockInvoke.mockResolvedValueOnce({ id: "en-home" });
    await getLesson("en-home");
    expect(mockInvoke).toHaveBeenCalledWith("get_lesson", { id: "en-home" });
  });
});

describe("saveResult", () => {
  it("passes the attempt without adding an id, covers AC-1", async () => {
    const attempt = {
      lessonId: "en-home",
      layout: "qwerty" as const,
      startedAt: "2026-09-12T00:00:00Z",
      durationMs: 1000,
      wpm: 30,
      accuracy: 95,
      errors: [],
      completed: true,
    };
    mockInvoke.mockResolvedValueOnce({ ...attempt, id: "a1" });
    const saved = await saveResult(attempt);
    expect(mockInvoke).toHaveBeenCalledWith("save_result", { attempt });
    expect(saved.id).toBe("a1");
  });
});

describe("getProgress", () => {
  it("maps a full filter through, covers AC-1 and AC-5", async () => {
    mockInvoke.mockResolvedValueOnce({ attempts: [], bests: [] });
    await getProgress({ lessonId: "en-home", layout: "qwerty", limit: 10 });
    expect(mockInvoke).toHaveBeenCalledWith("get_progress", {
      lessonId: "en-home",
      layout: "qwerty",
      limit: 10,
    });
  });

  it("sends nulls for an empty filter, covers AC-5", async () => {
    mockInvoke.mockResolvedValueOnce({ attempts: [], bests: [] });
    await getProgress();
    expect(mockInvoke).toHaveBeenCalledWith("get_progress", {
      lessonId: null,
      layout: null,
      limit: null,
    });
  });
});

describe("settings", () => {
  it("loads with no args, covers AC-3", async () => {
    mockInvoke.mockResolvedValueOnce({});
    await getSettings();
    expect(mockInvoke).toHaveBeenCalledWith("get_settings", undefined);
  });

  it("saves a partial patch, covers AC-3", async () => {
    mockInvoke.mockResolvedValueOnce({});
    await saveSettings({ theme: "dark" });
    expect(mockInvoke).toHaveBeenCalledWith("save_settings", { patch: { theme: "dark" } });
  });
});

describe("error shape", () => {
  it("wraps an invoke string failure in BridgeError", async () => {
    mockInvoke.mockRejectedValueOnce("nope");
    await expect(loadLessons()).rejects.toMatchObject({
      code: "bridge-failed",
      message: "nope",
    });
  });

  it("passes a Rust bridge error through untouched", () => {
    const err = toBridgeError({ code: "not-found", message: "missing" });
    expect(err).toBeInstanceOf(BridgeError);
    expect(err.code).toBe("not-found");
  });

  it("falls back for junk failures", () => {
    expect(toBridgeError(42).code).toBe("bridge-failed");
    expect(toBridgeError(null).message).toBe("unknown bridge failure");
  });

  it("keeps a BridgeError as is", () => {
    const err = new BridgeError("x", "y");
    expect(toBridgeError(err)).toBe(err);
  });
});

describe("isTauri", () => {
  it("is false outside the Tauri shell", () => {
    expect(isTauri()).toBe(false);
  });
});
