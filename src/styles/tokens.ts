/** Shared design tokens (spec 0003). Single source for color, type, spacing. */

export const colors = {
  brand: "var(--color-brand)",
  surface: "var(--color-surface)",
  ink: "var(--color-ink)",
  muted: "var(--color-muted)",
  chrome: "var(--color-chrome)",
  target: "var(--color-target)",
  typed: "var(--color-typed)",
  keyFace: "var(--color-keyface)",
  keyModifier: "var(--color-keymodifier)",
  keyNext: "var(--color-keynext)",
  level1: "var(--color-level1)",
  level2: "var(--color-level2)",
  level3: "var(--color-level3)",
} as const;

export const typeScale = {
  promptStandard: "1.75rem",
  promptLarge: "2.5rem",
  base: "1rem",
} as const;

export const spacing = { xs: "0.5rem", sm: "1rem", md: "1.5rem", lg: "2.5rem" } as const;

export const radius = { md: "0.75rem", lg: "1rem" } as const;

export type PromptSize = "standard" | "large";

/** Map a prompt size choice to a font size value. */
export function promptFontSize(size: PromptSize): string {
  return size === "large" ? typeScale.promptLarge : typeScale.promptStandard;
}
