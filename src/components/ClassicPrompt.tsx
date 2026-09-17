/**
 * Paged single line classic prompt (spec 0014 AC-1, AC-3, AC-5).
 * Shows one page at a time: target slice in blue, typed slice in
 * black below it. Each slice stays on exactly one line
 * (whitespace-nowrap + horizontal scroll) at any viewport width.
 * The page wrapper replays a short slide on page change and
 * stays still for reduced motion.
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
    <div aria-label="reference" className="w-max max-w-none text-left whitespace-nowrap">
      {units.map((u, i) => (
        <span key={i} className="text-[#0000aa]">
          {u === " " ? "  " : u}
        </span>
      ))}
    </div>
  );

  const renderTyped = () => (
    <div aria-label="typed" className="w-max max-w-none text-left whitespace-nowrap">
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
      className="mx-auto flex w-fit max-w-full min-w-0 flex-col items-center gap-1 overflow-x-auto bg-white text-center leading-tight font-medium tracking-wide whitespace-nowrap text-[clamp(1rem,4vw,2.5rem)]"
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
