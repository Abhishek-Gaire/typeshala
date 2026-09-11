# 0002. Data model local store

**Date**: 2026-09-12
**Status**: Accepted

## Summary

This spec defines the saved shapes for lessons, attempts, settings, and progress in Typeshala. Everything lives on device as JSON (plain text structured data) through the Tauri store plugin (the Tauri helper for simple file saving). Later features can build lessons and trends on these shapes with no redo.

## Requirements

**User stories**:
* As a learner, I want my attempts and settings kept after restart so that progress survives closing the app.
* As a learner, I want per lesson best scores and trends so that improvement stays visible.

**Acceptance criteria**:
* **AC-1**: A finished attempt (one typed lesson try) is saved with lesson id, layout, date, duration, WPM (words per minute), accuracy, and error positions, and it loads back after restart.
* **AC-2**: Bundled lessons are read only content addressed by stable ids, and user data never edits them.
* **AC-3**: Settings hold layout, theme, sound, prompt size, UI language, finger guidance on or off, plus a schema version, and all survive restart with safe defaults on first run.
* **AC-4**: Corrupt or missing store data never crashes the app; defaults plus an empty history are used and the bad file is backed up.
* **AC-5**: Every attempt is kept with no cap for v1, ordered by date, queryable per lesson and per layout.

## Decision

**Chosen option**: Option 1: Store plugin JSON with bundled lesson files

The app ships read only lesson JSON and keeps all user data in one versioned store file through a thin typed wrapper.

**Implementation skills**: `tauri` (`full-stack-skills/tauri-skills`, `.agents/skills/tauri/`) · `tauri-app-store` (`full-stack-skills/tauri-skills`, `.agents/skills/tauri-app-store/`) · `typescript-advanced-types` (`wshobson/agents`, `.agents/skills/typescript-advanced-types/`)

## Rationale

Reasoning and options: see `rationale.md` beside this file.

## Feature design

**Data model sketch**:
* `Lesson`: `id: string` (req, stable, unique), `layout: LayoutId` (req), `title: string` (req), `prompt: string` (req), `order: number` (req), `level: string` (opt). Lives in bundled JSON under `src/data/lessons/`, never in the store.
* `Attempt`: `id: string` (req, unique), `lessonId: string` (req, FK to Lesson), `layout: LayoutId` (req), `startedAt: string` ISO date (req), `durationMs: number` (req), `wpm: number` (req), `accuracy: number` 0 to 100 (req), `errors: number[]` char positions (req, may be empty), `completed: boolean` (req). Stored in array `attempts`, append only.
* `BestScore`: derived at read time per `lessonId`, not stored. Source values are the `attempts` array.
* `Settings`: `schemaVersion: number` (req, starts at 1), `layout: LayoutId` (req), `theme: Theme` (req), `sound: boolean` (req), `promptSize: number` (req), `uiLanguage: UILanguage` (req), `fingerGuidance: boolean` (req). Stored under key `settings`.
* `Progress`: derived at read time from `attempts` (per lesson bests, counts, trends). Stored only as cache if ever needed, never as truth.
* Enums: `LayoutId = qwerty | romanized | traditional`, `Theme = light | dark | system`, `UILanguage = en | ne`.
* Store file keys: `settings`, `attempts`, `meta` (`meta = { schemaVersion, createdAt, updatedAt }`).

**State transitions**: none. Attempts are append only records. Settings are last write wins.

**API surface**:

| Endpoint | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `load_lessons` | command | `layout: LayoutId` (opt) | `Lesson[]` | none, local | invalid layout, missing bundle file |
| `get_lesson` | command | `id: string` (req) | `Lesson` | none, local | not found |
| `save_result` | command | `Attempt` (req, without id, id assigned inside) | `Attempt` with id | none, local | validation failed, store write failed |
| `get_progress` | command | `lessonId: string` (opt), `layout: LayoutId` (opt), `limit: number` (opt) | `Attempt[]` plus derived bests | none, local | store read failed |
| `get_settings` | command | none | `Settings` | none, local | none, returns defaults on missing |
| `save_settings` | command | `Settings` partial (opt fields) | `Settings` merged | none, local | validation failed, store write failed |

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| `save_result` | attempt id | assigned inside by the backend from date plus counter |
| `save_result` | WPM plus accuracy | computed in TypeScript by the typing engine, passed in as inputs |
| `get_progress` | per lesson bests | derived from the `attempts` column by max WPM then max accuracy |
| `get_progress` | trend points | derived from the `attempts` column ordered by `startedAt` |
| `get_settings` | effective settings on first run | merged from bundled defaults plus any stored partial |
| `load_lessons` | lesson order | the `order` column of the bundled lesson file |

**Key invariants**:
* Lesson ids are stable across releases; never reused for different content.
* Attempts are never updated or deleted in v1; writes append only.
* Settings writes are validated then merged; unknown fields are dropped and defaults fill missing ones.
* Stored computed bests never override recomputation; `attempts` is the truth.
* All bridge payloads are plain objects with strict types; no store internals leak to views.

**Security model**: single local user, no roles, no network. Any local process as the user can read the store file; that matches the offline promise. No PII beyond typing stats. No compliance scope.

**Configuration required**: none. Store path uses the plugin default app data dir. No env vars or secrets.

**Critical test scenarios**:
* Happy path: finish a lesson, restart, attempt plus settings load back, verifies **AC-1**, **AC-3**
* Failure case: corrupt store file starts the app on defaults with history empty and the bad file backed up, verifies **AC-4**
* Auth/permission: not applicable, local only with no users or roles

## Build plan

1. Add store plugin plus typed bridge wrapper with the one error shape (`load_lessons`, `get_lesson`, `save_result`, `get_progress`, `get_settings`, `save_settings`), satisfies **AC-1**, **AC-2**, **AC-3**
2. Add bundled lesson JSON plus loaders with stable ids and order, satisfies **AC-2**
3. Add settings load plus save with defaults and schema version, satisfies **AC-3**
4. Add attempt save plus progress reads with derived bests and trends, satisfies **AC-1**, **AC-5**
5. Add corrupt store recovery with backup plus defaults, satisfies **AC-4**

## Consequences

**Positive**:
* One shape serves the tutor, lessons, trends, and settings with no rework
* All typing math stays in testable TypeScript while Rust owns only files

**Negative / tradeoffs**:
* Trend queries scan arrays, so a future with huge history needs the planned SQLite move
* No mult user or sync story; adding either later means a new spec and a migration

**Neutral**:
* SQLite migration stays planned, owned by a later spec when volume demands it

## Follow-up

* [ ] Design lessons and progression on these shapes (`/architect structured lessons and progression`)
* [ ] Migrate to SQLite when history or query needs outgrow JSON scanning
