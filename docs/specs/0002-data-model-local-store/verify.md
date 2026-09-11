# Verify: data model local store · spec 0002 · updated 2026-09-12
_Steps derived from spec 0002 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._
## UI / manual
- [ ] Fresh run with no store file → settings load as defaults, progress shows empty history → AC-3, AC-4
- [ ] Save an attempt, restart the app → attempt plus settings load back unchanged → AC-1, AC-3
- [x] Corrupt `typeshala.json` by hand, start the app → boots on defaults with empty history, bad file renamed to a `.bak` backup → AC-4
## Commands
- [x] `cargo test --lib -p typeshala` → 9 passed (pure units plus one serial end to end over the real store plugin) → AC-1, AC-2, AC-3, AC-4, AC-5
- [x] `npx vitest run` → all passed → AC-1, AC-3
- [x] `npx tsc --noEmit` plus `npx eslint .` → clean → build health
- [x] `load_lessons` → 3 lessons ordered by `order`; `get_lesson` with a bad id → `not-found` → AC-2
- [x] `save_result` with a bad payload (empty lesson, zero duration, accuracy over 100) → `validation-failed`, nothing stored → AC-1
- [x] `get_progress` filtered by lesson and layout, then unfiltered → attempts plus derived bests match → AC-1, AC-5
- [x] `save_settings` partial patch → merged over current, unknown fields dropped, out of range prompt size ignored → AC-3
- [x] `save_result` with an unknown lesson id → `not-found` → AC-1
## Acceptance-criteria coverage
- AC-1 covered by save/restart step, bad payload step, unknown lesson step, `cargo test`, `vitest`
- AC-2 covered by `load_lessons`/`get_lesson` step, bundled lessons test
- AC-3 covered by fresh run step, restart step, `save_settings` patch step
- AC-4 covered by corrupt file step
- AC-5 covered by `get_progress` filter step
