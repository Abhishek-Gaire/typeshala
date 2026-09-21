# 0018 lesson coverage

## Summary

This child appends three Traditional lessons covering the 15 supported units no prompt exercises today, and removes the punctuation lesson that cannot be completed. Short rationale: appending keeps progression positional so existing attempts stay valid, and deleting the broken lesson restores the promise that every shipped prompt is typeable.

## Requirements

- **AC-1**: Three lessons ship at orders 25, 26, and 27 with ids `nt-marks-2`, `nt-halant-row`, and `nt-clusters-2`, and their prompts jointly contain all 15 Category A units: `ऋ अः ः ञ् ख् ग् च् ण् थ् ब् व् त्त क्त द्ध द्द`.
- **AC-2**: A programmatic test proves every prompt unit in the three lessons resolves to a map sequence.
- **AC-3**: The `nt-punctuation` entry is removed; unlock order stays intact since progression is positional; no other prompt or order is touched.
- **AC-4**: New prompts hold Devanagari plus spacing only, keeping the existing no ASCII letters check green.

## Decision

**Chosen option**: Append dedicated lessons, remove the broken one.

New lessons go at the end of traditional order where positional unlocking absorbs them with no migration. The punctuation lesson goes out by deletion since no rewrite can serve ASCII punctuation practice under this map.

**Implementation skills**: `typescript-advanced-types` (`wshobson/agents`, `.agents/skills/typescript-advanced-types/`)

## Feature design

**Data model sketch**:

Lesson shape reused verbatim from spec 0007, no schema change. New rows, all layout traditional:

1. `nt-marks-2`, order 25, level matra, required units `ऋ अः ः ञ्`, short tokens in drill style.
2. `nt-halant-row`, order 26, level conjunct, required units `ख् ग् च् ण् थ् ब् व्`, triple repeat drill style mirroring the existing row drills.
3. `nt-clusters-2`, order 27, level conjunct, required units `त्त क्त द्ध द्द`, carrier words required (suggested carriers: words built on these clusters such as the common nouns for address leaf, devotee, Buddha, and mattress; build finalizes exact strings and the coverage test enforces the units).

Level values reuse the existing display vocabulary only; level carries no cross lesson logic.

**State transitions**:

None. Unlocking stays positional per the progression selectors: each lesson opens when the previous in display order is done.

**API surface**:

| Endpoint       | Method  | Key inputs               | Key outputs                                                     | Auth        | Key errors                     |
| -------------- | ------- | ------------------------ | --------------------------------------------------------------- | ----------- | ------------------------------ |
| `load_lessons` | command | layout traditional (opt) | lesson list including the three new rows, minus the removed one | none, local | missing bundle file, unchanged |

**Value sourcing**:

| Action         | Value produced / displayed                | Source                                                           |
| -------------- | ----------------------------------------- | ---------------------------------------------------------------- |
| Open picker    | Traditional lesson list with the new tail | bundled `ne-traditional.json` filtered by layout                 |
| Unlock state   | Open or locked per lesson                 | positional progression over saved attempts, decided in spec 0005 |
| Typing session | Per unit correctness                      | map sequences from the corrected table in the sibling child      |

**Key invariants**:

- Append only: shipped prompts and orders 1 to 12 plus 14 to 24 stay byte identical.
- Every new prompt unit resolves to exactly one map sequence; the lesson test allowlist trims to units still present in shipped prompts.
- Old attempts pointing at the removed id match no lesson and display nowhere; progression ignores them.

**Security model**:

Local single user app, unchanged from spec 0007.

**Configuration required**:

Omitted, no new env vars or credentials needed.

**Critical test scenarios**:

- Happy path: type each new lesson end to end with map sequences, verifies **AC-1**, **AC-2**.
- Failure case: a saved attempt for the removed lesson id is ignored by progression, never a crash, verifies **AC-3**.
- Regression: full suite plus the no ASCII letters check green with the gap at order 13, verifies **AC-3**, **AC-4**.

## Build plan

1. Append the three lessons with required unit sets in drill style prose, satisfies **AC-1**, **AC-4**.
2. Remove the `nt-punctuation` entry, satisfies **AC-3**.
3. Extend the lesson tests with the programmatic coverage check plus a progression test over the order gap, and trim the unmapped unit allowlist, satisfies **AC-2**, **AC-3**.
4. Run lint, format check, typecheck, and the full suite, satisfies all ACs.

## Consequences

**Positive**:

- The 15 gaps close and the course tail teaches Shift skills plus common clusters.
- The course no longer ships a lesson nobody can finish.

**Negative / tradeoffs**:

- Three more lessons to maintain on every future map change.
- Anyone mid course sees three new locked lessons appear at the tail.

**Neutral**:

- Orders run 1 to 12 then 14 to 27; the gap is permanent and harmless under positional unlocking.
- Users with the removed lesson done keep the best entry inertly; it matches no lesson and displays nowhere.
