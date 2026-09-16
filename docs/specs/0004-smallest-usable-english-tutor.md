# 0004. Smallest usable English tutor

**Date**: 2026-09-14
**Status**: Accepted

## Summary

This spec shapes the first usable tutor you can learn with tomorrow. It covers one short English lesson with live scoring plus key guidance plus saved results. All work stays on your own machine with plain and friendly screens.

## Context

Learners need a tiny tutor that works at once, with no setup and no network. The project already has saved shapes for lessons plus attempts plus settings in spec 0002, and visual base plus themes plus bilingual strings in spec 0003. What is missing is the core loop: pick a lesson, type the prompt, see live feedback, save the result, find it after restart.

Forces at play are simplicity and trust. The build approach is Skateboard, so Release 1 must be the thinnest whole that still teaches. Typing math must live in domain code with no framework ties. Screens must honor large prompt text plus full keyboard use plus saved theme. Corrupt or missing data must never block typing. If this decision stays vague, the build may grow too large or invent scoring rules that later lessons must redo.

## Requirements

**User stories**:

- As a learner, I want to pick a short English lesson and type it so that I can practice touch typing at once.
- As a learner, I want live words per minute plus accuracy plus lit next key so that I can adjust while I type.
- As a learner, I want my result saved on device so that it survives restart.

**Acceptance criteria**:

- **AC-1**: Lesson pick shows bundled English lessons, choice opens typing view with prompt text large and readable.
- **AC-2**: Typing view colors each key as right or wrong while typing, shows live words per minute and accuracy, lits next key on virtual keyboard with finger hint.
- **AC-3**: Backspace is allowed to fix errors, accuracy counts corrected plus final errors, typing stops at end of prompt, restart plus retry plus back all work by keyboard and mouse.
- **AC-4**: Finish saves attempt with lesson id plus layout plus date plus duration plus words per minute plus accuracy plus error spots, result view shows summary, saved result loads back after restart.
- **AC-5**: Missing lessons plus save fail plus corrupt store show friendly text with retry in active language, app never crashes, defaults are used.
- **AC-6**: Lesson content is English only with no progression rules plus no trends plus no Nepali prompts, UI strings stay bilingual in English plus Nepali per spec 0003, all data stays local with no network call.

## Options considered

### Option 1: Thin tutor on existing store plus domain scoring

One lesson picker plus typing view plus result view, scoring in domain code, save through existing `save_result` and `get_progress`, styles from shared tokens.

**Pros**:

- Smallest build that still teaches
- Reuses saved shapes, avoids redo later

**Cons**:

- Lesson list stays plain until Release 2 adds order plus bests

### Option 2: Tutor with progression now

Add ordered lessons plus unlock rules plus best scores in this release.

**Pros**:

- Richer learning path at once

**Cons**:

- Grows Release 1 past thin whole, risks delay and rework

### Option 3: Custom typing engine with own save path

New engine plus new save path tuned only for this screen.

**Pros**:

- Full control over timing and save shape

**Cons**:

- Duplicates store work from spec 0002, splits truth across two paths

## Decision

**Chosen option**: Option 1: Thin tutor on existing store plus domain scoring

The app builds a tiny English loop on the saved shapes and shared visual base, with scoring in domain code and save through the typed wrapper.

**Implementation skills**: `tauri` (`full-stack-skills/tauri-skills`, `.agents/skills/tauri/`) · `tauri-app-store` (`full-stack-skills/tauri-skills`, `.agents/skills/tauri-app-store/`) · `vercel-react-best-practices` (`vercel-labs/agent-skills`, `.agents/skills/vercel-react-best-practices/`) · `tailwindcss` (`hairyf/skills`, `.agents/skills/tailwindcss/`) · `typescript-advanced-types` (`wshobson/agents`, `.agents/skills/typescript-advanced-types/`)

## Rationale

The scope row asks for the thinnest usable whole, and the engineer confirmed tiny scope with English only plus deferred progression. Option 1 fits that force directly, while Option 2 adds structure best owned by Release 2 and Option 3 splits saved truth. Reuse of the store shapes and visual base keeps later releases stable, and domain scoring keeps math testable apart from views.

## Feature design

**Data model sketch**:

- Reuse from spec 0002, no new entities and no schema change in this slice.
- `Lesson`: `id: string` (req), `layout = qwerty` (req), `title: string` (req), `prompt: string` (req), `order: number` (req). Bundled under `src/data/lessons/`, addressed by stable id.
- `Attempt`: `id: string` (req), `lessonId: string` (req), `layout = qwerty` (req), `startedAt: string` ISO date (req), `durationMs: number` (req), `wpm: number` (req), `accuracy: number` 0 to 100 (req), `errors: number[]` spots (req), `completed: boolean` (req).
- `Settings` follows spec 0002 verbatim: `schemaVersion: number` (req), `layout: LayoutId` (req), `theme: Theme` where `Theme = light | dark | system` (req), `sound: boolean` (req), `promptSize: number` (req), `uiLanguage: UILanguage` where `UILanguage = en | ne` (req), `fingerGuidance: boolean` (req). This slice reads prompt size plus finger guidance plus theme plus language; it adds no new keys. Note: spec 0003 words prompt size as standard or large; treat those as labels for numeric sizes until specs align.

**State transitions**:

- Typing session: `idle` to `active` on first key, `active` to `done` at last prompt char, `done` to `idle` on restart or back. Save runs once on entry to `done`.

**API surface**:

| Endpoint       | Method  | Key inputs                 | Key outputs                    | Auth        | Key errors                            |
| -------------- | ------- | -------------------------- | ------------------------------ | ----------- | ------------------------------------- |
| `load_lessons` | command | `layout: qwerty` (opt)     | `Lesson[]`                     | none, local | missing bundle file                   |
| `get_lesson`   | command | `id: string` (req)         | `Lesson`                       | none, local | not found                             |
| `save_result`  | command | `Attempt` without id (req) | `Attempt` with id              | none, local | validation failed, store write failed |
| `get_progress` | command | `lessonId: string` (opt)   | `Attempt[]` plus derived bests | none, local | store read failed                     |
| `get_settings` | command | none                       | `Settings`                     | none, local | none, defaults on missing             |

**Value sourcing**:

| Action           | Value produced / displayed               | Source                                                                                                  |
| ---------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Open picker      | Lesson list with titles                  | `load_lessons` output, bundled `Lesson` rows                                                            |
| Typing keystroke | Per key color right or wrong             | derived from prompt char vs typed char in view state                                                    |
| Typing view      | Live words per minute                    | derived from correct chars plus `durationMs` in domain math                                             |
| Typing view      | Live accuracy                            | derived from errors plus typed count in domain math                                                     |
| Typing view      | Next lit key plus finger hint            | derived from next prompt char plus key map, honors `Settings.fingerGuidance`                            |
| Finish           | `durationMs`                             | derived from start time to end time in session state                                                    |
| Finish           | Saved `Attempt`                          | input params plus derived scores, stored via `save_result`                                              |
| Result view      | Summary plus single lesson last run note | `save_result` output plus `get_progress` per lesson; no ordered best list and no unlock until Release 2 |
| Error states     | Friendly text with retry                 | view strings in active language from `src/i18n/`                                                        |

**Key invariants**:

- Scoring math lives in `domain` with no framework imports; views never compute words per minute or accuracy inline. Canonical formulas: words per minute equals correct chars divided by 5 divided by minutes elapsed, accuracy equals keystrokes minus error hits divided by keystrokes times 100, where error hits counts each wrong key press even if later fixed by backspace. `errors: number[]` holds final error spots in prompt order after corrections.
- Prompt text is bundled content and never edited by user data.
- Attempts are append only; settings are last write wins.
- Prompt size plus theme plus language follow spec 0003 tokens and saved settings.

**Security model**:

- Local single user app, no roles, no remote calls. All reads and writes are local to device store. No sensitive data beyond typing history.

**Configuration required**:
None. No new env vars or secrets.

**Critical test scenarios**:

- Happy path: pick lesson, type full prompt, see live score plus lit key, save and see result, verifies **AC-1**, **AC-2**, **AC-4**
- Failure case: corrupt store plus save fail show friendly text with retry and typing still works, verifies **AC-5**
- Keyboard path: full lesson by keyboard only with visible focus, restart plus retry plus back all reachable, verifies **AC-3**
- Persistence: restart app and find saved result plus settings kept, verifies **AC-4**

## Build plan

1. Domain scoring plus session state for prompt vs input plus words per minute plus accuracy plus error spots, satisfies **AC-2**, **AC-3**
2. Lesson picker plus typing view with large prompt plus per key color plus live scores plus virtual keyboard with lit next key plus finger hint, satisfies **AC-1**, **AC-2**, **AC-3**
3. Finish plus save via `save_result` plus result view plus reload after restart, satisfies **AC-4**
4. Empty plus error plus loading states in active language with retry plus keyboard focus plus saved theme, satisfies **AC-5**, **AC-1**
5. English only guard plus local only check plus bilingual strings for new screens, satisfies **AC-6**

## Consequences

**Positive**:

- Learners get a usable tutor at once on solid saved shapes.
- Later releases add order plus trends plus Nepali with no scoring redo.

**Negative / tradeoffs**:

- Picker stays plain with no bests or unlock until Release 2.
- Single fixed layout in this slice, so keyboard map work repeats for Nepali later.

**Neutral**:

- New views live under `src/features/` per layer rules, shared parts stay in `src/components/`.

## Follow-up

- [ ] Structured lessons plus progression spec will add order plus bests plus unlock rules on this loop.
- [ ] Nepali layouts will reuse scoring plus session state with new prompts and key maps.
