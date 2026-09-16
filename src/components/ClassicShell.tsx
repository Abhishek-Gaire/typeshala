/** Shared classic shell (spec 0012 Option 2). Win95 style gray chrome, raised buttons, icon toolbar. */
import { useState, type ReactNode } from "react";
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
  onRestart,
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
  onRestart: () => void;
  children: ReactNode;
}) {
  type MenuId = "perform" | "lessons" | "help";
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  function toggle(menu: MenuId) {
    setOpenMenu((cur) => (cur === menu ? null : menu));
  }
  function closeMenus() {
    setOpenMenu(null);
  }
  const LESSON_SCREENS: ClassicScreenId[] = ["home", "top", "bottom", "all"];
  const LESSON_KEYS: StringKey[] = ["classic.home", "classic.top", "classic.bottom", "classic.all"];
  const MENU_POP = `absolute top-full left-0 z-10 min-w-44 ${RAISED} bg-[#d4d0c8] py-1`;
  const MENU_ITEM =
    "block w-full px-3 py-1 text-left text-sm text-black hover:bg-[#16205b] hover:text-white";
  return (
    <section aria-label="classic practice" className="flex flex-1 flex-col bg-[#d4d0c8]">
      <nav
        className="flex items-center gap-5 px-2 py-1 text-sm text-black"
        aria-label="menu"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            closeMenus();
            setAboutOpen(false);
          }
        }}
      >
        <img
          src="/typeshala_app_icon.svg"
          alt="Typeshala"
          width={20}
          height={20}
          className="h-5 w-5"
        />
        <div className="relative">
          <button
            type="button"
            aria-haspopup="true"
            aria-expanded={openMenu === "perform"}
            onClick={() => {
              toggle("perform");
            }}
            className="hover:underline"
          >
            {text("menu.perform")}
          </button>
          {openMenu === "perform" && (
            <div role="menu" className={MENU_POP}>
              <button
                type="button"
                role="menuitem"
                className={MENU_ITEM}
                onClick={() => {
                  onRestart();
                  closeMenus();
                }}
              >
                {text("menu.restart")}
              </button>
            </div>
          )}
        </div>
        <div className="relative">
          <button
            type="button"
            aria-haspopup="true"
            aria-expanded={openMenu === "lessons"}
            onClick={() => {
              toggle("lessons");
            }}
            className="hover:underline"
          >
            {text("menu.lessons")}
          </button>
          {openMenu === "lessons" && (
            <div role="menu" className={MENU_POP}>
              {LESSON_SCREENS.map((s, idx) => (
                <button
                  key={s}
                  type="button"
                  role="menuitem"
                  className={MENU_ITEM}
                  onClick={() => {
                    onScreen(s);
                    closeMenus();
                  }}
                >
                  {text(LESSON_KEYS[idx])}
                </button>
              ))}
            </div>
          )}
        </div>
        <button type="button" onClick={onSettings} className="hover:underline">
          {text("menu.options")}
        </button>
        <div className="relative ml-auto">
          <button
            type="button"
            aria-haspopup="true"
            aria-expanded={openMenu === "help"}
            onClick={() => {
              toggle("help");
            }}
            className="hover:underline"
          >
            {text("menu.help")}
          </button>
          {openMenu === "help" && (
            <div role="menu" className={`${MENU_POP} right-0 left-auto`}>
              <button
                type="button"
                role="menuitem"
                className={MENU_ITEM}
                onClick={() => {
                  setAboutOpen(true);
                  closeMenus();
                }}
              >
                {text("menu.about")}
              </button>
            </div>
          )}
        </div>
      </nav>
      {aboutOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => {
            setAboutOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={text("about.title")}
            className={`${RAISED} w-full max-w-md bg-[#d4d0c8] p-3`}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <p className="text-sm font-bold text-black">{text("about.title")}</p>
            <p className="mt-1 text-sm text-black">{text("about.body")}</p>
            <button
              type="button"
              autoFocus
              onClick={() => {
                setAboutOpen(false);
              }}
              className={`${RAISED} mt-3 bg-[#d4d0c8] px-3 py-1 text-sm text-black`}
            >
              {text("menu.close")}
            </button>
          </div>
        </div>
      )}
      <div
        className="flex w-[65%] flex-wrap items-stretch gap-1.5 p-1"
        role="toolbar"
        aria-label="screens"
      >
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
