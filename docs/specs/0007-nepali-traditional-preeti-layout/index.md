# 0007. Nepali Traditional Preeti layout

**Date**: 2026-09-15
**Status**: Accepted

## Summary

This spec adds Traditional Preeti typing to the tutor you already use. You press familiar Preeti positions and see Devanagari text (the Nepali script in standard Unicode form) appear, with conjuncts (joined letter groups) plus matra marks (vowel signs) handled as true units. It means traditional typists can learn real sequences with the same scoring plus unlocks you know.

## Requirements

**User stories**:

- As a traditional learner, I want to pick a Traditional lesson and type conjuncts with true Preeti sequences so that I learn real typing.
- As a traditional learner, I want live scores plus lit keys plus unlocks that work like other layouts so that learning feels continuous.

**Acceptance criteria**:

- **AC-1**: Lesson picker plus settings offer a Traditional layout choice, bundled Traditional lessons group by stage in fixed order with locked state visible.
- **AC-2**: Typing view accepts Preeti keystrokes, shows Devanagari prompt large and readable, colors each unit right or wrong while typing, shows live WPM (words per minute, typing speed) and accuracy.
- **AC-3**: Virtual keyboard lits the first physical key of the next unit and shows the full Preeti sequence as hint, with finger guidance from the existing map.
- **AC-4**: Finish saves the attempt with layout traditional, result view shows summary plus next lesson button, bests plus unlocks derive exactly as in feature 6, first lesson open at fresh start.
- **AC-5**: Conjunct plus matra units count as one scoring unit in WPM plus `errors` (unit indexes, not char indexes, by design), a committed wrong unit counts one error hit with backspace to fix (pending prefix buffers never count), accuracy counts corrected plus final errors as in spec 0004.
- **AC-6**: Missing lessons plus save fail plus corrupt store show friendly text with retry in the active language, app never crashes, all data stays local with no network call.

## Decision

**Chosen option**: Option 1: Fixed Preeti map on same engine with cluster aware sequencer

The app reuses the proven loop with a fixed Preeti to Devanagari table and bundled lessons that grow to clusters.

**Implementation skills**: `vercel-react-best-practices` (`vercel-labs/agent-skills`, `.agents/skills/vercel-react-best-practices/`) · `typescript-advanced-types` (`wshobson/agents`, `.agents/skills/typescript-advanced-types/`) · `tailwindcss` (`hairyf/skills`, `.agents/skills/tailwindcss/`)

## Rationale

Reasoning and options: see `rationale.md` beside this file.

## Feature design

**Data model sketch**:

- Lesson (bundled file, keep shape from spec 0002): id (req), layout equals traditional (req, existing `LayoutId` value, no schema change), title (req), prompt (req, Devanagari Unicode text, clusters allowed), order (req, number, unique per layout), level (opt, free form stage label per layout like `simple`, `matra`, `conjunct`; level carries no cross layout meaning, lists always filter by layout plus order, unlike Romanized `vowels`, `consonants`, `words`, `phrases`)
- PreetiMap (bundled table, read only): sequence (req, physical keys for one prompt unit), devanagari (req, single char or cluster with halant plus matra), one row per unit used in lessons, no variants
- Attempt (reuse shape verbatim): id, lessonId (link to Lesson id), layout equals traditional, startedAt, durationMs, wpm, accuracy, errors, completed
- Derived view (not saved, reuse selectors from spec 0005): lessonId, title, bestWpm, bestAccuracy, status (locked or open or done), unlocks when prior lesson in order has an attempt with completed true

**State transitions**:

- Typing session: idle to active on first key, active to done at last prompt unit, done to idle on restart or back. Save runs once on entry to done. Unit buffer resets on backspace past its start.

**API surface**:

| Endpoint            | Method      | Key inputs                                            | Key outputs                                                         | Auth        | Key errors                            |
| ------------------- | ----------- | ----------------------------------------------------- | ------------------------------------------------------------------- | ----------- | ------------------------------------- |
| `load_lessons`      | command     | `layout: traditional` (opt)                           | `Lesson[]`                                                          | none, local | missing bundle file                   |
| `get_lesson`        | command     | `id: string` (req)                                    | `Lesson`                                                            | none, local | not found                             |
| `save_result`       | command     | `Attempt` without id (req)                            | `Attempt` with id                                                   | none, local | validation failed, store write failed |
| `get_progress`      | command     | `lessonId: string` (opt)                              | `Attempt[]` plus derived bests                                      | none, local | store read failed                     |
| `get_settings`      | command     | none                                                  | `Settings`                                                          | none, local | none, defaults on missing             |
| `save_settings`     | command     | `Settings` (req)                                      | `Settings`                                                          | none, local | validation failed, store write failed |
| `advancePreeti`     | pure domain | `buffer: string` (req), `key: string` (req), map rows | commits plus buffer plus error flag, mirrors `advanceRoman`         | local only  | unknown sequence                      |
| `sequenceForPreeti` | pure domain | Devanagari unit (req)                                 | roman sequence for hints, empty when unknown, mirrors `sequenceFor` | local only  | none                                  |
| `exactCommitPreeti` | pure domain | pending `buffer: string` (req)                        | committed unit or null, mirrors `exactCommit`                       | local only  | none                                  |

**Value sourcing**:

| Action           | Value produced / displayed                            | Source                                                                                                                                          |
| ---------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Open picker      | Traditional lesson list with titles plus stage groups | `load_lessons` output filtered by layout traditional, bundled file                                                                              |
| Layout switch    | Current layout choice                                 | `Settings.layout` plus picker selection, saved via settings write                                                                               |
| Typing keystroke | Devanagari unit shown plus per unit color             | derived from `advancePreeti` on typed buffer plus PreetiMap row vs prompt unit in view state                                                    |
| Typing view      | Live WPM plus accuracy                                | derived from correct units passed as `correctChars` plus durationMs in domain math per spec 0004, with unit divergence noted below              |
| Typing view      | Lit key plus finger hint plus full sequence hint      | derived from `sequenceForPreeti` on next unit for first physical key plus full sequence plus existing key map, honors `Settings.fingerGuidance` |
| Finish           | Saved `Attempt` with layout traditional               | input params plus derived scores, stored via `save_result`                                                                                      |
| Result view      | Summary plus next lesson button target                | `save_result` output plus selectNextLesson from order                                                                                           |
| Error states     | Friendly text with retry                              | view strings in active language from `src/i18n/`                                                                                                |

**Key invariants**:

- Scoring math stays in domain with no framework imports per spec 0004 formulas, with one intentional divergence for this layout: the caller passes completed Devanagari units as `correctChars` to `calcWpm`, so WPM counts units not raw chars and runs lower than English or Romanized by design; keystrokes plus `errorHits` count physical presses; `errors` holds prompt unit indexes not char indexes; this divergence is documented in a comment in `scoring.ts` where the call site lives
- PreetiMap holds exactly one sequence per Devanagari unit used in lessons, no variants; `advancePreeti` returns pending while buffer is a proper prefix of a known sequence, complete on full match, error only when buffer matches no sequence prefix; each committed wrong unit counts one error hit, backspace clears pending buffer first then deletes prior completed unit
- Bests derive at read time, never saved separately, retry keeps highest best
- Unlock needs completed true on prior lesson in order
- Attempts are append only, settings are last write wins

**Security model**:
Local single user app, no roles, no remote calls. All reads and writes stay on device store. No sensitive data beyond typing history.

**Configuration required**:
Omitted, no new env vars or credentials needed.

**Critical test scenarios**:

- Happy path: pick Traditional lesson, type full prompt with Preeti keys, see live score plus lit key, save and see result with next unlocked, verifies **AC-1**, **AC-2**, **AC-3**, **AC-4**
- Failure case: wrong Preeti sequence counts as error, backspace fixes it, accuracy counts the hit, cluster counts as one unit, verifies **AC-5**
- Recovery: empty catalog shows friendly empty state, corrupt store opens first lesson only with backup kept, verifies **AC-6**
- Keyboard path: full lesson by keyboard only with visible focus, restart plus retry plus back all reachable, verifies **AC-2**

## Build plan

1. Add bundled PreetiMap plus Devanagari lessons with order plus level for the existing traditional `LayoutId` (enum already ships in `datastore.ts`, no schema change), satisfies **AC-1**, **AC-5**
2. Add domain `advancePreeti` plus `sequenceForPreeti` plus `exactCommitPreeti` with unit buffer state for prompt vs input, reuse existing scoring and document the unit divergence in `scoring.ts`, satisfies **AC-2**, **AC-5**
3. Update picker plus settings with layout switch grouped ordered list with locked plus best, satisfies **AC-1**, **AC-4**
4. Update typing view with Devanagari prompt plus lit first physical key plus full sequence hint plus finger guidance, satisfies **AC-2**, **AC-3**
5. Wire finish plus save with layout traditional plus result view with next lesson button, satisfies **AC-4**
6. Add empty plus error plus loading states in active language with retry plus keyboard focus, satisfies **AC-6**

## Consequences

**Positive**:

- Traditional learners get true sequences on proven engine
- Later trends plus settings inherit scoring plus progression with no redo

**Negative / tradeoffs**:

- One sequence per unit can frustrate variant typers in this slice
- Lesson authors must vet cluster prompts so hints stay exact

**Neutral**:

- New views plus map live under existing feature folders per layer rules

## Follow-up

- [ ] Tune variant sequences later only if learners ask for them
- [ ] Reuse cluster sequencer notes for game word lists if needed
