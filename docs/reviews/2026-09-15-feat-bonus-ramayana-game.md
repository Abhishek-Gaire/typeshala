# Review, feat/bonus-ramayana-game, 2026-09-15

**Reviewed by**: muse-spark (author on other-model)
**Scope**: 11 files, branch vs main
**Verdict**: Changes requested

## Summary

Adds a transient falling-words game (domain `src/domain/game.ts` + `GameView` + nav wiring) per spec 0010. Code is cleanly layered, well tested (domain + component), and tsc is clean. One real input-handling bug (global key capture breaks Space-button interaction and pollutes the buffer) plus a few small domain-robustness issues need fixing.

## Major

### 🟠 Global key handler swallows Space and pollutes buffer, `src/features/game/GameView.tsx:40`

**Problem**: `onKey` captures every `e.key.length === 1` key globally and calls `preventDefault()`. The Space key (`" "`) is appended to the match buffer, so it can never match a word (tokens contain no spaces) and it blocks native Space-button activation when focus is on Pause/Restart/Quit.
**Why it matters**: Keyboard-only users (AC-5) lose Space-to-activate on focused buttons, and the buffer accumulates junk characters that make clearing words harder than designed.
**Suggested fix**: Ignore `" "` (and other non-word keys) in the handler — only forward keys matching the word alphabet / Backspace — and skip handling when the event target is a button and the key is Space or Enter.

## Minor

### 🟡 Stale buffer survives landed words, `src/domain/game.ts:95`

**Problem**: `tickGame` removes landed words but keeps `state.buffer`, so a partial buffer typed toward a now-missed word carries over and can false-match or block the next word.
**Why it matters**: Minor gameplay correctness; a miss should reset the attempt toward that word.
**Suggested fix**: Clear or trim `buffer` when one or more words land, and cover with a domain test.

### 🟡 `tickGame` can spawn empty-text words, `src/domain/game.ts:82`

**Problem**: `spawnWord` indexes `words[...]` with no empty guard (`?? ""`); `tickGame(s, [], …)` spawns an un-clearable `""` word. Only guarded upstream by the view's empty state.
**Why it matters**: Domain claims pure/safe; an empty word list at tick time silently corrupts the run instead of ending or no-op-ing.
**Suggested fix**: Skip spawning when `words.length === 0`.

### 🟡 Impure randomness in "pure" domain, `src/domain/game.ts:80`

**Problem**: Module-level `wordSeq` plus `Math.random()` inside `spawnWord` contradict the spec's "pure domain" API and make runs untestable/seedy.
**Why it matters**: Maintainability and test determinism; layer rule says domain is pure logic.
**Suggested fix**: Inject an `rng: () => number` parameter (default `Math.random`) and derive ids from state (e.g. `elapsedMs` + word count) or accept the impurity with a comment.

### 🟡 Retroactive score formula, `src/domain/game.ts:152`

**Problem**: `score = cleared * 10 * level` recomputes the whole history at the new level, so clearing the 8th word jumps score from 70 to 160 rather than awarding incrementally.
**Why it matters**: AC-2 says "score derives from cleared plus level" so arguably per-spec, but the jump feels like a bug to players.
**Suggested fix**: Confirm intended formula with spec owner; otherwise use incremental `score + 10 * level`.

### 🟡 No loading state for game word fetch, `src/App.tsx:69`

**Problem**: `gamePrompts` starts `[]`, so `GameView` briefly renders `state.empty` while `loadLessons()` is in flight, then swaps to Start.
**Why it matters**: Flicker plus a confusing empty flash on every game entry, worse on slow machines.
**Suggested fix**: Track a `gameLoading` flag and render a loading state until the fetch resolves.

## Nits

- ⚪ `src/domain/game.ts:83`, redundant `% words.length` after `Math.floor(Math.random() * words.length)`
- ⚪ `src/domain/game.ts:48`, `eslint-disable no-misleading-character-class` without explaining why the class is safe
- ⚪ `src/features/game/GameView.tsx:137`, `String(...)` wrappers inside template literals are unnecessary
- ⚪ `src/i18n/en.json:62`, `game.best` key added but never rendered (spec's "best run in session" is not implemented — either wire it or drop the key)

## Strengths

- Domain/view separation is exemplary: zero store imports in game code, transient state only, lesson isolation verifiable by grep.
- Elapsed-time tick with 100ms clamp is the right fairness call for slow machines, and it's directly tested.
- Test suite covers happy path, miss-to-done, backspace, case-insensitivity, and keyboard pause/quit paths.

## Test coverage

Covered: cleanWords (punctuation, dedupe, Devanagari), start/empty-throw, full-match clear + scoring, case-insensitive qwerty, backspace, level-up, elapsed-move, life loss, done-at-zero, view start/pause/resume/quit/restart/typing/focus. Gaps: stale-buffer-on-miss, empty-list tick spawn, Space-key behavior — all flagged above. `npx tsc --noEmit` clean (verified this review).
