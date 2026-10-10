/** i18n bundle plus fallback checks (spec 0007, AC-6). */
import { describe, expect, it } from "vitest";
import en from "../../src/i18n/en.json";
import ne from "../../src/i18n/ne.json";
import { t } from "../../src/i18n/keys";

describe("i18n bundles", () => {
  it("ships the Traditional layout label in both languages with no blanks (covers AC-6)", () => {
    expect(en["layout.traditional"].trim().length).toBeGreaterThan(0);
    expect(ne["layout.traditional"].trim().length).toBeGreaterThan(0);
  });

  it("never resolves blank in either language (covers AC-6)", () => {
    for (const key of Object.keys(en) as (keyof typeof en)[]) {
      expect(t(key, "en").trim().length).toBeGreaterThan(0);
      expect(t(key, "ne").trim().length).toBeGreaterThan(0);
    }
  });

  it("carries no hardcoded version, so a release cannot make it stale (spec 0023 AC-3)", () => {
    expect(en["about.body"]).not.toMatch(/\d+\.\d+\.\d+/);
    expect(ne["about.body"]).not.toMatch(/\d+\.\d+\.\d+/);
  });

  it("ships every new version and update string in both languages (spec 0023 AC-4)", () => {
    // The Nepali bundle is Partial by contract (keys.ts), so read it as such.
    const nepali: Record<string, string | undefined> = ne;
    for (const key of [
      "settings.about",
      "settings.getUpdates",
      "settings.openFailed",
      "about.version",
      "about.versionUnavailable",
    ]) {
      expect(nepali[key]?.trim().length ?? 0).toBeGreaterThan(0);
    }
  });
});
