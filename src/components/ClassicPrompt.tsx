/**
 * Paged single line classic prompt (spec 0014 AC-1, AC-3, AC-5).
 * Shows one page at a time: target slice in blue, typed slice in
 * black below it, plus a line counter. The page wrapper replays a
 * short slide on page change and stays still for reduced motion.
 */
export function ClassicPrompt({
  units,
  typed,
  pageIndex,
  pageTotal,
}: {
  units: string[];
  typed: string[];
  pageIndex: number;
  pageTotal: number;
}) {
  const renderReference = () => (
    <div aria-label="reference" className="w-full text-left wrap-break-word">
      {units.map((u, i) => (
        <span key={i} className="text-[#0000aa]">
          {u === " " ? "  " : u}
        </span>
      ))}
    </div>
  );

  const renderTyped = () => (
    <div aria-label="typed" className="w-full text-left wrap-break-word">
      {typed.length === 0 ? (
        <span aria-hidden="true" className="text-black">
          _
        </span>
      ) : (
        typed.map((t, i) => {
          const expected = units[i] ?? "";
          const good = t === expected;
          const display = t === " " ? "  " : t;
          return (
            <span
              key={i}
              className={good ? "text-black" : "rounded bg-[#ff0000] px-0.5 text-white"}
            >
              {display}
              {i === typed.length - 1 && (
                <span aria-hidden="true" className="text-black">
                  _
                </span>
              )}
            </span>
          );
        })
      )}
    </div>
  );

  return (
    <div
      className="mx-auto flex w-fit max-w-[65vw] min-w-0 flex-col items-start gap-1 overflow-x-clip bg-white leading-tight font-medium tracking-wide text-[clamp(1.25rem,4vw,3.75rem)]"
      aria-label="prompt"
      aria-live="polite"
    >
      <div
        key={[pageIndex, pageTotal].join("/")}
        className="flex w-full flex-col items-start gap-1 motion-safe:animate-[prompt-page-in_200ms_ease-out]"
      >
        {renderReference()}
        {renderTyped()}
      </div>
    </div>
  );
}
