/**
 * Version readout shared by Settings and the About dialog (spec 0023).
 * Renders nothing while pending, so no fallback flashes before the real value.
 * The caller owns the text color: Settings passes the themed default, while the
 * About dialog passes `text-black` to match its fixed Win95 gray panel.
 */
import type { StringKey } from "../i18n/keys";
import type { VersionState } from "../hooks/useUiSettings";

export interface VersionLineProps {
  version: string | null;
  versionState: VersionState;
  text: (key: StringKey) => string;
  /** Overrides the themed default text color. */
  className?: string;
}

const DEFAULT_CLASS = "text-(--color-muted)";

export function VersionLine({ version, versionState, text, className }: VersionLineProps) {
  if (versionState === "pending") return null;
  const shown = versionState === "ready" && version ? version : text("about.versionUnavailable");
  const tone = className ?? DEFAULT_CLASS;
  return (
    <p className={`self-center text-sm ${tone}`}>
      <span className="font-semibold">{text("about.version")}:</span> {shown}
    </p>
  );
}
