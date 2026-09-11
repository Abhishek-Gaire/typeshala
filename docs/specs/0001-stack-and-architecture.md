# 0001. Stack and architecture

**Date**: 2026-09-11
**Status**: Proposed

## Summary

Typeshala will be built as a Tauri v2 desktop app (a tiny native shell showing web UI) with React plus TypeScript for all screens, and the Rust side limited to local saving plus packaging. Starting persistence is the Tauri store plugin (simple JSON key value saved on device), with a move to SQLite later if progress trends outgrow it. This keeps every release a small offline installer you can build and learn inside on Arch.

## Context

You are one builder learning Tauri on a side project pace, shipping small runnable phases with the thinnest usable tutor first. The product promise is strict: fully local and offline from first launch, no accounts, no network calls, no backend service to run. The UI must carry both English and Nepali strings from the start, which doubles text work against every screen. The heavy unknowns live elsewhere on purpose: the full save shape belongs to the data model spec, the visual direction belongs to the design spec, and Preeti conjunct handling belongs to its own layout spec. Without this decision the scaffold would guess at frameworks and plugins, later features would install conflicting dependencies, and the save shape would churn under already built screens.

## Options considered

### Option 1: Tauri v2 plus React plus TypeScript plus store plugin

Native shell plus React screens plus JSON key value saving, all chosen in the stack walk (basis: your scope `docs/scope/scope.md`, Release 1 thin usable whole; boring technology, proven tools first).

**Pros**:
- Smallest installers of the three, since the system webview (the OS supplied browser pane) replaces a bundled Chromium
- React plus TypeScript matches the typing engine need: key maps and WPM math checked by the compiler
- Store plugin is the least Tauri machinery to learn for lesson results and settings

**Cons**:
- Two languages to debug across the bridge (web UI plus Rust), so bridge errors need typed wrappers from day one
- Linux WebKit quirks can surprise styling, which is part of why Tailwind was picked for velocity

### Option 2: Electron plus React plus TypeScript plus file based store

Same React screens inside an Electron shell with saving to raw files (basis: mature alternative pattern, Chromium bundled per install).

**Pros**:
- One runtime everywhere, so no per OS webview differences to learn
- Largest pool of examples and answers of any desktop option

**Cons**:
- Installer size grows by roughly a full browser per user, a poor trade for a small tutor
- Raw file saving replays every edge case (partial writes, corruption, locking) that the store plugin already handles

### Option 3: Tauri v2 plus Svelte plus TypeScript plus store plugin

Same shell and saving with Svelte screens instead of React (basis: smallest bundle practice, community size tradeoff).

**Pros**:
- Less JavaScript shipped and less tooling to configure than React
- Excellent fit for the mostly presentational keyboard and prompt screens

**Cons**:
- Smaller community and fewer Tauri plus typing examples to borrow when stuck
- Departure from the plan you already shaped around React, with no product force demanding it

## Decision

**Chosen option**: Option 1: Tauri v2 plus React plus TypeScript plus store plugin (basis: your scope `docs/scope/scope.md`, your plan `typeshala-architecture-plan.md`, stack walk picks).

Typeshala scaffolds from `create-tauri-app` with the `react-ts` template on the Tauri 2.11 line, npm, and Tailwind installed at scaffold time. Zustand and the store plugin land with the Release 1 features that first need them, so the scaffold stays thin (basis: thin scaffold practice, dependencies land with the slice that needs them).

**Implementation skills**: `tauri` (`full-stack-skills/tauri-skills`, `.agents/skills/tauri/`) · `tauri-app-creator` (`full-stack-skills/tauri-skills`, `.agents/skills/tauri-app-creator/`) · `vercel-react-best-practices` (`vercel-labs/agent-skills`, `.agents/skills/vercel-react-best-practices/`) · `typescript-advanced-types` (`wshobson/agents`, `.agents/skills/typescript-advanced-types/`) · `zustand-state-management` (`mindrally/skills`, `.agents/skills/zustand-state-management/`) · `tailwindcss` (`hairyf/skills`, `.agents/skills/tailwindcss/`) · `tauri-app-store` (`full-stack-skills/tauri-skills`, `.agents/skills/tauri-app-store/`)

## Rationale

The shell choice follows the local only promise: with no server and one user per device, there is no force that pays for a bundled browser or a relational database on day one, so the boring small option wins (basis: boring technology, proven tools first; monolith first, one deployable per OS). React plus TypeScript wins on fit rather than fashion: the typing engine and the Preeti key map are exactly the kind of pure logic where the compiler catches mistakes before a learner ever sees them (basis: your plan `typeshala-architecture-plan.md`, engine owned by the frontend). The store plugin wins for the same reason at the save layer: results and settings are small documents with almost no relational shape, one writer, no concurrency, so JSON key value with auto save is sufficient, and the SQLite migration stays explicitly open for the trends screen (basis: key value fits single writer document shape; your scope, data model spec still owed). Tailwind was your call over starting bare, trading a heavier scaffold for faster keyboard and screen styling, which is reasonable given the bilingual UI doubles styling surface (basis: your stack walk pick).

## Proposed stack

| Layer | Choice | Reason |
|---|---|---|
| App shell | Tauri v2 latest, 2.11 line | Native shell on the system webview keeps installers tiny with no bundled browser (basis: https://v2.tauri.app/reference/webview-versions/) |
| Frontend language | TypeScript | Compiler checks engine math and key maps before learners meet them (basis: your plan `typeshala-architecture-plan.md`) |
| Frontend framework | React, `react-ts` template | Largest example pool for tutor UI, matches the shaped plan (basis: your scope `docs/scope/scope.md`) |
| Dev server and bundler | Vite via the template | Scaffolder default wiring for dev URL plus dist folder (basis: https://v2.tauri.app/start/frontend/vite/) |
| Package manager | npm | Simplest on Arch, nothing extra to install (basis: your stack walk pick) |
| UI state | Zustand | Tiny store with little boilerplate for session plus settings, installed with the Release 1 features that first use it (basis: `zustand-state-management` skill, `.agents/skills/zustand-state-management/`; thin scaffold practice, dependencies land with the slice that needs them) |
| Styling | Tailwind CSS, current major at scaffold via the Vite plugin | Your pick for velocity across keyboard plus bilingual screens, entry CSS proved by the placeholder screen (basis: your stack walk pick; `tailwindcss` skill, `.agents/skills/tailwindcss/`) |
| Persistence v1 | Store plugin, JSON key value | Least machinery for results plus settings, auto save on device, installed with the data model feature; one store file in the app data dir, default keys owned by that spec, typed wrapper at the bridge path from your plan (basis: https://v2.tauri.app/plugin/store/; thin scaffold practice, dependencies land with the slice that needs them) |
| UI to Rust bridge | Tauri commands behind a thin typed wrapper (`invoke` for calls, events for pushes) | One typed boundary so bridge errors surface at compile time (basis: `tauri` skill, `.agents/skills/tauri/`) |
| Permissions | Default capability file granting store scope only | Least privilege: the web UI reaches saving and nothing else (basis: https://v2.tauri.app/reference/acl/capability/) |
| App identity | `com.typeshala.app`, single main window titled Typeshala | One reverse DNS name for all three installers, template defaults otherwise for size plus dev URL plus dist folder (basis: your stack walk pick; https://v2.tauri.app/start/frontend/vite/) |
| Toolchain | rustup stable plus Arch system node | Official Rust updates plus a node new enough for current Tauri tooling (basis: https://v2.tauri.app/start/prerequisites/) |
| Commands used | `npm create tauri-app@latest`, `npm run tauri dev`, `npm run tauri build` | Scaffolder plus dev plus release flow for the whole project life (basis: https://v2.tauri.app/reference/cli/) |
| Version control | git init at scaffold | The tree is not a repo yet, history should start with the scaffold (basis: solo builder practice, reviewable phases) |
| Observability | Devtools plus local console only | No users to monitor and no network to phone home to, so nothing ships (basis: local only promise, your scope `docs/scope/scope.md`) |
| Packaging detail | OS defaults, deferred | Bundle formats belong to the packaging feature, not this decision (basis: your scope, feature 12 owns it) |
| Version floors | Tauri 2.11 min, Node 20 min, Rust stable, latest stable otherwise | Floors promise compatibility while latest avoids stale pins (basis: links above; floor versions over exact pins) |
| System packages | `webkit2gtk-4.1` `base-devel` `curl` `wget` `file` `openssl` `appmenu-gtk-module` `libappindicator-gtk3` `librsvg` `xdotool` | Verified Arch prerequisites, without them dev and build fail on your machine (basis: https://v2.tauri.app/start/prerequisites/) |
| Boot proof | Typecheck plus web build green plus dev window on a tiny branded placeholder | Defines passes build as title plus one line on screen; full installers stay with the packaging feature (basis: https://v2.tauri.app/reference/cli/; your scope, feature 12 owns installers) |
| Repo bootstrap | `main` branch, ignores for `target` plus `node_modules` plus `dist`, first commit scaffold only | History starts clean with the scaffold (basis: solo builder practice, reviewable phases) |

## Consequences

**Positive**:
- Installers stay small and fully offline, which is the product promise in executable form
- All typing logic stays in testable TypeScript, so later specs can demand unit tests without touching Rust
- Scaffold needs nothing beyond this spec, so the next step can run immediately

**Negative / tradeoffs**:
- Bridge spans two languages, so every new Rust command needs types, permissions, and wrapper updates together
- Linux WebKit rendering can diverge from Windows and Arch rolls forward, so visual checks run on Linux early and often against the floored system package
- Tailwind adds build weight and version churn that plain CSS would have avoided, accepted for styling speed

**Neutral**:
- SQLite stays a planned migration, not a present dependency, owned by the data model spec
- No auth, hosting, analytics, or update server exists by design, which the scope already records as deferred forever
- The app is offline but the build is not: npm plus system packages need network once at setup

## Follow-up

- [ ] Tauri conventions (`tauri`, `tauri-app-creator`, `tauri-app-store` skills) not yet in root `AGENTS.md` rules; project wide, belong at root once `/audit` runs after scaffold
- [ ] React plus TypeScript conventions not yet in root `AGENTS.md` rules; apply to every screen, belong at root
- [ ] Zustand conventions not yet in root `AGENTS.md` rules; session plus settings cross screens, belong at root
- [ ] Tailwind conventions not yet in root `AGENTS.md` rules; styling system, belong at root
- [ ] Data model spec still owed before lesson features: `/architect data model local store`
- [ ] Design spec still owed before screens: `/architect design system and bilingual UI foundation`

## References

**Project sources** (verifiable, in this repo):
- Your scope `docs/scope/scope.md`, feature 1 plus Skateboard approach plus Alpha workflow
- Your plan `typeshala-architecture-plan.md`, Tauri plus React plus local only promise
- Installed skills under `.agents/skills/`: `tauri`, `tauri-app-creator`, `vercel-react-best-practices`, `typescript-advanced-types`, `zustand-state-management`, `tailwindcss`, `tauri-app-store`

**Practices & standards**:
- Boring technology, proven tools first
- Monolith first, one deployable per OS
- Key value fits single writer document shape
- Least privilege capabilities for the web UI
- Local only promise, no network calls
- Solo builder practice, reviewable phases
- Thin scaffold practice, dependencies land with the slice that needs them
- Floor versions over exact pins

**Links** (web verified only):
- Vite frontend config: https://v2.tauri.app/start/frontend/vite/
- CLI reference: https://v2.tauri.app/reference/cli/
- Capability reference: https://v2.tauri.app/reference/acl/capability/
- Webview versions: https://v2.tauri.app/reference/webview-versions/
- Prerequisites: https://v2.tauri.app/start/prerequisites/
- Store plugin: https://v2.tauri.app/plugin/store/
