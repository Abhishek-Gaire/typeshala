# 0010. Bonus Ramayana game

**Date**: 2026-09-15
**Status**: Accepted

## Summary

This spec adds a Ramayana themed falling words game beside the tutor you already use. You start the game, type falling words in time to clear them, and see score plus lives plus level. It means fun practice with zero effect on lessons, built from your own code with openly licensed art only.

## Context

See `rationale.md`.

## Requirements

**User stories**:
* As a learner, I want to start a falling words game and type words in time so that practice feels like play.
* As a learner, I want game scores kept apart from lessons so that play never harms progress.

**Acceptance criteria**:
* **AC-1**: Game starts from nav, words fall in time, you type shown words to clear them before they land.
* **AC-2**: Score plus lives plus level show live, speed rises as you clear, miss lowers lives, zero lives ends the run.
* **AC-3**: Game uses qwerty plus Romanized word lists from bundled `Lesson.prompt` text in this slice, Traditional off, words plain and readable at large size. Word cleaning rule: split prompt on `[^A-Za-z\u0900-\u097F]+`, drop tokens shorter than 2, dedupe, shuffle.
* **AC-4**: Game end shows score with restart plus quit, game scores never touch lesson bests or unlocks, no attempt saved.
* **AC-5**: Pause plus restart plus quit by keyboard with visible focus, friendly states in active language, all local with no network call.

## Decision

**Chosen option**: Option 1: Local React loop with bundled words and no new deps

The game runs as local React state on bundled words with plain visuals and transient scores.

**Implementation skills**: `vercel-react-best-practices` (`vercel-labs/agent-skills`, `.agents/skills/vercel-react-best-practices/`) · `typescript-advanced-types` (`wshobson/agents`, `.agents/skills/typescript-advanced-types/`) · `tailwindcss` (`hairyf/skills`, `.agents/skills/tailwindcss/`)

## Rationale

See `rationale.md` for context, options, and reasoning.

## Feature design

**Data model sketch**:
* GameWord (transient, not saved): id (req), text (req, cleaned token from `Lesson.prompt`), x (req, lane pos), y (req, fall pos), speed (req, px per second)
* GameState (transient): phase (idle or active or paused or done), score (number), lives (number, starts 3), level (number, starts 1), cleared (number), missed (number)
* WordList (derived, read only): cleaned tokens from `en-qwerty.json` (`layout qwerty`) plus `ne-romanized.json` (`layout romanized`), Traditional excluded in this slice
* Typing match rule: buffer grows per keystroke, backspace edits buffer, match is case insensitive for qwerty and exact for Devanagari, word clears on full match with no trailing key needed, no romanize transliteration step in this slice, Romanized words typed as shown Unicode
* Timing rule: start fall 40 px per second plus 10 percent per level, level every 8 clears, max 3 concurrent words, spawn interval 1.5 seconds
* No Attempt written, no BestScore touched

**State transitions**:
* Game: idle to active on start, active to paused on pause and back on resume, active to done on zero lives or quit, done to idle on restart or quit to nav. Score derives from cleared plus level, speed rises per level.

**API surface**:
| Endpoint | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `load_lessons` | command | `layout: LayoutId` (opt, `qwerty` or `romanized` or `traditional`) | `Lesson[]` for word lists | none, local | missing bundle file |
| `startGame` | pure domain | `words: string[]` (req), level | initial `GameState` plus spawned `GameWord[]` | local only | empty word list |
| `tickGame` | pure domain | `state plus words plus elapsed` | moved words plus hits plus misses | local only | none |
| `typeGame` | pure domain | `state plus buffer plus key` | cleared word or miss | local only | none |

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| Start game | Falling words with positions plus speeds | derived from bundled lesson vocab via `load_lessons`, spawn in `startGame` |
| Typing | Cleared word plus updated score | typed buffer matched in `typeGame` vs shown `GameWord.text` |
| Tick | Moved words plus lives plus level | elapsed time in `tickGame`, level from cleared count |
| End run | Final score plus best run in session | derived from `GameState` at done, kept in memory only |
| Nav plus pause | Pause plus restart plus quit targets | fourth button in the `role=navigation` row in `App.tsx` plus new `View { name: "game" }`, quit returns to picker, keyboard handlers |
| Empty plus error | Friendly text with retry | view strings in active language from `src/i18n/` via `t()` with English fallback, new keys `game.start`, `game.pause`, `game.resume`, `game.restart`, `game.quit`, `game.score`, `game.lives`, `game.level`, `game.over`, `game.best` |

**Key invariants**:
* Game state stays transient in React, never written to lesson store, game view must not import `saveResult`
* Game scores never feed `deriveBests` or unlock selectors
* Words come only from bundled `Lesson.prompt` text in this slice, no remote fetch
* Tick uses elapsed time not tick count so speed stays fair on slow machines
* Pause stops spawn plus fall, quit clears buffer
* Game is muted in this slice, sound setting reuse waits for the polish follow up

**Security model**:
Local single user app, no roles, no remote calls. Game reads bundled lessons only. No sensitive data.

**Configuration required**:
Omitted, no new env vars or credentials needed.

**Critical test scenarios**:
* Happy path: start game, type falling words to clear them, see score plus level rise, verifies **AC-1**, **AC-2**
* Miss path: let words land to lose lives to zero and see end screen with restart, verifies **AC-2**, **AC-4**
* Isolation: play game then open lessons and see bests plus unlocks unchanged, verifies **AC-4**
* Keyboard path: start plus pause plus restart plus quit all by keyboard with visible focus, verifies **AC-5**

## Build plan

1. Add domain game state plus spawn plus tick plus typing match from bundled vocab, satisfies **AC-1**, **AC-2**, **AC-3**
2. Add game view with falling words plus live score plus lives plus level on tokens, satisfies **AC-1**, **AC-2**
3. Wire start plus pause plus restart plus quit plus end screen with transient score, keep lesson store untouched, satisfies **AC-4**, **AC-5**
4. Add nav entry plus empty plus error states in active language with keyboard focus, satisfies **AC-5**

## Consequences

**Positive**:
* Playful practice with no risk to lesson truth
* Vocab reuse keeps practice transfer high with no new content pipeline

**Negative / tradeoffs**:
* Visuals stay plain in this slice, no rich art scenes
* Traditional words wait for a later slice after Preeti proves stable

**Neutral**:
* Game lives in its own feature folder so lessons stay clean

## Follow-up

* [ ] Add Traditional words only after Preeti lessons prove stable
* [ ] Add art plus sound polish only with openly licensed assets and a vet note
