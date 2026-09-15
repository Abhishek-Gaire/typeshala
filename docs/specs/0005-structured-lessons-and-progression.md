# 0005. Structured lessons and progression

**Date**: 2026-09-15
**Status**: Accepted

## Summary

This spec adds ordered lessons and clear unlock rules to the tutor you already use. Lessons group by stage from home row outward to words then sentences. Finish a lesson to open the next one, and the picker shows your best score per lesson.

## Context

The smallest usable tutor proves one lesson can be typed and saved. Learners now need a path that builds skill step by step. Without order, learners pick at random and stall. Without unlock rules, progress feels vague. Without best scores, gain stays invisible. The store already saves attempts locally, so progression should derive from that saved truth with no new network or account.

## Requirements

**User stories**:
- As a learner, I want lessons in clear order so that I build skill step by step.
- As a learner, I want to see best scores and locked state so that I know what is next.

**Acceptance criteria**:
- **AC-1**: Picker lists lessons grouped by stage in fixed order with locked state visible.
- **AC-2**: First lesson is open at fresh start, later lessons stay locked until prior lesson has one saved attempt with `completed=true`.
- **AC-3**: Picker shows best WPM and accuracy per finished lesson derived from saved attempts.
- **AC-4**: Result view offers a next lesson button that moves to the newly unlocked lesson.
- **AC-5**: Empty lessons file shows a friendly empty state with retry guidance.
- **AC-6**: Corrupt progress falls back to first lesson open only, with backup kept per existing recovery rule.

## Options considered

### Option 1: Finish to unlock with derived bests
Keep bundled lessons plus order fields, derive unlock and bests at read time from saved attempts.

**Pros**:
- Fewest moving parts, no store shape change
- Bests never go stale

**Cons**:
- Read path computes each time, slower at very large history

### Option 2: Pass mark to unlock
Next opens only on accuracy at or above a threshold.

**Pros**:
- Stronger quality gate

**Cons**:
- Can frustrate new learners, adds tuning burden

### Option 3: Saved progress per lesson
Save explicit unlocked and best per lesson in the store.

**Pros**:
- Fast reads

**Cons**:
- Stored derived values can drift from attempts, needs sync logic

## Decision

**Chosen option**: Option 1: Finish to unlock with derived bests

Simple finish rule keeps learning kind and code small.

**Implementation skills**: `vercel-react-best-practices` (`vercel-labs/agent-skills`, `.agents/skills/vercel-react-best-practices/`) · `typescript-advanced-types` (`wshobson/agents`, `.agents/skills/typescript-advanced-types/`)

## Rationale

The team chose kindness and simplicity over gating. A pass mark would need tuning and could block slow starters. Saved progress would duplicate truth already in attempts. Deriving at read time keeps one source of truth and fits the local only store.

## Feature design

**Data model sketch**:
- Lesson (bundled file, keep shape from spec 0002): id (req), layout: LayoutId (req), title (req), prompt (req), order (req, number), level (opt, stage group using shipped kebab casing like `home-row`, `top-row`, `words`, `sentences`)
- Attempt (reuse shape from spec 0002 verbatim): id, lessonId (FK to Lesson.id), layout, startedAt, durationMs, wpm, accuracy, errors, completed
- Derived view (not saved, extend existing deriveBests): lessonId, title, bestWpm, bestAccuracy, status (locked or open or done), unlocks when prior lesson in order has an attempt with completed true

**State transitions**:
lesson: locked to open (prior lesson completed) to done (own attempt saved)

**API surface** (pure domain selectors over existing bridge `load_lessons, get_lesson, save_result, get_progress`, no new Tauri commands):
| Endpoint | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| selectLessonsWithProgress | read | lessons, attempts | ordered groups, bests, status | local only | empty catalog |
| selectNextLesson | read | currentLessonId:string (req), lessons, attempts | nextLesson or none | local only | none open |
| save_result (existing) | write | lessonId, wpm, accuracy, errors, durationMs (req) | saved attempt | local only | invalid lessonId |

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| picker row | title plus stage group and order | Lesson.title plus Lesson.level plus Lesson.order |
| picker row | best WPM and accuracy | derived via existing deriveBests from Attempt rows for that lessonId (max WPM, accuracy tiebreak) |
| picker row | locked or open | derived from prior lesson Attempt with completed true |
| result view | next lesson button target | selectNextLesson from order |
| empty state | guidance text | bilingual strings bundle |

**Key invariants**:
- order is unique per layout
- first order is always open
- bests derive via deriveBests from attempts, never saved separately
- retry keeps highest best (max WPM, accuracy tiebreak)
- unlock needs completed true, not just any attempt

**Security model**:
Local only single learner. All reads and writes on device. No roles, no network, no personal data beyond typing scores.

**Configuration required**:
Omitted, no new env vars or credentials needed.

**Critical test scenarios**:
- Happy path: finish lesson one, next unlocks with best shown, verifies **AC-2**, **AC-3**
- Failure case: empty catalog shows friendly empty state, verifies **AC-5**
- Recovery: corrupt store keeps backup per spec 0002 AC-4 and opens first lesson only, verifies **AC-6**

## Build plan

1. Add level stage values to bundled lessons and ordered read helper (keep order, layout, title verbatim), satisfies **AC-1**
2. Add progression selector for status plus bests by reuse plus extend of deriveBests, satisfies **AC-2**, **AC-3**
3. Update picker to grouped ordered list with locked plus best plus keyboard move, satisfies **AC-1**, **AC-3**
4. Update result view with next lesson button, satisfies **AC-4**
5. Add empty state plus corrupt fallback to first open, satisfies **AC-5**, **AC-6**

## Consequences

**Positive**:
- Clear path from rows to sentences
- Visible gain per lesson

**Negative / tradeoffs**:
- Read time derive cost grows with history, acceptable at this scale
- No skill gate, fast typists and slow starters share one path

**Neutral**:
- Lesson file shape keeps order plus layout plus title, level gains constrained stage values once

## Follow-up

- [ ] Consider a star or pass badge later if learners want goals beyond finish
