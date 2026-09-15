# Verify: Nepali Traditional Preeti layout · spec 0007 · updated 2026-09-15

_Steps derived from spec 0007 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual

- [x] Open the picker and choose Traditional beside English plus Romanized → three way switch visible → AC-1
- [x] Read the Traditional lesson list → five lessons grouped simple to matra to conjunct in fixed order, first open and rest locked → AC-1
- [x] Open `nt-vowels` → large Devanagari prompt with live WPM plus accuracy → AC-2
- [x] Type the first unit with Preeti keys → unit colors right or wrong per unit, lit key plus full sequence hint update → AC-2, AC-3
- [x] Open `nt-conjunct` → `क्ष` shows as one block with hint `]kS` and `]` lit → AC-2, AC-3
- [x] Type a wrong unit → one error hit in accuracy, backspace fixes it, pending keys count nothing → AC-5
- [x] Finish a lesson → result summary plus next lesson button, attempt saved with layout traditional → AC-4
- [x] Restart the app → per lesson bests kept, next lesson unlocked → AC-4
- [x] Switch UI to Nepali → Traditional labels read in Nepali with no blanks → AC-6
- [x] Empty catalog plus save fail plus corrupt store → friendly text with retry in the active language, first lesson still opens → AC-6

## Commands

- [x] `npx tsc --noEmit` → clean → AC-2
- [x] `npx vitest run` → green → AC-2, AC-5
- [x] `cargo test` → green including bundled lesson parse → AC-1

## Acceptance-criteria coverage

- AC-1 … covered by steps 1, 2 and the cargo step
- AC-2 … covered by steps 3, 4, 5 and the tsc plus vitest steps
- AC-3 … covered by steps 4, 5
- AC-4 … covered by steps 6, 7
- AC-5 … covered by step 6 and the vitest step
- AC-6 … covered by steps 9, 10
