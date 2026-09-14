/** Typed i18n keys with English fallback (spec 0003). */
import en from "./en.json";
import ne from "./ne.json";

export type Locale = "en" | "ne";
export type StringKey = keyof typeof en;

const bundles: Record<Locale, Partial<Record<StringKey, string>>> = { en, ne };

/** Look up a key in the active locale, fall back to English, never blank. */
export function t(key: StringKey, locale: Locale): string {
  const hit = bundles[locale][key];
  if (hit !== undefined) return hit;
  return en[key];
}

export function isStringKey(key: string): key is StringKey {
  return key in en;
}
