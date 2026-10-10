/** UI settings state wired to the saved settings port (specs 0003, 0009). */
import { useCallback, useEffect, useState } from "react";
import {
  defaultSettings,
  type LayoutId,
  type Settings,
  type Theme,
  type UiLanguage,
} from "../domain/datastore";
import {
  getSettings,
  saveSettings,
  getAppVersion,
  openDownloadPage,
} from "../infrastructure/tauriApi";
import type { StringKey } from "../i18n/keys";
import { t } from "../i18n/keys";
import { promptFontSize, type PromptSize } from "../styles/tokens";

function toPromptSize(px: number): PromptSize {
  return px >= 32 ? "large" : "standard";
}

function toPx(size: PromptSize): number {
  return size === "large" ? 40 : 28;
}

/** Resolve system theme via prefers-color-scheme. */
function resolveSystemIsDark(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Lifecycle of the one time version read (spec 0023). */
export type VersionState = "pending" | "ready" | "failed";

export interface UiSettingsApi {
  theme: Theme;
  locale: UiLanguage;
  layout: LayoutId;
  sound: boolean;
  promptSize: PromptSize;
  promptPx: number;
  loaded: boolean;
  notice: string | null;
  /** Running app version, or null unless the read succeeded. */
  version: string | null;
  versionState: VersionState;
  text: (key: StringKey) => string;
  setTheme: (theme: Theme) => void;
  setLocale: (locale: UiLanguage) => void;
  setLayout: (layout: LayoutId) => void;
  setSound: (sound: boolean) => void;
  setPromptSize: (size: PromptSize) => void;
  /** Open the download page. Surfaces a notice if the browser will not open. */
  getUpdates: () => void;
  clearNotice: () => void;
}

/** Load saved settings, apply theme class, persist changes. */
export function useUiSettings(): UiSettingsApi {
  const [settings, setSettings] = useState<Settings>(defaultSettings());
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [version, setVersion] = useState<string | null>(null);
  const [versionState, setVersionState] = useState<VersionState>("pending");

  useEffect(() => {
    getSettings()
      .then((s) => {
        setSettings(s);
      })
      .catch(() => {
        setNotice("settings.restoredDefaults");
      })
      .finally(() => {
        setLoaded(true);
      });
  }, []);

  // Version is fixed at build time: read once, never re-read (spec 0023).
  useEffect(() => {
    let live = true;
    getAppVersion()
      .then((v) => {
        if (!live) return;
        setVersion(v);
        setVersionState("ready");
      })
      .catch(() => {
        if (!live) return;
        setVersionState("failed");
      });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const apply = (isDark: boolean) => {
      root.classList.toggle("dark", isDark);
      root.style.colorScheme = isDark ? "dark" : "light";
    };
    if (settings.theme === "system") {
      if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
        apply(false);
        return;
      }
      apply(resolveSystemIsDark());
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = (e: MediaQueryListEvent) => {
        apply(e.matches);
      };
      mq.addEventListener("change", onChange);
      return () => {
        mq.removeEventListener("change", onChange);
      };
    }
    apply(settings.theme === "dark");
  }, [settings.theme]);

  const patch = useCallback((p: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...p }));
    saveSettings(p).catch(() => {
      setNotice("settings.saveFailed");
    });
  }, []);

  const locale = settings.uiLanguage;
  const promptSize = toPromptSize(settings.promptSize);

  const getUpdates = useCallback(() => {
    openDownloadPage().catch(() => {
      setNotice("settings.openFailed");
    });
  }, []);

  return {
    theme: settings.theme,
    locale,
    layout: settings.layout,
    sound: settings.sound,
    promptSize,
    promptPx: settings.promptSize,
    loaded,
    notice,
    version,
    versionState,
    text: (key) => t(key, locale),
    setTheme: (theme) => {
      patch({ theme });
    },
    setLocale: (uiLanguage) => {
      patch({ uiLanguage });
    },
    setLayout: (layout) => {
      patch({ layout });
    },
    setSound: (sound) => {
      patch({ sound });
    },
    setPromptSize: (size) => {
      patch({ promptSize: toPx(size) });
    },
    getUpdates,
    clearNotice: () => {
      setNotice(null);
    },
  };
}

export { promptFontSize };
