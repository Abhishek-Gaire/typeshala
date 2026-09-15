/** i18n bundle plus fallback checks (spec 0007, AC-6). */
import { describe, expect, it } from "vitest";
import en from "./en.json";
import ne from "./ne.json";
import { t } from "./keys";

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
});
