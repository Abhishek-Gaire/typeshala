/** Dual line classic prompt. Line 1 static blue reference, line 2 live black typed. */
export function ClassicPrompt({ units, typed }: { units: string[]; typed: string[] }) {
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
      className="mx-auto flex w-fit max-w-[65vw] min-w-0 flex-col items-start gap-1 bg-white leading-tight font-medium tracking-wide text-[clamp(1.25rem,4vw,3.75rem)]"
      aria-label="prompt"
      aria-live="polite"
    >
      {renderReference()}
      {renderTyped()}
    </div>
  );
}
