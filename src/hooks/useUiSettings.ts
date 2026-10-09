/** UI settings state wired to the saved settings port (specs 0003, 0009). */
import { useCallback, useEffect, useState } from "react";
import {
  defaultSettings,
  type LayoutId,
  type Settings,
  type Theme,
  type UiLanguage,
} from "../domain/datastore";
import { getSettings, saveSettings, verifyLog } from "../infrastructure/tauriApi";
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

export interface UiSettingsApi {
  theme: Theme;
  locale: UiLanguage;
  layout: LayoutId;
  sound: boolean;
  promptSize: PromptSize;
  promptPx: number;
  loaded: boolean;
  notice: string | null;
  text: (key: StringKey) => string;
  setTheme: (theme: Theme) => void;
  setLocale: (locale: UiLanguage) => void;
  setLayout: (layout: LayoutId) => void;
  setSound: (sound: boolean) => void;
  setPromptSize: (size: PromptSize) => void;
  clearNotice: () => void;
}

/** Load saved settings, apply theme class, persist changes. */
export function useUiSettings(): UiSettingsApi {
  const [settings, setSettings] = useState<Settings>(defaultSettings());
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    getSettings()
      .then((s) => {
        setSettings(s);
        verifyLog("settings_loaded", { ...s });
      })
      .catch(() => {
        setNotice("settings.restoredDefaults");
        verifyLog("settings_load_failed", {});
      })
      .finally(() => {
        setLoaded(true);
      });
  }, []);

  useEffect(() => {
    verifyLog("toolbar_titles", {
      traditional: t("layout.traditional", settings.uiLanguage),
      romanized: t("layout.romanized", settings.uiLanguage),
      english: t("layout.english", settings.uiLanguage),
    });
  }, [settings.uiLanguage]);

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
    verifyLog("settings_saved", { patch: p, layout: p.layout ?? null });
    saveSettings(p).catch(() => {
      setNotice("settings.saveFailed");
      verifyLog("settings_save_failed", { patch: p });
    });
  }, []);

  const locale = settings.uiLanguage;
  const promptSize = toPromptSize(settings.promptSize);

  return {
    theme: settings.theme,
    locale,
    layout: settings.layout,
    sound: settings.sound,
    promptSize,
    promptPx: settings.promptSize,
    loaded,
    notice,
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
    clearNotice: () => {
      setNotice(null);
    },
  };
}

export { promptFontSize };
