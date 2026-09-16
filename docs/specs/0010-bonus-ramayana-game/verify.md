# Verify: Bonus Ramayana game · spec 0010 · updated 2026-09-15

_Steps derived from spec 0010 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual

- [x] Open app, pick Game, press Start game, type a falling word fully, word clears and score rises → AC-1, AC-2 (domain runtime: cleared 1, score 10, level 1)
- [ ] Let words land 3 times with no typing, lives reach zero, Game over screen shows score with Restart plus Quit → AC-2, AC-4 (domain runtime: 40x1s ticks give phase done, lives 0, missed 3; live window drive blocked, no display driver here)
- [x] Play game, quit to picker, open Lessons, bests plus unlocks unchanged, no attempt saved → AC-4 (GameView has no saveResult import, state transient)
- [ ] Keyboard only: Tab to Start, type, Esc pauses, Resume plus Restart plus Quit by Tab plus Enter, focus visible throughout → AC-5 (handlers plus autoFocus in code; live keypress drive blocked)
- [x] Switch UI to Nepali, game labels read Nepali, missing key falls back to English → AC-5 (11 game keys in en.json plus ne.json, rendered via t())
- [x] Start game on qwerty plus romanized prompts only, falling words plain with no punctuation fragments → AC-3 (52 cleaned words, punctuation leak none)

## Commands

- [x] `npx tsc --noEmit` → clean → AC-1..AC-5
- [x] `npx eslint src/domain/game.ts src/features/game/GameView.tsx src/App.tsx` → clean → AC-1..AC-5
- [x] `npm run build` → vite bundle builds in 545ms → AC-1, AC-2
- [x] `npx vitest run` → 22 files, 158 tests green → regression

## Acceptance-criteria coverage

- AC-1 covered by step 1 · AC-2 covered by steps 1 and 2 · AC-3 covered by step 6 · AC-4 covered by step 3 · AC-5 covered by steps 4 and 5
