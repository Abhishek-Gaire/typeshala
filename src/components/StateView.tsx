/** Loading, empty, and error states with localized text. */
import type { StringKey } from "../i18n/keys";

export function StateView({
  kind,
  text,
}: {
  kind: "loading" | "empty" | "error";
  text: (key: StringKey) => string;
}) {
  const key: StringKey =
    kind === "loading" ? "state.loading" : kind === "empty" ? "state.empty" : "state.error";
  return (
    <div role={kind === "error" ? "alert" : "status"} className="py-10 text-center text-lg">
      {text(key)}
    </div>
  );
}
