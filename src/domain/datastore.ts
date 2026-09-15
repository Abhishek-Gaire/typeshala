/**
 * Saved shapes for the local store (spec 0002).
 * Mirrors the Rust models in `src-tauri/src/models.rs`.
 * Pure helpers stay here so they run in tests without Tauri.
 */

/** Storage schema version. Bump when a stored shape changes. */
export const SCHEMA_VERSION = 1;

/** Typing layout a lesson or attempt belongs to. */
export type LayoutId = "qwerty" | "romanized" | "traditional";

/** UI theme choice. */
export type Theme = "light" | "dark" | "system";

/** UI language choice. */
export type UiLanguage = "en" | "ne";

/** A read only lesson shipped with the app. */
export interface Lesson {
  id: string;
  layout: LayoutId;
  title: string;
  prompt: string;
  order: number;
  level?: string;
}

/** One finished typing attempt. Append only. */
export interface Attempt {
  id: string;
  lessonId: string;
  layout: LayoutId;
  startedAt: string;
  durationMs: number;
  wpm: number;
  accuracy: number;
  errors: number[];
  completed: boolean;
}

/** Input for `save_result`. Same as `Attempt` minus the id. */
export type NewAttempt = Omit<Attempt, "id">;

/** Learner settings. Stored under the `settings` key. */
export interface Settings {
  schemaVersion: number;
  layout: LayoutId;
  theme: Theme;
  sound: boolean;
  promptSize: number;
  uiLanguage: UiLanguage;
  fingerGuidance: boolean;
}

/** Partial settings input for `save_settings`. Every field optional. */
export type SettingsPatch = Partial<Omit<Settings, "schemaVersion">>;

/** Derived best score for one lesson, computed at read time. */
export interface BestScore {
  lessonId: string;
  wpm: number;
  accuracy: number;
  attempts: number;
}

/** Progress read output: filtered attempts plus derived bests. */
export interface Progress {
  attempts: Attempt[];
  bests: BestScore[];
}

/** One steady error shape across bridge plus UI. */
export class BridgeError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "BridgeError";
    this.code = code;
  }
}

/** Safe defaults used on first run and after corrupt recovery. */
export function defaultSettings(): Settings {
  return {
    schemaVersion: SCHEMA_VERSION,
    layout: "qwerty",
    theme: "system",
    sound: true,
    promptSize: 28,
    uiLanguage: "en",
    fingerGuidance: true,
  };
}

/**
 * Merge a patch over current settings.
 * Unknown fields are dropped by the caller and missing ones keep
 * their current value. Out of range prompt sizes are ignored.
 */
export function mergeSettings(current: Settings, patch: SettingsPatch): Settings {
  const next: Settings = { ...current, schemaVersion: SCHEMA_VERSION };
  if (patch.layout !== undefined) next.layout = patch.layout;
  if (patch.theme !== undefined) next.theme = patch.theme;
  if (patch.sound !== undefined) next.sound = patch.sound;
  if (patch.promptSize !== undefined && patch.promptSize >= 12 && patch.promptSize <= 48) {
    next.promptSize = patch.promptSize;
  }
  if (patch.uiLanguage !== undefined) next.uiLanguage = patch.uiLanguage;
  if (patch.fingerGuidance !== undefined) next.fingerGuidance = patch.fingerGuidance;
  return next;
}

/** Check an incoming attempt before it is stored. Throws a BridgeError. */
export function validateAttempt(input: NewAttempt): void {
  if (input.lessonId.trim() === "") {
    throw new BridgeError("validation-failed", "lessonId must not be empty");
  }
  if (input.durationMs <= 0) {
    throw new BridgeError("validation-failed", "durationMs must be above zero");
  }
  if (!(input.accuracy >= 0 && input.accuracy <= 100)) {
    throw new BridgeError("validation-failed", "accuracy must sit between 0 and 100");
  }
  if (!Number.isFinite(input.wpm) || input.wpm < 0) {
    throw new BridgeError("validation-failed", "wpm must be zero or above");
  }
}

/**
 * Derive per lesson bests from an attempt list. Best means highest WPM
 * with ties broken by accuracy. Output is ordered by lesson id.
 */
export function deriveBests(attempts: Attempt[]): BestScore[] {
  const best = new Map<string, Attempt>();
  const counts = new Map<string, number>();
  for (const attempt of attempts) {
    counts.set(attempt.lessonId, (counts.get(attempt.lessonId) ?? 0) + 1);
    const prev = best.get(attempt.lessonId);
    if (
      prev === undefined ||
      attempt.wpm > prev.wpm ||
      (attempt.wpm === prev.wpm && attempt.accuracy > prev.accuracy)
    ) {
      best.set(attempt.lessonId, attempt);
    }
  }
  return [...best.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([lessonId, top]) => ({
      lessonId,
      wpm: top.wpm,
      accuracy: top.accuracy,
      attempts: counts.get(lessonId) ?? 0,
    }));
}
