# 0011 Rationale: Polish and packaging three systems

## Context

Features now cover English plus Romanized plus Traditional plus trends plus settings plus game. What remains is ship readiness. Installers must bundle lessons plus icons plus themes and open offline with safe defaults. Copy in both languages must read clean with English fallback always. Window plus icons plus large prompt text must feel steady on all three systems. Store recovery must guard first launch. If this stays vague, the build may ship large or broken bundles or miss resources on one system.

## Options considered

### Option 1: Tauri bundler with bundled resources plus icons

Tauri bundler targets per system with lesson JSON as resources, icon set plus window config in `tauri.conf.json`, store plugin for local data, offline first.

**Pros**:

- Proven path on your stack with one config for all three systems
- Resources plus icons ride with the app so first launch works offline

**Cons**:

- Per system builds need time plus disk plus system deps
- Icon plus signing steps differ per system and need care

### Option 2: Manual zip distribution

Ship loose binaries plus assets in zips per system.

**Pros**:

- Fast to assemble with no bundler tuning

**Cons**:

- No native install feel and easy to miss resources
- Updates plus icons stay manual and error prone

### Option 3: Auto updater with remote feed

Add updater with remote release feed from day one.

**Pros**:

- Later updates arrive with no reinstall

**Cons**:

- Needs hosted feed plus signing plus network paths against local only scope
- More failure modes for first ship with no asked need

## Decision

**Chosen option**: Option 1: Tauri bundler with bundled resources plus icons.

Your stack plus scope already choose Tauri v2 with local only data and desktop installers. Option 1 fits those forces directly and keeps first launch offline. Option 2 feels unfinished. Option 3 adds hosted update weight against your deferred cloud scope.

## Cross-check against repo (2026-09-16)

- **Icons**: present in `src-tauri/icons/` (`32x32.png`, `128x128.png`, `128x128@2x.png`, `icon.icns`, `icon.ico`, `icon.png`). `tauri.conf.json` references the icon set, `targets: "all"`, version `0.1.0`. Pass for AC-2 baseline.
- **AC-1 ratified (2026-09-16)**: the `resources` gap above was wrong. Lessons embed at compile time through `include_str!` in `src-tauri/src/commands/lessons.rs`, so they already ship inside the binary on all three systems with no runtime lookup. Adding `bundle.resources` would ship the same bytes twice and add a path failure mode. Spec updated to ratify embedding. No config change needed.
- **Gap AC-4**: version still `0.1.0` with no release notes file. Build step 4 must set the release version plus notes.
- **AC-3 verified**: `src/i18n/en.json` and `ne.json` both carry 64 keys, zero missing in `ne`, zero blank labels in either. English-fallback invariant holds today; step 3 is review-only.
- **AC-5**: recovery path comes from spec 0002; step 5 must prove fresh plus corrupt first launch with backup plus notice.
- No stored-shape change, schema stays version 1. No new deps. Updater and signing stay follow-ups, consistent with deferred cloud scope.
