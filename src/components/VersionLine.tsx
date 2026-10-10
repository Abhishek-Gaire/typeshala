/**
 * Version readout shared by Settings and the About dialog (spec 0023).
 * Renders nothing while pending, so no fallback flashes before the real value.
 */
import type { StringKey } from "../i18n/keys";
import type { VersionState } from "../hooks/useUiSettings";

export interface VersionLineProps {
  version: string | null;
  versionState: VersionState;
  text: (key: StringKey) => string;
  className?: string;
}

export function VersionLine({ version, versionState, text, className }: VersionLineProps) {
  if (versionState === "pending") return null;
  const shown = versionState === "ready" && version ? version : text("about.versionUnavailable");
  return (
    <p className={`self-center text-sm text-stone-700 dark:text-stone-300 ${className ?? ""}`}>
      <span className="font-semibold">{text("about.version")}:</span> {shown}
    </p>
  );
}
