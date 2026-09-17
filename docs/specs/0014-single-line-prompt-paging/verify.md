# Verify: single line prompt paging · spec 0014 · updated 2026-09-17

_Steps derived from spec 0014 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual

- [x] Open Home English Level 1 → only page 1 visible with no counter row → AC-1
- [x] Type across a page edge → slide to next page, groups like `aaa` never split → AC-2, AC-3
- [x] Backspace at a page start → prior page returns with chars kept; Restart → page 1 → AC-4
- [x] Finish a full drill → result saved, live speed plus red key tracked throughout → AC-4
- [x] Switch flags mid drill → same page logic with swapped glyphs; full drill by keyboard only with visible focus → AC-5
- [x] OS reduced motion on → page change swaps instantly with no slide → AC-3

## Commands

- [x] `npm test` → green, paging unit plus component tests pass → AC-1, AC-2
- [x] `npm run typecheck` → clean → AC-1, AC-2, AC-3, AC-4, AC-5
- [x] `npm run lint` → clean → AC-1, AC-2, AC-3, AC-4, AC-5
- [x] `npm run build` → succeeds → AC-1, AC-2, AC-3, AC-4, AC-5

## Acceptance-criteria coverage

- AC-1 … covered by steps 1, 7 · AC-2 … covered by steps 2, 7 · AC-3 … covered by steps 2, 6, 8 · AC-4 … covered by steps 3, 4 · AC-5 … covered by step 5
