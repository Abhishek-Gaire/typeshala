/**
 * Thin typed wrapper around Tauri commands (spec 0002).
 * All bridge calls pass through here so views never touch `invoke`.
 */
import { invoke } from "@tauri-apps/api/core";
import { BridgeError } from "../domain/datastore";
import type {
  Attempt,
  LayoutId,
  Lesson,
  NewAttempt,
  Progress,
  Settings,
  SettingsPatch,
} from "../domain/datastore";

/** True when running inside the Tauri shell. */
export function isTauri(): boolean {
  return "__TAURI_INTERNALS__" in window;
}

/** Call a command and normalize failures to the one error shape. */
async function call<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  try {
    return await invoke<T>(command, args);
  } catch (raw) {
    throw toBridgeError(raw);
  }
}

/** Normalize unknown invoke failures to BridgeError. */
export function toBridgeError(raw: unknown): BridgeError {
  if (raw instanceof BridgeError) return raw;
  if (typeof raw === "string") return new BridgeError("bridge-failed", raw);
  if (typeof raw === "object" && raw !== null && "code" in raw && "message" in raw) {
    const err = raw as Record<string, unknown>;
    if (typeof err.code === "string" && typeof err.message === "string") {
      return new BridgeError(err.code, err.message);
    }
  }
  return new BridgeError("bridge-failed", "unknown bridge failure");
}

/** Load all lessons, or only one layout when given. */
export function loadLessons(layout?: LayoutId): Promise<Lesson[]> {
  return call<Lesson[]>("load_lessons", { layout: layout ?? null });
}

/** Load one lesson by its stable id. */
export function getLesson(id: string): Promise<Lesson> {
  return call<Lesson>("get_lesson", { id });
}

/** Save one finished attempt. The id is assigned inside. */
export function saveResult(attempt: NewAttempt): Promise<Attempt> {
  return call<Attempt>("save_result", { attempt });
}

/** Filters for a progress read. All optional. */
export interface ProgressFilter {
  lessonId?: string;
  layout?: LayoutId;
  limit?: number;
}

/** Read attempts with optional filters, plus derived per lesson bests. */
export function getProgress(filter: ProgressFilter = {}): Promise<Progress> {
  return call<Progress>("get_progress", {
    lessonId: filter.lessonId ?? null,
    layout: filter.layout ?? null,
    limit: filter.limit ?? null,
  });
}

/** Load settings, or safe defaults on first run. */
export function getSettings(): Promise<Settings> {
  return call<Settings>("get_settings");
}

/** Save a partial patch merged over current settings. */
export function saveSettings(patch: SettingsPatch): Promise<Settings> {
  return call<Settings>("save_settings", { patch });
}
