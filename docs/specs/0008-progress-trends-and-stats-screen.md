# 0008. Progress trends and stats screen

**Date**: 2026-09-15
**Status**: Accepted

## Summary

This spec adds a progress screen to the tutor you already use. You open progress and read WPM trend (words per minute over time, typing speed) plus accuracy trend plus lessons done from saved results. It means learning gain stays visible with no new save shapes.

## Context

Learners can now type lessons in English plus Romanized plus Traditional and see per lesson bests in the picker. Gain over time stays hidden in a long attempt list. The store already saves every attempt on device, so trends should derive at read time with no new network or account. Screens must honor large text plus full keyboard use plus saved theme plus both languages. If this stays vague, the build may store derived aggregates that go stale or add a chart library that later packaging must carry.

## Requirements

**User stories**:

- As a learner, I want to open progress and read trends over time plus per lesson bests so that I see gain.
- As a learner, I want trends per layout so that English plus Nepali gains stay separate and clear.

**Acceptance criteria**:

- **AC-1**: Progress view opens from nav, shows WPM trend plus accuracy trend plus lessons done from saved results.
- **AC-2**: Trends derive from attempts in time order, per lesson bests shown with attempts count, empty state when no attempts yet.
- **AC-3**: Layout filter offers all (null) plus English (qwerty) plus Romanized (ne-romanized) plus Traditional (ne-traditional), retry keeps highest best, best means highest WPM with ties broken by accuracy.
- **AC-4**: Corrupt or missing progress shows friendly text with retry, app never crashes, first open shows empty state not error.
- **AC-5**: All labels plus numbers in active language, full keyboard reach with visible focus, large readable numbers on theme tokens and large type scale.

## Options considered

### Option 1: Derived read time trends with plain div charts

Read attempts via existing `get_progress`, derive bests plus trend points at read time, draw trends with plain styled divs on existing tokens, no new deps.

**Pros**:

- No store change and no stale aggregates
- Smallest bundle that still reads clearly on all three systems

**Cons**:

- Charts stay simple bars plus lines, no fancy zoom in this slice
- Large histories need paging to stay fast

### Option 2: Chart library with rich visuals

Add a chart package for interactive lines plus tooltips plus zoom.

**Pros**:

- Rich visuals with little custom drawing code

**Cons**:

- New dep to learn plus carry in installers for modest gain
- Theming plus bilingual labels need extra glue

### Option 3: Saved aggregates updated on each save

Write per day plus per lesson aggregates beside attempts on each finish.

**Pros**:

- Reads stay fast even with huge histories

**Cons**:

- Stored computed values go stale and need repair paths
- Corrupt recovery must rebuild aggregates, more code to keep true

## Decision

**Chosen option**: Option 1: Derived read time trends with plain div charts

The app reads saved attempts and draws simple trends with existing UI parts and no new packages.

**Implementation skills**: `vercel-react-best-practices` (`vercel-labs/agent-skills`, `.agents/skills/vercel-react-best-practices/`) · `typescript-advanced-types` (`wshobson/agents`, `.agents/skills/typescript-advanced-types/`) · `tailwindcss` (`hairyf/skills`, `.agents/skills/tailwindcss/`)

## Rationale

The store already holds the truth and bests already derive at read time in prior specs. Option 1 fits those forces directly and keeps packaging light. Option 2 adds weight for little learner gain. Option 3 stores derived values that can drift from attempts.

## Feature design

**Data model sketch**:

- Attempt (reuse verbatim, no change): id, lessonId (link to Lesson id), layout, startedAt (ISO time, req), durationMs, wpm, accuracy, errors, completed
- BestScore (derived at read time, reuse `deriveBests`): lessonId, wpm, accuracy, attempts
- TrendPoint (derived, not saved): startedAt, wpm, accuracy, lessonId, layout
- Progress (reuse `get_progress` output): attempts plus bests

**State transitions**:

- Progress view: loading to ready on read, loading to empty when no attempts, loading to error on read fail with retry. Filter change applies client side on cached attempts with no new fetch.

**API surface**:

| Endpoint       | Method  | Key inputs                                                                 | Key outputs                    | Auth        | Key errors          |
| -------------- | ------- | -------------------------------------------------------------------------- | ------------------------------ | ----------- | ------------------- |
| `get_progress` | command | `lessonId: string` (opt), `layout: LayoutId` (opt), `limit?: number` (opt) | `Attempt[]` plus derived bests | none, local | store read failed   |
| `load_lessons` | command | `layout: LayoutId` (opt)                                                   | `Lesson[]` for titles          | none, local | missing bundle file |

**Value sourcing**:

| Action        | Value produced / displayed                   | Source                                                                                                                                                               |
| ------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Open progress | WPM trend points in time order               | derived from `get_progress` attempts sorted by startedAt                                                                                                             |
| Open progress | Accuracy trend points in time order          | derived from `get_progress` attempts sorted by startedAt                                                                                                             |
| Open progress | Lessons done count plus per lesson bests     | lessons done equals count of `selectLessonsWithProgress` with status done (distinct lessonId with completed true); bests via `deriveBests` from specs 0002 plus 0005 |
| Filter change | Filtered trends plus bests for chosen layout | client side filter of cached attempts by layout (all equals null, English equals qwerty), titles from `load_lessons`                                                 |
| Empty state   | Friendly empty text                          | view strings in active language from `src/i18n/`                                                                                                                     |
| Error state   | Friendly error text with retry               | view strings in active language, retry reruns `get_progress`                                                                                                         |

**Key invariants**:

- Bests plus trends derive at read time, never saved separately
- Bests include all saved attempts per current `deriveBests`; done and lessons done require completed true
- Best means highest WPM with ties broken by accuracy, ordering steady by lesson id then time
- Attempts are append only, no edit path in this slice
- Numbers round as in spec 0004 (WPM to one decimal, accuracy to one decimal)

**Security model**:
Local single user app, no roles, no remote calls. Progress reads stay on device. No sensitive data beyond typing history.

**Configuration required**:
Omitted, no new env vars or credentials needed.

**Critical test scenarios**:

- Happy path: with saved attempts, open progress and read WPM plus accuracy trends plus per lesson bests in time order, verifies **AC-1**, **AC-2**
- Filter path: switch layout filter and see matching trends plus bests only, verifies **AC-3**
- Recovery: corrupt store shows friendly error with retry, fresh install shows empty state, verifies **AC-4**
- Keyboard path: nav to progress plus filter plus retry all by keyboard with visible focus, verifies **AC-5**

## Build plan

1. Add progress selectors for trend points plus bests plus lessons done from attempts in time order, satisfies **AC-1**, **AC-2**, **AC-3**
2. Add progress view with WPM plus accuracy trends plus per lesson bests using plain divs on tokens, satisfies **AC-1**, **AC-2**
3. Add layout filter with all plus English plus Romanized plus Traditional, satisfies **AC-3**
4. Add nav entry plus loading plus empty plus error states in active language with retry plus keyboard focus, satisfies **AC-4**, **AC-5**

## Consequences

**Positive**:

- Gain becomes visible with no store migration
- Later settings plus game reuse the same derived selectors

**Negative / tradeoffs**:

- Charts stay plain in this slice, no zoom or export
- Very large histories may need paging in a later slice

**Neutral**:

- New view lives under features plus shared UI parts per layer rules

## Follow-up

- [ ] Add paging or per month grouping only if histories grow slow
- [ ] Consider export of progress only if learners ask for it
