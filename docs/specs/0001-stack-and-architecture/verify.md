# Verify: stack and architecture · spec 0001 · updated 2026-09-11

_Steps derived from spec 0001 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual

- [x] Run `npm run tauri dev` → window titled Typeshala opens showing heading Typeshala plus one line → AC-2

## Commands

- [x] `npm run build` → green typecheck plus web bundle → AC-3
- [x] Open `docs/specs/0001-stack-and-architecture/index.md` → Status line plus Proposed stack table present → AC-1

## Acceptance-criteria coverage

- AC-1 stack decision lives in a spec, covered by Commands step 2 · AC-2 empty scaffold boots locally, covered by UI step 1 · AC-3 scaffold passes build, covered by Commands step 1
