# 0011. Polish and packaging three systems

**Date**: 2026-09-16
**Status**: In Progress

## Summary

This spec readies Typeshala for install on Windows plus macOS plus Linux. You get clean offline installers from first launch with lessons plus progress plus settings intact, tidy theming plus icons plus bilingual copy. It means others can install and learn with no setup.

## Context

See `rationale.md`.

## Requirements

**User stories**:

- As a learner, I want clean installers for my system so that I install and learn offline.
- As a learner, I want tidy visuals plus clear copy in my language so that first run feels trustworthy.

**Acceptance criteria**:

- **AC-1**: Clean installers run offline from first launch with bundled lessons plus progress plus settings intact on Windows plus macOS plus Linux.
- **AC-2**: App icon plus window title plus theme polish ships on all three systems, large prompt text kept, keyboard focus visible.
- **AC-3**: Bilingual copy reviewed in English plus Nepali, missing keys fall back to English, no blank labels.
- **AC-4**: Build plus typecheck plus lint plus format run clean, release version set, notes list what is new.
- **AC-5**: Corrupt store on first launch recovers with backup kept plus friendly notice, lessons still open.

## Decision

**Chosen option**: Option 1: Tauri bundler with compile time lesson embedding plus icons

The app ships via the Tauri bundler with icons for all three systems and offline first launch. Lessons ride inside the binary through `include_str!` in `src-tauri/src/commands/lessons.rs`, so no `bundle.resources` entry is needed and no runtime file lookup can fail.

**Implementation skills**: `tauri` (`full-stack-skills/tauri-skills`, `.agents/skills/tauri/`) · `vercel-react-best-practices` (`vercel-labs/agent-skills`, `.agents/skills/vercel-react-best-practices/`) · `tailwindcss` (`hairyf/skills`, `.agents/skills/tailwindcss/`)

## Rationale

See `rationale.md` for context, options, and reasoning.

## Feature design

**Data model sketch**:

- No stored shape change in this slice, schema version stays 1
- Bundle manifest (config, not saved data): app version, icon set paths, window title plus size. Lessons need no manifest entry. They embed at compile time from `src/data/lessons/en-qwerty.json`, `src/data/lessons/ne-romanized.json`, `src/data/lessons/ne-traditional.json` through `include_str!` in `src-tauri/src/commands/lessons.rs`
- Release notes (doc at `docs/release-notes/v1.0.md`): version plus what is new plus systems covered

**State transitions**:

- First launch: fresh to ready with defaults seeded, corrupt to recovered with backup kept plus notice, ready stays ready across restarts.

**API surface**:

| Endpoint       | Method  | Key inputs             | Key outputs                         | Auth        | Key errors                        |
| -------------- | ------- | ---------------------- | ----------------------------------- | ----------- | --------------------------------- |
| `load_lessons` | command | `layout: string` (opt) | `Lesson[]` embedded at compile time | none, local | bundled lesson parse failure      |
| `get_progress` | command | none                   | `Attempt[]` plus bests              | none, local | store read failed, empty on fresh |
| `get_settings` | command | none                   | `Settings`                          | none, local | none, defaults on missing         |

**Value sourcing**:

| Action           | Value produced / displayed          | Source                                                                |
| ---------------- | ----------------------------------- | --------------------------------------------------------------------- |
| First launch     | Seeded settings plus empty progress | `defaultSettings` plus empty store, lessons embedded at compile time  |
| Open lessons     | Lesson lists on all systems         | `load_lessons` from compile time embedded lessons per layout          |
| Icons plus title | Native icon plus window title       | bundler config plus icon set                                          |
| Copy             | Labels in active language           | `src/i18n/` bundles with English fallback                             |
| Recovery         | Backup plus notice                  | store recovery path from spec 0002, notice strings in active language |

**Key invariants**:

- All lesson JSON embeds at compile time through `include_str!`, no fetch and no runtime resource lookup
- First launch works with no network on all three systems
- Stored shapes stay at version 1, no migration in this slice
- Copy keys resolve with English fallback, no blank UI in either language
- Corrupt recovery keeps backup and never blocks lessons

**Security model**:
Local single user app, no roles, no remote calls. Installers request least privilege. No sensitive data beyond typing history.

**Configuration required**:

- Bundler config in `src-tauri/tauri.conf.json`: set `version` to `1.0.0`, `bundle.targets` to `all`, icon paths under `bundle.icon`, window title `Typeshala` plus size `800x600` under `app.windows`. No `bundle.resources` entry. Lessons embed at compile time (see above). No secrets.

**Critical test scenarios**:

- Happy path: clean install on each system, open lessons, type, restart and find progress plus settings kept, verifies **AC-1**
- Visual path: icon plus title plus themes plus large prompt plus focus look steady in both languages, verifies **AC-2**, **AC-3**
- Recovery: corrupt store on first launch recovers with backup plus notice and lessons open, verifies **AC-5**
- Gate: build plus typecheck plus lint plus format clean with version plus notes set, verifies **AC-4**

## Build plan

1. Confirm compile time lesson embedding plus icons plus `bundle.targets: all` for all three systems, satisfies **AC-1**, **AC-2**
2. Polish themes plus window plus focus plus large prompt text on tokens, satisfies **AC-2**
3. Review bilingual copy with English fallback and fill gaps, satisfies **AC-3**
4. Set version to `1.0.0` in `src-tauri/tauri.conf.json` plus `package.json`, write `docs/release-notes/v1.0.md`, then run build plus typecheck plus lint plus format clean, satisfies **AC-4**
5. Prove fresh plus corrupt first launch with backup plus notice and lessons open, satisfies **AC-5**, **AC-1**

## Consequences

**Positive**:

- Others can install and learn offline with trust from first run
- One bundler config serves all three systems going forward

**Negative / tradeoffs**:

- Per system builds cost time plus disk plus signing care
- Updater stays out in this slice so updates need reinstall

**Neutral**:

- Lesson plus store shapes stay at version 1, no data work in this slice

## Follow-up

- [ ] Add updater only if out of band updates become a real need
- [ ] Add signed builds per system when you have signing identities
