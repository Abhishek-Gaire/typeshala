# 0009. Settings language and themes

**Date**: 2026-09-15
**Status**: Approved (cross-checked 2026-09-15, 5 fixes applied)

## Summary

This spec adds one settings screen to the tutor you already use. You pick layout plus UI language plus theme plus sound plus prompt size in one place, and every choice saves on device at once. It means restart keeps your setup in English or Nepali UI with no surprises.

## Context

Settings already exist in the store with safe defaults, and the hook applies theme plus locale plus prompt size today. Controls stay scattered with layout buttons in the picker and no single home for sound plus theme plus size. Learners need one clear screen that applies each change at once and survives restart. Copy must read well in both languages with English fallback always. If this stays vague, the build may split settings across two truths or bump the stored shape with no need.

## Requirements

**User stories**:
* As a learner, I want one settings screen to change layout plus language plus theme plus sound plus prompt size so that setup stays simple.
* As a learner, I want restart to keep every choice so that I set once and learn.

**Acceptance criteria**:
* **AC-1**: Settings view lets you pick layout (English, Romanized, Traditional) plus UI language (English, Nepali) plus theme (light, dark, system) plus sound on or off plus prompt size (standard, large).
* **AC-2**: Each change saves at once to device store and applies at once (theme class, locale strings, prompt size, layout list).
* **AC-3**: Restart keeps all choices, missing or corrupt settings fall back to safe defaults with a friendly notice, app never crashes.
* **AC-4**: Prompt size stays in range 12 to 48, out of range values ignored, mapping standard to 28 and large to 40. Fresh default is 28 (standard); legacy stored 22 still reads as standard via `px >= 32` threshold, no migration.
* **AC-5**: All labels in active language with English fallback, full keyboard reach with visible focus, large readable controls. New keys: `settings.sound`, `settings.layout`, `settings.saveFailed`, `settings.restoredDefaults`, `theme.system`, `size.standard`, `size.large`, `sound.on`, `sound.off`, `lang.english`, `lang.nepali`. Notices render via `t()` never raw codes.

## Options considered

### Option 1: Single settings screen on existing shape plus hook

One view over existing `Settings` shape via `useUiSettings` plus `get_settings` plus `save_settings`, no schema change, schema version stays 1.

**Pros**:
* Smallest change that still unifies setup with proven save path
* No migration and no dual truth to keep aligned

**Cons**:
* Hook grows a sound toggle plus layout list that picker also touches
* Prompt size stays to two steps in this slice, no fine slider

### Option 2: Split settings across picker plus system menu

Keep layout in picker and move the rest to a native menu outside React.

**Pros**:
* Picker stays as today with little view work

**Cons**:
* Setup splits across two homes so learners hunt for controls
* Native menu glue adds platform code on all three systems

### Option 3: New settings shape with version bump

New stored shape with finer sizes plus per layout prefs plus migration.

**Pros**:
* Room for fine grained prefs from day one

**Cons**:
* Migration plus fallback paths for modest gain in this slice
* More copy plus tests for prefs learners did not ask for

## Decision

**Chosen option**: Option 1: Single settings screen on existing shape plus hook

The app adds one React screen on the saved shape you already trust with no migration.

**Implementation skills**: `vercel-react-best-practices` (`vercel-labs/agent-skills`, `.agents/skills/vercel-react-best-practices/`) · `typescript-advanced-types` (`wshobson/agents`, `.agents/skills/typescript-advanced-types/`) · `tailwindcss` (`hairyf/skills`, `.agents/skills/tailwindcss/`) · `tauri-app-store` (`full-stack-skills/tauri-skills`, `.agents/skills/tauri-app-store/`)

## Rationale

The store plus hook already prove the save path with safe defaults and corrupt recovery. Option 1 fits those forces directly and keeps copy plus tests small. Option 2 splits the mental model. Option 3 adds migration weight with no agreed need. You asked me to pick the recommended path, so I picked Option 1.

## Feature design

**Data model sketch**:
* Settings (reuse verbatim, no schema change): schemaVersion equals 1 (req), layout (req), theme (req), sound (req, true or false), promptSize (req, number px), uiLanguage (req, en or ne), fingerGuidance (req, true or false, kept but not edited here)
* SettingsPatch (reuse): every field optional except schemaVersion, out of range promptSize ignored

**State transitions**:
* Settings view: loading to ready on `get_settings`, loading to defaults with notice on missing or corrupt, ready stays ready on each patch with save in background plus notice only on save fail.

**API surface**:
| Endpoint | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `get_settings` | command | none | `Settings` | none, local | none, defaults on missing |
| `save_settings` | command | `SettingsPatch` (req) | `Settings` | none, local | validation failed, store write failed |

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| Open settings | Current layout plus language plus theme plus sound plus size | `get_settings` output, defaults when missing |
| Change layout | New lesson list plus typing prompt set | `Settings.layout` saved via `save_settings`, lessons reload via `load_lessons` |
| Change language | New UI strings | `Settings.uiLanguage` plus `t` lookup with English fallback from `src/i18n/` |
| Change theme | New theme class | `Settings.theme` applied to root class plus color scheme; `system` resolves via `prefers-color-scheme` media query with live listener |
| Toggle sound | Sound on or off persisted | `Settings.sound` saved via `save_settings`; no audible effect in this slice, typing plus game honor it later |
| Change size | New prompt px | `Settings.promptSize` mapped from standard 28 and large 40, applied via tokens |
| Save fail | Friendly notice with retry | view strings in active language, retry resends patch |

**Key invariants**:
* Settings are last write wins, single row under `settings` key
* Missing or corrupt falls back to `defaultSettings` with notice, never blocks typing
* promptSize valid 12 to 48 inclusive, else ignored
* UI strings always resolve with English fallback when Nepali key missing; hook notices store keys (`settings.restoredDefaults`, `settings.saveFailed`) rendered via `t()`, never raw codes
* Hook exposes `sound` plus `setSound`; `system` theme never renders as forced light
* New `src/features/settings/SettingsView.tsx` plus nav `settings` entry in `App.tsx`; picker layout buttons remain as quick switch
* No layout choice ever locks the learner out, first lesson of chosen layout stays open

**Security model**:
Local single user app, no roles, no remote calls. Settings stay on device. No sensitive data.

**Configuration required**:
Omitted, no new env vars or credentials needed.

**Critical test scenarios**:
* Happy path: change each setting, see it apply at once, restart and find it kept, verifies **AC-1**, **AC-2**, **AC-3**
* Recovery: corrupt settings fall back to defaults with notice, out of range size ignored, verifies **AC-3**, **AC-4**
* Language path: switch to Nepali and see all labels in Nepali with English fallback where missing, full keyboard use, verifies **AC-5**

## Build plan

1. Add settings view with layout plus language plus theme plus sound plus size controls on tokens, satisfies **AC-1**, **AC-5**
2. Wire view to hook plus `get_settings` plus `save_settings` with apply at once behavior, satisfies **AC-2**
3. Add restart persistence plus missing plus corrupt fallback with notice, satisfies **AC-3**, **AC-4**
4. Add nav entry plus bilingual copy with English fallback plus keyboard focus states, satisfies **AC-5**

## Consequences

**Positive**:
* Setup unifies in one screen with proven save path
* Later polish can refine copy with no shape change

**Negative / tradeoffs**:
* Prompt size stays to two steps in this slice
* Sound toggle has little audible use until game lands

**Neutral**:
* Picker layout buttons remain as quick switch beside settings home

## Follow-up

* [ ] Add fine size slider only if learners ask for it
* [ ] Add per layout prefs only with a real need and a migration plan
