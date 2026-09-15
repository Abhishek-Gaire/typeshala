# 0006. Nepali Romanized layout

**Date**: 2026-09-15
**Status**: In Progress

## Summary

This spec adds a Nepali Romanized layout to the tutor you already use. You type familiar roman letters and see Devanagari text (the Nepali script in Unicode form) appear, with the same scoring plus unlock rules you know. It means Nepali learners can start at once with no new screens to learn.

## Context

English lessons prove the core loop works: pick a lesson, type it, see live scores, save the result, unlock the next step. Nepali learners now need the same loop in their own script. The kindest start is Romanized input, where the fingers press known roman keys and the screen shows Devanagari chars (Nepali letters in standard Unicode form).

Forces at play are familiarity and reuse. The engine plus store plus progression already exist and must not be rebuilt. The transliteration map (the table from roman sequences to Devanagari chars) must stay exact so scoring and guidance never guess. True conjunct handling (joined letter clusters) and Traditional Preeti keys belong to feature 8, so this slice must avoid prompts that need them. If this decision stays vague, the build may invent fuzzy matching that later slices must undo.

## Requirements

**User stories**:
* As a Nepali learner, I want to pick a Romanized lesson and type Nepali prompts with familiar keys so that I can practice at once.
* As a Nepali learner, I want live scores plus lit keys plus unlocks that work like English so that learning feels continuous.

**Acceptance criteria**:
* **AC-1**: Lesson picker plus settings offer a Romanized layout choice, bundled Romanized lessons group by stage in fixed order with locked state visible.
* **AC-2**: Typing view accepts roman keystrokes, shows Devanagari prompt text large and readable, colors each step right or wrong while typing, shows live words per minute and accuracy.
* **AC-3**: Virtual keyboard lits the first roman key of the next sequence and shows the full roman sequence as hint, with finger guidance from the existing map.
* **AC-4**: Finish saves the attempt with layout romanized, result view shows summary plus next lesson button, bests plus unlocks derive exactly as in feature 6, first lesson open at fresh start.
* **AC-5**: Romanized lessons use simple chars only with no conjunct clusters, a committed wrong roman sequence counts one errorHit with backspace to fix (pending prefix buffers never count), accuracy counts corrected plus final errors as in spec 0004.
* **AC-6**: Missing lessons plus save fail plus corrupt store show friendly text with retry in the active language, app never crashes, all data stays local with no network call.

## Options considered

### Option 1: Roman input to Devanagari on the same engine

Fixed bundled map from roman sequences to Devanagari chars, same Lesson shape with layout romanized, same scoring plus progression plus save paths, lessons avoid conjuncts.

**Pros**:
* Smallest build that still teaches, no store change
* Guidance plus scoring stay exact with no guessing

**Cons**:
* Lesson authors must avoid conjuncts in this slice
* Alternate spellings count as errors until Traditional arrives

### Option 2: Forgiving map with spelling variants

Accept common alternate roman spellings for the same Devanagari char.

**Pros**:
* Kinder to learners who spell sounds differently

**Cons**:
* Variants need tuning and can hide real errors
* Scoring plus guidance grow branches that later slices must keep

### Option 3: Separate Nepali engine with own save path

New typing state plus new save shape tuned for Nepali.

**Pros**:
* Full control over transliteration timing and display

**Cons**:
* Duplicates store plus progression work, splits truth across two paths

## Decision

**Chosen option**: Option 1: Roman input to Devanagari on the same engine

The app reuses the existing loop with a fixed roman to Devanagari map and bundled lessons that avoid conjuncts.

**Implementation skills**: `vercel-react-best-practices` (`vercel-labs/agent-skills`, `.agents/skills/vercel-react-best-practices/`) · `typescript-advanced-types` (`wshobson/agents`, `.agents/skills/typescript-advanced-types/`) · `tailwindcss` (`hairyf/skills`, `.agents/skills/tailwindcss/`)

## Rationale

The scope row asks for Romanized on the same engine, and you confirmed the recommended answers on input method plus content plus switching plus scope guard. Option 1 fits those forces directly: fixed map keeps scoring exact, same Lesson shape keeps progression free, avoiding conjuncts keeps backspace simple until feature 8 owns true clusters. Option 2 adds tuning burden with no agreed variant list. Option 3 splits saved truth for no learner visible gain.

## Feature design

**Data model sketch**:
* Lesson (bundled file, keep shape from spec 0002): id (req), layout = romanized (req, existing LayoutId value per spec 0002 enums, no schema change), title (req), prompt (req, Devanagari Unicode text), order (req, number, unique per layout), level (opt, stage group using shipped kebab casing like `home-row`, `words`, `sentences`)
* RomanMap (bundled table, read only): sequence (req, roman letters for one prompt char), devanagari (req, single Unicode char), one row per char used in lessons, no variants
* Attempt (reuse shape verbatim): id, lessonId (FK to Lesson.id), layout = romanized, startedAt, durationMs, wpm, accuracy, errors, completed
* Derived view (not saved, reuse selectors from spec 0005): lessonId, title, bestWpm, bestAccuracy, status (locked or open or done), unlocks when prior lesson in order has an attempt with completed true

**State transitions**:
* Typing session: idle to active on first key, active to done at last prompt char, done to idle on restart or back. Save runs once on entry to done. Roman sequence state resets on backspace past its start.

**API surface**:
| Endpoint | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `load_lessons` | command | `layout: romanized` (opt) | `Lesson[]` | none, local | missing bundle file |
| `get_lesson` | command | `id: string` (req) | `Lesson` | none, local | not found |
| `save_result` | command | `Attempt` without id (req) | `Attempt` with id | none, local | validation failed, store write failed |
| `get_progress` | command | `lessonId: string` (opt) | `Attempt[]` plus derived bests | none, local | store read failed |
| `get_settings` | command | none | `Settings` | none, local | none, defaults on missing |
| `save_settings` | command | `Settings` (req) | `Settings` | none, local | validation failed, store write failed |
| romanizeStep | pure domain | `sequence: string` (req), map rows | `devanagari char` or none | local only | unknown sequence |

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| Open picker | Romanized lesson list with titles plus stage groups | `load_lessons` output filtered by layout romanized, bundled file |
| Layout switch | Current layout choice | `Settings.layout` plus picker selection, saved via settings write |
| Typing keystroke | Devanagari char shown plus per step color | derived from typed roman sequence plus RomanMap row vs prompt char in view state |
| Typing view | Live words per minute plus accuracy | derived from correct chars plus durationMs in domain math per spec 0004 |
| Typing view | Lit key plus finger hint plus full sequence hint | derived from first roman key of next sequence plus RomanMap row plus existing key map, honors `Settings.fingerGuidance` |
| Finish | Saved `Attempt` with layout romanized | input params plus derived scores, stored via `save_result` |
| Result view | Summary plus next lesson button target | `save_result` output plus selectNextLesson from order |
| Error states | Friendly text with retry | view strings in active language from `src/i18n/` |

**Key invariants**:
* Scoring math stays in domain with no framework imports per spec 0004 formulas, with units locked for this layout: correctChars counts completed Devanagari chars, keystrokes plus errorHits count roman key presses
* RomanMap holds exactly one sequence per Devanagari char used in lessons, no variants; romanizeStep returns pending while the buffer is a proper prefix of a known sequence, complete on full match, error only when the buffer matches no sequence prefix; each committed wrong sequence counts one errorHit, backspace clears the pending buffer first then deletes the prior completed char
* Prompts hold Devanagari Unicode only with no conjunct clusters in this slice
* Bests derive at read time, never saved separately, retry keeps highest best
* Unlock needs completed true on the prior lesson in order
* Attempts are append only, settings are last write wins

**Security model**:
Local single user app, no roles, no remote calls. All reads and writes are local to device store. No sensitive data beyond typing history.

**Configuration required**:
Omitted, no new env vars or credentials needed.

**Critical test scenarios**:
* Happy path: pick Romanized lesson, type full prompt in roman, see live score plus lit key, save and see result with next unlocked, verifies **AC-1**, **AC-2**, **AC-3**, **AC-4**
* Failure case: wrong roman sequence counts as error, backspace fixes it, accuracy counts the hit, verifies **AC-5**
* Recovery: empty catalog shows friendly empty state, corrupt store opens first lesson only with backup kept, verifies **AC-6**
* Keyboard path: full lesson by keyboard only with visible focus, restart plus retry plus back all reachable, verifies **AC-2**

## Build plan

1. Add layout romanized plus bundled RomanMap plus Devanagari lessons with order plus level and no conjuncts, satisfies **AC-1**, **AC-5**
2. Add domain romanize step plus sequence state for prompt vs input with existing scoring reuse, satisfies **AC-2**, **AC-5**
3. Update picker plus settings with layout switch grouped ordered list with locked plus best, satisfies **AC-1**, **AC-4**
4. Update typing view with Devanagari prompt plus lit first roman key plus full sequence hint plus finger guidance, satisfies **AC-2**, **AC-3**
5. Wire finish plus save with layout romanized plus result view with next lesson button, satisfies **AC-4**
6. Add empty plus error plus loading states in active language with retry plus keyboard focus, satisfies **AC-6**

## Consequences

**Positive**:
* Nepali learners start with familiar keys on proven engine
* Later Traditional work inherits scoring plus progression with no redo

**Negative / tradeoffs**:
* One spelling per sound can frustrate variant spellers until feature 8
* Lesson authors must screen prompts for conjuncts in this slice

**Neutral**:
* New views plus map live under existing feature folders per layer rules

## Follow-up

* [ ] Feature 8 Traditional Preeti spec will add conjunct plus matra handling with true sequences
* [ ] Consider variant spellings later if learners ask for them
