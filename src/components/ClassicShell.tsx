/** Shared classic shell (spec 0012 Option 2). Win95 style gray chrome, raised buttons, icon toolbar. */
import type { ReactNode } from "react";
import type { ClassicScreenId } from "../domain/classicLayout";
import type { LayoutId } from "../domain/datastore";
import type { StringKey } from "../i18n/keys";

const SCREENS: ClassicScreenId[] = ["home", "top", "bottom", "all", "game", "free"];
const SCREEN_KEYS: StringKey[] = [
  "classic.home",
  "classic.top",
  "classic.bottom",
  "classic.all",
  "classic.game",
  "classic.free",
];
const SCREEN_ICONS = [
  "\uD83C\uDFE0",
  "\u26F0",
  "\uD83D\uDC1F",
  "\uD83C\uDF0D",
  "\uD83C\uDFAF",
  "\uD83D\uDCA3",
] as const;
const LEVEL_DOTS = ["bg-(--color-level1)", "bg-(--color-level2)", "bg-(--color-level3)"] as const;

const RAISED = "border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080]";
const SUNKEN = "border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white";

export function ClassicShell({
  screen,
  level,
  layout,
  name,
  avgWpm,
  text,
  onScreen,
  onLevel,
  onLayout,
  onName,
  onSettings,
  children,
}: {
  screen: ClassicScreenId;
  level: number;
  layout: LayoutId;
  name: string;
  avgWpm: number;
  text: (key: StringKey) => string;
  onScreen: (s: ClassicScreenId) => void;
  onLevel: (l: number) => void;
  onLayout: (l: LayoutId) => void;
  onName: (n: string) => void;
  onSettings: () => void;
  children: ReactNode;
}) {
  const menu: Array<{ key: StringKey; action?: () => void }> = [
    { key: "menu.perform" },
    { key: "menu.lessons" },
    { key: "menu.options", action: onSettings },
  ];
  return (
    <section aria-label="classic practice" className="flex flex-1 flex-col bg-[#d4d0c8]">
      <nav className="flex gap-5 px-2 py-1 text-sm text-black" aria-label="menu">
        {menu.map((m) =>
          m.action !== undefined ? (
            <button key={m.key} type="button" onClick={m.action} className="hover:underline">
              {text(m.key)}
            </button>
          ) : (
            <span key={m.key}>{text(m.key)}</span>
          ),
        )}
        <span className="ml-auto">Help</span>
      </nav>
      <div className="flex w-[65%] flex-wrap items-stretch gap-1.5 p-1" role="toolbar" aria-label="screens">
        {SCREENS.map((s, idx) => (
          <button
            key={s}
            type="button"
            aria-pressed={screen === s}
            onClick={() => {
              onScreen(s);
            }}
            className={`flex min-h-16 min-w-24 flex-1 flex-col items-center justify-center gap-0.5 px-3 py-1.5 text-xs text-black ${
              screen === s ? `${SUNKEN} bg-[#d4d0c8] font-bold` : `${RAISED} bg-[#d4d0c8]`
            }`}
          >
            <span aria-hidden="true" className="text-4xl leading-none">
              {SCREEN_ICONS[idx]}
            </span>
            <span className="text-center leading-tight">{text(SCREEN_KEYS[idx])}</span>
          </button>
        ))}
        <div
          className={`flex min-w-44 flex-col justify-center gap-0.5 px-3 py-1 ${RAISED} bg-[#d4d0c8]`}
          role="group"
          aria-label={text("classic.level")}
        >
          {[1, 2, 3].map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={level === l}
              onClick={() => {
                onLevel(l);
              }}
              className={`flex items-center gap-1 rounded-full border px-2 py-px text-[11px] leading-tight whitespace-nowrap text-black ${
                level === l ? `${SUNKEN} bg-white font-bold` : `${RAISED} bg-[#d4d0c8]`
              }`}
            >
              <span
                aria-hidden="true"
                className={`inline-block h-2.5 w-2.5 rounded-full border border-black ${LEVEL_DOTS[l - 1]}`}
              />
              {text("classic.level")} {String(l)}
            </button>
          ))}
        </div>
        <div className={`flex min-w-56 flex-col gap-1 px-3 py-1 ${SUNKEN} bg-[#d4d0c8]`}>
          <div className="flex gap-1 text-xl" role="group" aria-label="language">
            <button
              type="button"
              aria-pressed={layout === "traditional"}
              title="Nepali"
              onClick={() => {
                onLayout("traditional");
              }}
              className={layout === "traditional" ? "outline-2 outline-black" : "opacity-50"}
            >
              {"\uD83C\uDDF3\uD83C\uDDF5"}
            </button>
            <button
              type="button"
              aria-pressed={layout === "qwerty"}
              title="English"
              onClick={() => {
                onLayout("qwerty");
              }}
              className={layout === "qwerty" ? "outline-2 outline-black" : "opacity-50"}
            >
              {"\uD83C\uDDEC\uD83C\uDDE7"}
            </button>
          </div>
          <label className="flex items-center gap-1 text-xs text-black">
            {text("classic.name")}
            <input
              value={name}
              onChange={(e) => {
                onName(e.target.value);
              }}
              className={`w-20 bg-white px-1 text-black ${SUNKEN}`}
            />
          </label>
          <p className="text-xs text-black" aria-live="polite">
            {text("classic.avgSpeed")}: {Math.round(avgWpm)} w/m
          </p>
        </div>
      </div>
      <div className={`flex flex-1 flex-col bg-white p-4 ${SUNKEN}`}>{children}</div>
    </section>
  );
}
