/** Virtual keyboard with lit next key plus finger hint (spec 0004). */
const ROWS: string[][] = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", ";"],
  ["Z", "X", "C", "V", "B", "N", "M", "Space"],
];

export function VirtualKeyboard({ lit, finger }: { lit: string; finger: string }) {
  return (
    <div className="mt-6" aria-label="keyboard">
      {ROWS.map((row, i) => (
        <div key={i} className="mb-2 flex justify-center gap-1">
          {row.map((key) => {
            const active = key === lit;
            return (
              <span
                key={key}
                aria-current={active ? "true" : undefined}
                className={
                  key === "Space"
                    ? `rounded px-8 py-2 text-sm ${active ? "bg-(--color-accent) text-white" : "bg-(--color-surface) text-(--color-ink)"}`
                    : `rounded px-3 py-2 text-sm font-medium ${active ? "bg-(--color-accent) text-white" : "bg-(--color-surface) text-(--color-ink)"}`
                }
              >
                {key}
              </span>
            );
          })}
        </div>
      ))}
      {finger !== "" && <p className="text-center text-sm text-(--color-ink-soft)">{finger}</p>}
    </div>
  );
}
