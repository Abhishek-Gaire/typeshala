/** Full five row classic keyboard (spec 0012 AC-6). Exactly one key glows red, derived from the cursor. */
import {
  classicRowsFor,
  codeForChar,
  codeForNextUnit,
  glyphForKey,
  type ClassicKey,
} from "../domain/classicLayout";
import type { LayoutId } from "../domain/datastore";

const RAISED = "border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080]";

export interface KeyPress {
  code: string;
  correct: boolean;
  n: number;
}

export function ClassicKeyboard({
  layout,
  next,
  wrongKey,
  fingerHint,
  press,
  onTapKey,
}: {
  layout: LayoutId;
  next: string;
  wrongKey?: string | null;
  fingerHint?: string;
  press?: KeyPress | null;
  /**
   * Touch and mouse input path (spec 0016). When present, char keys, space,
   * and Backspace render as buttons that report taps. Buttons are outside
   * the tab order and never summon the device keyboard: typing stays inside
   * the app board. Modifiers other than Backspace stay inert display.
   */
  onTapKey?: (key: ClassicKey) => void;
}) {
  const rows = classicRowsFor(layout);
  const lit = next === "" ? "" : codeForNextUnit(next, layout);
  const wrong =
    wrongKey === null || wrongKey === undefined || wrongKey === ""
      ? ""
      : codeForChar(wrongKey, layout);
  return (
    <>
      <style>{`@keyframes classic-key-press { 0% { transform: scale(1); } 35% { transform: scale(0.82); } 100% { transform: scale(1); } }`}</style>
    <div
      className="mx-auto mt-auto mb-[10px] flex max-h-[55vh] min-h-[42.5vh] w-[75vw] max-w-full min-w-[640px] flex-col justify-center overflow-hidden bg-[#d4d0c8] p-2 shadow-lg"
      aria-label="keyboard"
    >
      {rows.map((row, i) => (
        <div key={i} className="mb-1 flex min-h-0 flex-1 gap-1 last:mb-0">
          {row.map((key) => {
            const active = key.code === lit;
            const missed = key.code !== "" && key.code === wrong && !active;
            const pressed = press !== null && press !== undefined && key.code === press.code;
            const glyph = glyphForKey(key, layout);
            const wide =
              key.kind === "space" ? "flex-[8]" : key.kind === "modifier" ? "flex-[1.8]" : "flex-1";
            const face = `flex min-w-0 items-center justify-center overflow-hidden px-1 py-[clamp(0.5rem,2.5vh,1.25rem)] text-center leading-none text-black text-[clamp(0.75rem,1.5vw,1.125rem)] ${wide} ${
              pressed
                ? press.correct
                  ? "border-2 border-[#4d7c0f] bg-[#65a30d] font-bold text-white"
                  : "border-2 border-[#808080] bg-[#f97316] font-bold text-white"
                : active
                  ? "border-2 border-[#808080] bg-[#ff0000] font-bold text-white"
                  : missed
                    ? "border-2 border-[#ff0000] bg-[#ffcccc]"
                    : key.kind === "char"
                      ? `${RAISED} bg-[#f5f5f5] text-[#0000aa]`
                      : `${RAISED} bg-[#808000]`
            }`;
            const label =
              key.kind === "char" ? (
                <span>
                  <span>{glyph.main}</span>
                  {glyph.alt !== undefined && glyph.alt !== "" && (
                    <sub className="ml-0.5 text-[10px]">{glyph.alt}</sub>
                  )}
                </span>
              ) : key.kind === "space" ? (
                <span aria-hidden="true">{"\u00a0"}</span>
              ) : (
                <span className="text-xs">{key.base}</span>
              );
            const tappable =
              onTapKey !== undefined &&
              (key.kind === "char" || key.kind === "space" || key.code === "Backspace");
            if (tappable) {
              const tap = onTapKey;
              return (
                <button
                  key={pressed ? `${key.code}-${String(press.n)}` : key.code}
                  type="button"
                  tabIndex={-1}
                  aria-label={key.code}
                  aria-current={active ? "true" : undefined}
                  style={pressed ? { animation: "classic-key-press 160ms ease-out" } : undefined}
                  className={face}
                  onClick={() => {
                    tap(key);
                  }}
                >
                  {label}
                </button>
              );
            }
            return (
              <span
                key={pressed ? `${key.code}-${String(press.n)}` : key.code}
                aria-current={active ? "true" : undefined}
                style={
                  pressed
                    ? { animation: "classic-key-press 160ms ease-out" }
                    : undefined
                }
                className={face}
              >
                {label}
              </span>
            );
          })}
        </div>
      ))}
      {fingerHint !== undefined && fingerHint !== "" && (
        <p className="mt-2 text-center text-sm text-black">{fingerHint}</p>
      )}
    </div>
    </>
  );
}
