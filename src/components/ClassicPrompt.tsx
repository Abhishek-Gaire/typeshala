/**
 * Paged single line classic prompt (spec 0014 AC-1, AC-3, AC-5).
 * Shows one page at a time: target slice in blue, typed slice in
 * black below it. Each slice stays on exactly one line
 * (whitespace-nowrap + clipped overflow) at any viewport width.
 * The page wrapper replays a short slide on page change and
 * stays still for reduced motion.
 */
import { isCombiningMark } from "../domain/preeti";

export function ClassicPrompt({
  units,
  typed,
  pending,
  pageIndex,
  pageTotal,
}: {
  units: string[];
  typed: string[];
  /** Pending combining mark typed before its base, shown muted at the caret. */
  pending?: string;
  pageIndex: number;
  pageTotal: number;
}) {
  const renderReference = () => (
    <div
      aria-label="reference"
      className="w-max max-w-none text-left whitespace-nowrap text-[#0000aa]"
    >
      {units.join("").replace(/ /g, "  ")}
    </div>
  );

  const renderTyped = () => {
    // Keep a matra in the same span as its base so the shaper never draws it
    // alone as a dotted circle placeholder. Verdict turns red if any part misses.
    const groups: Array<{ text: string; good: boolean; last: boolean }> = [];
    typed.forEach((t, i) => {
      const good = t === (units[i] ?? "");
      const display = t === " " ? "  " : t;
      const prev = groups.length > 0 ? groups[groups.length - 1] : undefined;
      if (prev !== undefined && typed[i - 1] !== " " && isCombiningMark(t)) {
        prev.text += display;
        prev.good = prev.good && good;
      } else {
        groups.push({ text: display, good, last: false });
      }
      groups[groups.length - 1].last = i === typed.length - 1;
    });
    const showPending = pending !== undefined && pending !== "";
    // A lone pre-posed mark cannot shape without a base, so preview the whole
    // upcoming unit in a muted tone. The mark then attaches to its real base,
    // never to the consonant already typed.
    const expectedUnit = units[typed.length] ?? "";
    const ghost = showPending && expectedUnit !== "" ? expectedUnit : "";
    return (
      <div aria-label="typed" className="w-max max-w-none text-left whitespace-nowrap">
        {groups.map((g, i) => (
          <span
            key={i}
            className={g.good ? "text-black" : "rounded bg-[#ff0000] px-0.5 text-white"}
          >
            {g.text}
            {g.last && !showPending && (
              <span aria-hidden="true" className="text-black">
                _
              </span>
            )}
          </span>
        ))}
        {ghost !== "" ? (
          <span data-pending="true" className="text-(--color-muted)">
            {ghost}
          </span>
        ) : (
          showPending && (
            <span className="text-(--color-muted)">
              {"\u00a0\u25CC"}
              {pending}
            </span>
          )
        )}
        {(showPending || groups.length === 0) && (
          <span aria-hidden="true" className="text-black">
            _
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      className="mx-auto flex w-fit max-w-full min-w-0 flex-col items-center gap-1 overflow-x-clip bg-white text-center leading-tight font-medium tracking-wide whitespace-nowrap text-[clamp(1rem,4vw,2.5rem)]"
      aria-label="prompt"
      aria-live="polite"
    >
      <div
        key={[pageIndex, pageTotal].join("/")}
        className="flex w-max max-w-none flex-col items-start gap-1 motion-safe:animate-[prompt-page-in_200ms_ease-out]"
      >
        {renderReference()}
        {renderTyped()}
      </div>
    </div>
  );
}
