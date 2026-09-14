/** Base button on tokens only. Keyboard focus is always visible via themes.css. */
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "quiet" };

export function Button({ variant = "primary", ...rest }: Props) {
  const base = "rounded-xl px-5 py-3 text-base font-semibold transition focus-visible:outline-3";
  const style =
    variant === "primary"
      ? "bg-(--color-brand) text-white hover:opacity-90"
      : "bg-transparent text-(--color-ink) border border-(--color-muted) hover:opacity-80";
  return <button {...rest} className={`${base} ${style} ${rest.className ?? ""}`} />;
}
