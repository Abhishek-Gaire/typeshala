# 0018 map correction

## Summary

This child corrects five rows of the runtime Preeti map to genuine values. E becomes half `भ` and W becomes half `ध`, the `ो` and `ौ` marks move to two press sequences, and full `ङ` moves to the comma key. Short rationale: unanimous external authority plus zero lesson edits made any half move indefensible.

## Requirements

- **AC-1**: Pressing E commits half `भ` and pressing W commits half `ध`, shown by unit tests on the buffer engine plus reverse lookup tests.
- **AC-2**: Pressing `f` then `]` commits the `ो` mark and `f` then `}` commits the `ौ` mark, shown by unit tests; the word `नौ` in `nt-common-words-c` becomes completable.
- **AC-3**: Pressing comma commits full `ङ`, shown by unit tests; the alphabet row and the `ङङङ` drills need zero edits and keep passing.
- **AC-4**: Pressing `f` stays pending only while it composes `ो` or `ौ`; when `ा` is the expected unit the press settles it at once, shown by a session test.
- **AC-5**: Reverse lookup returns E for half `भ`, W for half `ध`, `f]` for `ो`, `f}` for `ौ`, and comma for `ङ`.
- **AC-6**: The differences note no longer calls the old values canonical, and the chart W row carries an ambiguity note pointing at the Shuvayatra mirror instead of a silent rewrite.

## Decision

**Chosen option**: Adopt Shuvayatra values with comma home for full `ङ`.

Exact table changes in `src/domain/preeti.ts`, old value to new value: E from `ो` to half `भ`; W from `ङ` to half `ध`; add `f]` to `ो`; add `f}` to `ौ`; add comma to `ङ`. Lowercase letters stay untouched. The header note gains one line recording the two press composed vowels as data, matching the existing composed long vowel pattern.

**Implementation skills**: `typescript-advanced-types` (`wshobson/agents`, `.agents/skills/typescript-advanced-types/`)

## Feature design

**Data model sketch**:

PreetiMap stays a read only record of sequence to unit. Changed rows: E, W. Added rows: `f]`, `f}`, comma. No schema change, no stored shape change, attempts keep working since they store Devanagari plus lesson id.

**State transitions**:

None. The buffer engine is unchanged; only table values differ, plus two new extendable prefixes (`f]` under `f`, `f}` under `f`) that resolve through the proven pending buffer and exact commit path.

**API surface**:

| Endpoint            | Method      | Key inputs              | Key outputs                                          | Auth       | Key errors                  |
| ------------------- | ----------- | ----------------------- | ---------------------------------------------------- | ---------- | --------------------------- |
| `advancePreeti`     | pure domain | buffer (req), key (req) | commits plus buffer plus error flag, unchanged shape | local only | unknown sequence, unchanged |
| `sequenceForPreeti` | pure domain | Devanagari unit (req)   | sequence string, new values per AC-5                 | local only | none                        |
| `exactCommitPreeti` | pure domain | buffer (req)            | unit or null, unchanged                              | local only | none                        |

**Value sourcing**:

| Action              | Value produced / displayed      | Source                                      |
| ------------------- | ------------------------------- | ------------------------------------------- |
| Typing keystroke    | Committed Devanagari unit       | `advancePreeti` over the corrected table    |
| Typing view         | Lit key plus full sequence hint | `sequenceForPreeti` on the next prompt unit |
| Space or prompt end | Flushed pending unit            | `exactCommitPreeti` on the buffer           |

**Key invariants**:

- One sequence per unit holds; no unit gains a second key.
- Lowercase rows are byte identical before and after.
- No Alt code or extended Latin rows are added.

**Security model**:

Local single user app, unchanged from spec 0007. No new reads, writes, or calls.

**Configuration required**:

Omitted, no new env vars or credentials needed.

**Critical test scenarios**:

- Happy path: type half `भ` with E and half `ध` with W in a scratch prompt, verifies **AC-1**.
- Failure case: press `f` then a non matching key resolves `ा` first without counting a spurious error, verifies **AC-4**.
- Regression: type the alphabet row and `नौ` end to end with new sequences, verifies **AC-2**, **AC-3**.

## Build plan

1. Edit the five map rows plus the header note in `src/domain/preeti.ts`, satisfies **AC-1**, **AC-2**, **AC-3**, **AC-5**.
2. Update and extend map unit tests for new values, reverse lookups, and the `f` pending settle, satisfies **AC-1**, **AC-2**, **AC-4**, **AC-5**.
3. Update the differences note table plus the canonical claim, annotate the chart W row, satisfies **AC-6**.
4. Run lint, format check, typecheck, and the full suite, satisfies all ACs.

## Consequences

**Positive**:

- Every key matches genuine Preeti, so trained typists get what they expect.
- Hints and lit keys correct themselves with no view edits.

**Negative / tradeoffs**:

- Returning learners retrain E and W reflexes.
- The `f` key carries a second meaning while composing `ो` and `ौ`; `ा` itself still settles on one press.

**Neutral**:

- Rollback is a single commit revert.
- The drill snapshot is untouched.

## Follow-up

- [ ] The chart `S` row likely carries the same misread as W and deserves a review pass outside this spec.
