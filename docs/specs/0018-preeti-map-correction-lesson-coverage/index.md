# 0018. Preeti map correction and lesson coverage

**Date**: 2026-09-21
**Status**: Accepted

## Summary

Your Traditional map puts two keys in the wrong place and your course never drills 15 units the map already supports. This spec corrects E and W to genuine Preeti values, gives full ङ and the ो mark homes that need no special keys, appends three lessons covering the undrilled units, and removes one punctuation lesson that cannot be completed today. Hints and lit keys follow the map on their own, so views need no changes. Terms used below: matra (a vowel sign that shapes with a consonant), conjunct (joined letters typed as one unit), halant (the ् mark that joins letters).

## Structure

1. `0018-map-correction.md`: corrects the runtime map to Shuvayatra values and updates the reference notes. Supports the map values decision.
2. `0018-lesson-coverage.md`: appends three lessons for the undrilled units and removes the broken punctuation lesson. Supports the course completeness decision.

Cross child contract, binding on both children:

1. The map child merges first. The lessons child writes tests against the corrected map.
2. The one sequence per unit rule from spec 0007 holds across both children. No unit gains two keys.
3. Neither child changes drills, snapshots, the stored schema, or any API signature.
4. Reference doc updates ride with the map child only.

## Requirements

Shared acceptance criteria, checked across both children:

- **S1**: Every Devanagari unit in every shipped Traditional prompt resolves to exactly one sequence in `PREETI_MAP`. Spacing and ASCII punctuation keep the existing test allowlist exception.
- **S2**: Hint and lit key output always equals the map with no view code changes.
- **S3**: Lint, format check, typecheck, and the full suite pass with new tests included.

## Decision

**Chosen option**: Umbrella split, one map child plus one lessons child.

The two workstreams verify independently and either can ship first, with the map child recommended first since lesson tests assume corrected values.

**Implementation skills**: `typescript-advanced-types` (`wshobson/agents`, `.agents/skills/typescript-advanced-types/`)

## Rationale

Reasoning and options: see `rationale.md` beside this file.

## Build plan

Skateboard ordering (thinnest usable whole first, then grow): the map correction alone leaves a working tutor, the lessons grow it after.

1. Build `0018-map-correction.md` first, satisfies **S1** for map values and **S2**.
2. Build `0018-lesson-coverage.md` second, satisfies **S1** for prompts.
3. Run the full suite plus format check across both, satisfies **S3**.

## Consequences

**Positive**:

- Learners train genuine Preeti muscle memory on every key.
- The word `नौ` in `nt-common-words-c` becomes completable through the new `f}` sequence.
- Every shipped prompt becomes typeable, so the course keeps its core promise.

**Negative / tradeoffs**:

- Returning learners retrain E and W reflexes, with hints guiding the new positions.
- The `f` key now buffers while it composes `ो` or `ौ`, and settles `ा` on the same press when that is the expected unit, so the common path feels unchanged.

**Neutral**:

- Revert is a single commit revert with no stored data to repair.
- The classic drill snapshot is untouched since drills never emit the changed units.

## Follow-up

- [ ] Enroll a scope row for 0018 so status mirrors the build lifecycle (spec stays Proposed until linked).
- [ ] Review the chart `S` row and the `X`, `N`, `i`, `I` reference rows in a later step; all look like misreads or gaps in the transcription and sit outside this spec.
- [ ] Shift key drill groups stay deferred; Category A covers the units through lessons only by explicit scope choice.
