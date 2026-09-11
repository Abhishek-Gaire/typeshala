# Rationale: 0001. Stack and architecture

Decision record for the build spec in `index.md` beside this file. The build spec holds what to build; this file holds why.

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

## Rationale

The shell choice follows the local only promise: with no server and one user per device, there is no force that pays for a bundled browser or a relational database on day one, so the boring small option wins (basis: boring technology, proven tools first; monolith first, one deployable per OS). React plus TypeScript wins on fit rather than fashion: the typing engine and the Preeti key map are exactly the kind of pure logic where the compiler catches mistakes before a learner ever sees them (basis: your plan `typeshala-architecture-plan.md`, engine owned by the frontend). The store plugin wins for the same reason at the save layer: results and settings are small documents with almost no relational shape, one writer, no concurrency, so JSON key value with auto save is sufficient, and the SQLite migration stays explicitly open for the trends screen (basis: key value fits single writer document shape; your scope, data model spec still owed). Tailwind was your call over starting bare, trading a heavier scaffold for faster keyboard and screen styling, which is reasonable given the bilingual UI doubles styling surface (basis: your stack walk pick).

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
