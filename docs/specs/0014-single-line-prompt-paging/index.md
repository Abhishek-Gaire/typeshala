# 0014. Single line prompt paging

**Date**: 2026-09-17
**Status**: Accepted

## Summary

You asked for a calmer drill view. This spec keeps your classic drill logic exactly as is and shows the blue target as one line at a time. When you finish a line, the next part slides into view. Nothing else sits above the keyboard. Busy readers get this in seconds. Paging means showing one slice at a time. Group means one drill token like `aaa` in code. Slice means one page of groups.

## Requirements

**User stories**:

1. As a learner, I want the target to show one line at a time so that I can focus without a wall of blue text.
2. As a learner, I want groups like `aaa` to never split across lines so that my finger pattern stays clear.
3. As a learner, I want a slide so that I know I moved forward.

**Acceptance criteria**:

1. **AC-1**: Active page shows only its target slice in blue plus its typed slice in black below it. No other page text is visible and no counter row shows.
2. **AC-2**: Pages are built from whole space separated groups. A group like `aaa` never splits. Page size is 8 groups except the last page which may hold fewer.
3. **AC-3**: Typing the last unit plus space advances to the next page with a short slide. Motion lasts 180 to 220 ms. Reduced motion setting (your OS prefers reduced motion option) shows an instant jump with no slide.
4. **AC-4**: Backspace at a page start returns to the prior page with prior typed chars kept. Restart returns to page 1. Red next key cue (the red highlight that shows which key is due) plus live speed (your WPM number, words per minute) plus save on finish keep working unchanged.
5. **AC-5**: All strings stay in English plus Nepali with English fallback. All colors come from tokens. Keyboard use plus visible focus plus screen reader announcements keep working.

## Decision

**Chosen option**: Option 1: Group aware paging with slide

You show one page of 8 whole groups at a time with a slide forward and no extra chrome. It honors your picks directly.

**Implementation skills**: `tailwindcss` (`hairyf/skills`, `.agents/skills/tailwindcss/`) · `vercel-react-best-practices` (`vercel-labs/agent-skills`, `.agents/skills/vercel-react-best-practices/`)

## Rationale

Reasoning and options: see `rationale.md` beside this file.

## Feature design

**Data model sketch**:

1. No schema change. You reuse `Lesson` with `prompt` plus `category` plus `difficulty` from spec 0012.
2. New derived view only, not saved: `pages: string[][]` where each inner list holds up to 8 whole groups, plus `pageIndex: number` plus `pageTotal: number`.
3. Tokenizer (the splitter that turns text into groups): split prompt on spaces, drop empty tokens, keep each token whole. For Traditional you first run `splitUnits` in code then regroup by spaces so `ममम` in code stays whole.

**State transitions**:

1. `idle` to `active` on first key, same as today. `pageIndex` starts at 0.
2. `active` forward: when typed length passes the end of the active page groups plus spaces, `pageIndex` goes up by one and slide plays.
3. `active` back: when backspace deletes past the start of the active page, `pageIndex` goes down by one with typed chars kept.
4. `done` at last unit of last page triggers save once, same as today. Restart sets `pageIndex` to 0 and clears typed.

**API surface**:

1. Pure helper `chunkGroupsForPages` in code: inputs `tokens: string[]` in code plus `perPage: number` in code. Output `string[][]` in code. No store use. No auth. Error case returns empty list for empty input.
2. Component `ClassicPrompt` in code: new props `page` plus `pageIndex` plus `pageTotal` in code. Renders target slice plus typed slice only. Honors reduced motion.
3. Container `ClassicScreen` in code: derives `pages` plus `pageIndex` from lesson prompt plus typed length. Keeps `codeForNextUnit` plus `wpm` plus `buildAttempt` calls unchanged.

**Value sourcing**:

1. Action open drill screen. Value prompt text. Source bundled `Lesson.prompt` via `load_lessons` filter by layout plus category plus difficulty.
2. Action build pages. Value pages plus pageTotal. Source pure helper over prompt tokens with `perPage = 8` in code.
3. Action render page. Value target slice plus typed slice. Source active page index plus typed array slice.
4. Action type keystroke. Value next red key plus per unit color plus caret. Source cursor in active page, same derivation as spec 0012.
5. Action finish drill. Value saved attempt. Source same scoring math plus `save_result`, unchanged.
6. Action motion. Value slide or instant jump. Source OS reduced motion query plus page change event.

**Key invariants**:

1. A group never splits across pages.
2. Exactly one page is visible at a time.
3. Exactly one keyboard key carries red next state at a time, derived from cursor, never stored.
4. Scoring math stays in domain with no framework imports. Views never compute WPM inline.
5. Colors come from tokens. Strings resolve with English fallback.

**Security model**:

Local single user app, no roles, no remote calls. All reads plus writes stay on device store. No new sensitive data.

**Configuration required**:

None. No new env vars or secrets. Motion duration lives as a token or const, default 200 ms.

**Critical test scenarios**:

1. Happy path: open Home English Level 1, see only page 1 with no counter row, type through the page edge, see slide into page 2, verifies **AC-1**, **AC-3**.
2. Group rule: chunk helper over `aaa jjj` style prompts never emits a split token, last page may be short, verifies **AC-2**.
3. Back plus restart: backspace at page start returns to prior page with chars kept, restart returns to page 1, verifies **AC-4**.
4. Reduced motion: with reduced motion on, page change swaps with no slide, verifies **AC-3**.
5. Language plus a11y path: switch flags mid drill keeps page logic, screen reader announces the new page text, keyboard only flow with visible focus passes, verifies **AC-5**.
6. Regression: full drill save plus red key tracking plus live speed match current behavior, verifies **AC-4**.

## Build plan

Skateboard applies here. You land the thinnest usable paging whole first, then grow polish. I recommend you build in this order.

1. Add pure helper plus unit tests for whole group chunking with 8 per page default, satisfies **AC-2**.
2. Update prompt view to render active page only with fully hidden remainder, satisfies **AC-1**.
3. Wire page index forward plus back plus restart in the container with existing session hooks untouched, satisfies **AC-4**.
4. Add slide motion plus reduced motion instant path plus screen reader announcement, satisfies **AC-3**, **AC-5**.
5. Run drill lint plus full test suite plus typecheck plus lint, satisfies **AC-1**, **AC-2**, **AC-3**, **AC-4**, **AC-5**.

## Consequences

**Positive**:

1. You get a calm single line focus that matches your screenshot ask.
2. You keep teaching units whole, so finger patterns transfer cleanly.
3. You touch presentation only, so scoring plus progress plus keyboard truth stay stable.

**Negative / tradeoffs**:

1. You add paging state plus animation to maintain in the classic shell.
2. You fix page size at 8, so very narrow windows may still need font clamp tuning.
3. You hide future text, so learners lose the old scan ahead view.

**Neutral**:

1. New helper lives in domain as pure logic, view lives in `src/components`, wiring lives in `src/features`, per layer rules.
2. Spec 0012 two line language stays true, now paged one slice at a time.

## Follow-up

1. [ ] Confirm 8 groups per page after real use on small laptop widths, adjust const if wrapping appears.
2. [ ] Decide if All L1 page count feels long and needs a mid drill checkpoint in a later spec.
3. [ ] Enroll a scope row for this enhancement so status mirrors the build.
