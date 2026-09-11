# Typeshala — Architectural Plan
### Cross-platform typing tutor (English + Nepali) built with Tauri + React

---

## 1. Concept Summary

A desktop typing tutor, inspired by the classic DOS-era Typshala, that teaches touch typing for:
- **English** (QWERTY)
- **Nepali** — at least **Traditional/Preeti** and **Romanized Unicode** layouts

Core loop: pick a layout → work through structured lessons → type against a prompt → get real-time WPM/accuracy feedback → review progress over time.

Built with **Tauri** (Rust core + native OS WebView) and a **React** frontend, packaged as native installers for Windows, macOS, and Linux.

---

## 2. Why Tauri Fits

- Rust backend handles anything "system-y": local file storage, persistence, packaging — while staying tiny (no bundled Chromium like Electron).
- React frontend runs in the OS's native WebView, so all your typing-tutor UI/UX work is normal web development.
- Communication between the two happens via **Tauri commands** (JS calls into Rust, async, typed) and **events** (Rust can push updates to JS, e.g. autosave confirmations).
- This app's needs (local data, no heavy native APIs) sit right in Tauri's sweet spot — good for learning the framework without fighting it.

---

## 3. High-Level Architecture

```
┌─────────────────────────────────────────────┐
│                Tauri Shell                   │
│  ┌─────────────────────────────────────────┐ │
│  │        React Frontend (WebView)          │ │
│  │                                           │ │
│  │  Screens: Home / Layout Select / Lesson  │ │
│  │  / Practice / Results / Progress /       │ │
│  │  Settings                                │ │
│  │                                           │ │
│  │  State: Zustand store (session, config)  │ │
│  └───────────────┬───────────────────────────┘ │
│                  │ invoke() / listen()          │
│                  ▼                              │
│  ┌─────────────────────────────────────────┐ │
│  │           Rust Core (src-tauri)          │ │
│  │                                           │ │
│  │  Commands: load_lessons, save_result,    │ │
│  │  get_progress, get_settings, ...         │ │
│  │                                           │ │
│  │  Persistence: SQLite (via plugin-sql)    │ │
│  │  or JSON files (via plugin-fs / Store)   │ │
│  │                                           │ │
│  │  Packaging/config: tauri.conf.json       │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Split of responsibilities:**
- **Frontend (React):** all typing logic, WPM/accuracy calculation, virtual keyboard rendering, layout mapping, lesson UI. This can all run in JS — it's not performance-critical enough to need Rust.
- **Backend (Rust):** persistence (lesson content, user progress, settings), file I/O, app lifecycle, packaging. Rust is the "system boundary," not the typing engine.

This keeps the Rust surface small and learnable while you focus most of your energy on React — a reasonable way to learn Tauri without biting off native Rust app-logic at the same time.

---

## 4. Project Structure

```
typeshala/
├── src/                        # React frontend
│   ├── main.tsx
│   ├── App.tsx
│   ├── screens/
│   │   ├── Home.tsx
│   │   ├── LayoutSelect.tsx
│   │   ├── LessonList.tsx
│   │   ├── Practice.tsx         # the actual typing screen
│   │   ├── Results.tsx
│   │   ├── Progress.tsx
│   │   └── Settings.tsx
│   ├── components/
│   │   ├── VirtualKeyboard.tsx
│   │   ├── TextDisplay.tsx      # renders prompt + live diff highlighting
│   │   ├── StatBar.tsx          # WPM / accuracy / time live readout
│   │   └── LayoutSwitcher.tsx
│   ├── engine/
│   │   ├── typingEngine.ts      # keystroke capture, diffing, WPM/accuracy calc
│   │   ├── layouts/
│   │   │   ├── qwerty.ts
│   │   │   ├── nepaliTraditional.ts
│   │   │   └── nepaliRomanized.ts
│   │   └── lessonEngine.ts      # lesson sequencing, difficulty progression
│   ├── data/
│   │   └── lessons/             # JSON lesson content per layout
│   │       ├── en/
│   │       └── ne/
│   ├── state/
│   │   └── store.ts             # Zustand store
│   └── bridge/
│       └── tauriApi.ts          # thin wrapper around invoke() calls
│
├── src-tauri/                   # Rust backend
│   ├── src/
│   │   ├── main.rs
│   │   ├── commands/
│   │   │   ├── lessons.rs       # load_lessons, get_lesson
│   │   │   ├── progress.rs      # save_result, get_progress, get_stats
│   │   │   └── settings.rs      # get_settings, save_settings
│   │   ├── db/
│   │   │   ├── mod.rs
│   │   │   └── schema.sql
│   │   └── models.rs            # shared structs (serde) matching TS types
│   ├── Cargo.toml
│   └── tauri.conf.json
│
└── package.json
```

---

## 5. Core Modules

### 5.1 Layout Engine
Each layout (`qwerty`, `nepaliTraditional`, `nepaliRomanized`) is a data-driven mapping:
- physical key → character(s) produced
- finger/hand assignment (for keyboard-highlighting and finger-guidance UI)
- shift-state variants

Nepali Traditional (Preeti-style) needs special handling since it's not a 1:1 key→glyph map — conjuncts and matras can depend on key sequences. Keep this as a pluggable module so English ships first without blocking on Nepali complexity.

### 5.2 Virtual Keyboard
A rendered on-screen keyboard driven by the active layout module. Highlights the next key to press, and colors keys by finger for touch-typing guidance (**finger-guidance overlay**, confirmed for v1). Pure presentational component — takes `activeLayout` + `nextChar` as props.

**Finger-guidance overlay design:** the finger→key assignment (left pinky, left ring, left middle, left index covering two columns, mirrored on the right, thumbs on space) is based on **physical key position**, not on which character a key produces. So one finger-map component works underneath every layout — QWERTY, Preeti, Romanized Unicode — since typists press the same physical keys regardless of which glyph comes out. Build it once, reuse everywhere. Toggleable: on by default in Lesson mode, off-able in timed tests so it doesn't act as a crutch once someone's building real recall.

### 5.3 Typing Engine
Framework-agnostic core logic (unit-testable, no React):
- Captures keystrokes against the current prompt string
- Produces a live diff (correct / incorrect / pending characters) for `TextDisplay` to render
- Computes running WPM, accuracy %, and error positions
- Emits a `SessionResult` object at the end (used for persistence)

### 5.4 Lesson Engine
- Lessons are structured, ordered content per layout (e.g., "home row," "top row," "common words," "sentences")
- Tracks completion + best scores per lesson
- Difficulty progression logic (unlock next lesson at some accuracy/speed threshold — configurable, not required to gate strictly)

### 5.5 Persistence Layer (Rust side)
Two reasonable options — pick one to avoid overbuilding:
- **SQLite via `tauri-plugin-sql`**: better if you want structured queries later (e.g., "show my WPM trend over the last 30 days"). Slightly more Rust/SQL to learn.
- **JSON store via `tauri-plugin-store` or `plugin-fs`**: simpler, faster to get running, fine for single-user local data.

Recommendation: start with the **Store plugin** (JSON) for v1 — it's less Tauri machinery to learn up front — and migrate to SQLite later if you want richer progress analytics. This also front-loads two genuinely different Tauri plugin patterns as a learning exercise if you do the migration.

### 5.6 Settings
Layout preference, theme (light/dark), sound on/off, font size for prompt text. Persisted the same way as progress data.

### 5.7 Bonus Game (Ramayan-style typing game)
Full feature parity confirmed — this ships in v1 scope (not stretch). A separate, self-contained module (own screen, own simple game loop) themed around the Ramayana epic (public domain source material), built as an original implementation — not ported from any existing Typeshala product's code or assets. Likely simplest form: falling/scrolling words the player must type before they reach the bottom, with a Ramayana-themed skin (backgrounds, character sprites you create or source from openly-licensed art) rather than copied artwork. Treat as its own milestone late in the roadmap so it doesn't block the core typing engine.

### 5.8 Local-Only Data Model
No cloud sync, no accounts, no network calls at all — confirmed. Everything (lessons, progress, settings, session name) lives in local storage on-device via the Rust persistence layer (Section 5.5). This simplifies the architecture considerably: no auth, no sync-conflict handling, no backend service to run or maintain. The app should work fully offline from first launch.

---

## 6. Frontend State Management

- **Zustand** (lightweight, less boilerplate than Redux) for:
  - active layout/session state
  - in-progress typing session state
  - cached settings/progress (hydrated from Rust on launch via `invoke`)
- Screens are simple state-driven views (no need for React Router in a single-window desktop app — a `currentScreen` value in the store is enough).

---

## 7. Tauri Concepts You'll Learn Building This

| Concept | Where it shows up |
|---|---|
| Commands (`#[tauri::command]`) | `load_lessons`, `save_result`, `get_progress`, `get_settings` |
| `invoke()` from JS | `bridge/tauriApi.ts` wrapping every command |
| Async commands | DB/file reads without blocking the UI |
| App/managed state (`tauri::State`) | Holding a DB connection or in-memory cache across commands |
| Plugins | `plugin-store` (or `plugin-sql`), possibly `plugin-fs` |
| Events (`emit`/`listen`) | Optional: backend notifies frontend of autosave, or background lesson-content updates |
| `tauri.conf.json` | App metadata, window config, bundle targets per OS |
| Cross-platform bundling | `tauri build` targets — `.msi`/`.exe` (Windows), `.dmg`/`.app` (macOS), `.deb`/`.AppImage` (Linux) |

---

## 8. Cross-Platform Notes

- Tauri's bundler produces the native installer format per OS from the same codebase — no separate builds to hand-maintain.
- macOS builds for distribution outside your own machine eventually need code signing/notarization (not required for local dev/testing).
- Windows builds are straightforward with the Rust MSVC toolchain.
- Linux output format depends on target distro conventions (AppImage is the most portable default).
- None of this blocks early development — it only matters when you get to packaging/distribution.

---

## 9. Suggested Build Phases

1. **Scaffolding** — Tauri + React project boots, single window, "Hello Typeshala" screen. Confirms toolchain works on your machine.
2. **English QWERTY core loop** — typing engine, virtual keyboard, one hardcoded lesson, live stats. No persistence yet.
3. **Persistence** — wire up Rust commands + Store plugin to save/load a session result and settings.
4. **Lesson engine** — structured lesson list, progression, per-lesson best scores.
5. **Nepali layouts** — add Romanized Unicode first (simpler mapping), then Traditional/Preeti (handles conjuncts).
6. **Progress/Stats screen** — WPM trend, accuracy trend, lessons completed.
7. **Polish + packaging** — settings screen, theming, `tauri build` on each OS.

Each phase is a working, runnable app — useful given you're learning the tool as you go.

---

## 10. Decisions Locked In

| Question | Decision |
|---|---|
| Cloud sync? | **No — fully local, offline-first.** No accounts, no network calls. |
| Finger-guidance overlay? | **Yes, in v1.** Layout-agnostic (based on physical key position), toggleable. |
| Feature parity with old Typeshala? | **Yes — full parity**, including the bonus typing game (Section 5.7). |

These simplify the architecture: no auth, no sync logic, no backend service — just Rust-side local persistence (Section 5.5) and a self-contained bonus-game module added late in the roadmap.

---

## 11. Licensing & Naming Considerations

*(General information, not legal advice — worth a proper check with a lawyer if you plan to publicly distribute or monetize this.)*

- **Tech stack:** Tauri (MIT/Apache-2.0) and React (MIT) are fully permissive — no restrictions or attribution burden for personal or commercial use.
- **Preeti key mapping:** Reimplementing the key→character layout is on solid ground — it's functional/positional data (like QWERTY itself), and it's already independently reimplemented by many unrelated typing tutors, which is a strong signal it's treated as an open standard rather than protected expression.
- **Preeti the font file:** Separate issue from the mapping above. The actual proprietary glyph designs (legacy ANSI-encoded, pre-Unicode) shouldn't be bundled without checking terms. Use an open Unicode Devanagari font (e.g., Noto Sans Devanagari) and apply the Preeti key-mapping logic on top of it instead.
- **Bonus game theme/feature:** The Ramayana epic is ancient public-domain source material, and "a typing game" as a feature/idea isn't copyrightable — only a specific implementation is. Building your own version from scratch (own code, own or openly-licensed art) carries no infringement risk; porting actual code or art assets from an existing Typeshala product would.
- **The name "Typeshala" itself:** The original DOS-era software's copyright sits with a specific company, but the name has since been reused as a product/domain name by numerous unrelated sites and apps with no single obvious enforcer — a reasonable (not certain) signal it functions close to generically in this niche now. Fine for personal/learning use regardless. If you later want to publicly ship or monetize under that exact name, do a proper trademark search in your jurisdiction first.
- **Non-commercial + open source (confirmed):** This meaningfully lowers the already-low risk above — trademark and copyright concerns are primarily about commercial harm (profiting off confusion, displacing sales), and a free, non-commercial, open-source project doesn't create that. Not a legal guarantee, but the practical risk here is minimal.

### Recommended License for Your Own Code

"Open source" is a category, not a license — you still need to pick one:

| License | What it means here |
|---|---|
| **MIT** | Maximally permissive — anyone can use/modify/embed your code, even in closed-source projects, with almost no obligations. Matches React's license exactly. |
| **Apache-2.0** | Same permissiveness as MIT plus an explicit patent grant. Matches Tauri's dual-license. |
| **MIT OR Apache-2.0 (dual)** | The Rust-ecosystem convention — Tauri itself is licensed this way. Keeps your whole stack's licensing philosophy consistent. |
| **GPL-3.0** | Copyleft — anyone who distributes a modified version must also open-source their changes. Worth it only if you specifically want to prevent someone forking this into a closed commercial product. |

Given you're using Tauri + React and want the ecosystem to freely build on this, **dual MIT/Apache-2.0** is a reasonable default and keeps you consistent with the rest of your stack.

---

## 12. Prerequisite Setup (Arch Linux)

Confirmed dev environment: Arch Linux. These are the one-time setup steps before scaffolding Phase 1.

1. **Install system dependencies via pacman**
   Update first, then install Tauri's Linux build dependencies:
   ```
   sudo pacman -Syu
   sudo pacman -S --needed webkit2gtk-4.1 base-devel curl wget file openssl appmenu-gtk-module libappindicator-gtk3 librsvg xdotool
   ```
   These provide the native WebView (`webkit2gtk`), build toolchain (`base-devel` includes gcc/make), and `xdotool` (needed for window-positioning APIs) that Tauri wraps your app in on Linux. *(Verified against Tauri's current official Arch prerequisites list — `xdotool` was added there since earlier v2 releases, so it's easy to miss in older guides.)*

2. **Install Rust via rustup**
   ```
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source "$HOME/.cargo/env"
   rustc --version && cargo --version
   ```
   Default install options are fine. Both version commands should print a version number to confirm success.

3. **Install Node.js and npm**
   ```
   sudo pacman -S nodejs npm
   node --version && npm --version
   ```
   Tauri v2's tooling wants **Node 18+**, with **Node 20 LTS or newer recommended** for current tooling compatibility — Arch's `nodejs` package tracks current releases, so pacman's version should already satisfy this. `nvm` is a fine alternative later if you want multi-version management.

4. **Scaffold the Tauri + React project**
   ```
   npm create tauri-app@latest
   ```
   When prompted: name it (e.g. `typeshala`), pick **React** as the frontend framework, **TypeScript** as the variant, and **npm** as the package manager. This generates the `src/` (React) and `src-tauri/` (Rust) folders described in Section 4.

5. **Install dependencies and do a first run**
   ```
   cd typeshala
   npm install
   npm run tauri dev
   ```
   The first run compiles the Rust side from scratch, so expect it to take a few minutes. A native window opening with the default Tauri+React starter page confirms the whole toolchain works end to end.

---

*Next step, when you're ready: Phase 1 from Section 9 — wiring in the typing engine and QWERTY layout on top of the scaffold.*
