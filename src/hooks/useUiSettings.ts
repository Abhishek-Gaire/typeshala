/** UI settings state wired to the saved settings port (spec 0003). */
import { useCallback, useEffect, useState } from "react";
import {
  defaultSettings,
  type LayoutId,
  type Settings,
  type Theme,
  type UiLanguage,
} from "../domain/datastore";
import { getSettings, saveSettings } from "../infrastructure/tauriApi";
import type { StringKey } from "../i18n/keys";
import { t } from "../i18n/keys";
import { promptFontSize, type PromptSize } from "../styles/tokens";

function toPromptSize(px: number): PromptSize {
  return px >= 32 ? "large" : "standard";
}

function toPx(size: PromptSize): number {
  return size === "large" ? 40 : 28;
}

export interface UiSettingsApi {
  theme: Theme;
  locale: UiLanguage;
  layout: LayoutId;
  promptSize: PromptSize;
  promptPx: number;
  loaded: boolean;
  notice: string | null;
  text: (key: StringKey) => string;
  setTheme: (theme: Theme) => void;
  setLocale: (locale: UiLanguage) => void;
  setLayout: (layout: LayoutId) => void;
  setPromptSize: (size: PromptSize) => void;
}

/** Load saved theme plus locale plus prompt size, apply theme class, persist changes. */
export function useUiSettings(): UiSettingsApi {
  const [settings, setSettings] = useState<Settings>(defaultSettings());
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    getSettings()
      .then((s) => {
        setSettings(s);
      })
      .catch(() => {
        setNotice("settings-fallback");
      })
      .finally(() => {
        setLoaded(true);
      });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const dark = settings.theme === "dark";
    root.classList.toggle("dark", dark);
    root.style.colorScheme = dark ? "dark" : "light";
  }, [settings.theme]);

  const patch = useCallback((p: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...p }));
    saveSettings(p).catch(() => {
      setNotice("settings-save-failed");
    });
  }, []);

  const locale = settings.uiLanguage;
  const promptSize = toPromptSize(settings.promptSize);

  return {
    theme: settings.theme,
    locale,
    layout: settings.layout,
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
    setPromptSize: (size) => {
      patch({ promptSize: toPx(size) });
    },
  };
}

export { promptFontSize };
