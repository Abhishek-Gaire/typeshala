# 0019. Cross row groups for All level 1 and 2 drills

**Date**: 2026-09-21
**Status**: Accepted

## Summary

The All screen currently replays Home, Top and Bottom groups, so the review teaches no new motion. This spec gives All level 1 and 2 their own cross row groups in both layouts: finger columns in English, mixed row combos in Traditional. Row local rows and All level 3 sentences stay exactly as they are.

## Context

The All screen is the final review of each level, but its level 1 and 2 prompts are borrowed. English All level 1 concatenates the three row pair sets, and All level 2 samples one window per hand per row. Traditional All level 1 concatenates 14 pairs, and All level 2 samples 6 groups. A learner therefore retypes groups already drilled on the row screens, in the same shape, so the screen adds length without adding skill. The engineer asked for All to stop reusing row content and approved a cross row rule for level 1 and 2 in both layouts. Without a recorded rule the builder would invent groupings and scores plus specs would drift again.

## Requirements

**User stories**:

- As a learner, I want All level 1 pairs to mix keys across rows so that the review teaches new finger motion.
- As a learner, I want All level 2 triples to span rows inside one token so that I practice row jumps.
- As a learner, I want steady drill length so that each row feels like the same amount of practice.

**Acceptance criteria**:

- **AC-1**: English All level 1 holds 20 vertical pairs, top with home and home with bottom per finger column, each member tripled, each pair group emitted 10 times, 400 tokens in total. No group equals a Home, Top or Bottom level 1 group.
- **AC-2**: English All level 2 holds 10 finger column triples, top then home then bottom of the same finger, each a single token, each emitted 10 times, 100 tokens in total. Every token holds 3 distinct chars with zero back to back repeats across the joined prompt.
- **AC-3**: Traditional All level 1 holds 9 cross row pair tokens, 5 Home with Top and 4 Home with Bottom, each emitted 30 times, 270 tokens in total. No group equals a row local level 1 group.
- **AC-4**: Traditional All level 2 holds 9 cross row triple tokens mixing rows, each emitted 10 times, 90 tokens in total. Every unit has a Preeti key sequence, matras appear only in real combos with no standalone i matra, zero back to back repeats across the joined prompt.
- **AC-5**: Row ids, order, layout, title, category and difficulty stay unchanged on the four All rows. Only prompt text changes, so saved progress keeps working.
- **AC-6**: Row local rows and All level 3 rows in both layouts are byte for byte untouched.
- **AC-7**: `lintClassicDrills` passes on all 24 rows. The snapshot update is deliberate and reviewed token by token.
- **AC-8**: Spec 0017 carries a note that its All level 1 and 2 content is superseded by this spec, and spec 0015 points at this spec for those rows.

## Options considered

### Option 1: Cross row columns and combos (chosen)

English All groups derive from the finger columns of `CLASSIC_KEYS`: pairs for level 1, triples for level 2. Traditional All groups are authored cross row combos, each validated by script for typeability, matra shape and the repeat rule.

**Pros**:

- All teaches motion no row screen teaches, which answers the complaint directly
- English content stays generated from geometry, so future fixes stay small
- Deterministic prompts keep the snapshot drift guard meaningful

**Cons**:

- English All level 1 grows from 300 to 400 tokens, a longer single drill
- Past best scores on the four rows stop comparing to the new drills (ids and history are kept)
- Traditional content is authored, not generated, so review needs a Nepali reader

### Option 2: Keep the borrowed content

Leave the four All rows exactly as spec 0017 defines them. Zero work and zero score disruption.

**Pros**:

- No code change, no test churn, no score reset

**Cons**:

- The complaint stands: All stays a remix that teaches nothing new

### Option 3: Random cross row sampling

Sample random triples from the All key set at module load.

**Pros**:

- Fresh content on every load

**Cons**:

- Nondeterministic prompts break repeatability and the snapshot guard
- Random joins can breach the no repeat rule or purity, needing filters that add complexity for no gain

## Decision

**Chosen option**: Option 1: Cross row columns and combos

All level 1 and 2 prompts mix rows in both layouts, generated from finger columns in English and authored plus validated in Traditional.

**Implementation skills**: `typescript-advanced-types` (`wshobson/agents`, `.agents/skills/typescript-advanced-types/`)

## Rationale

The forces from Context are a stale review screen and a builder with no rule. Option 2 keeps the staleness. Option 3 trades one drift source for a worse one, since nondeterminism voids the snapshot guard that spec 0017 built. Option 1 answers the complaint with the smallest mechanism change: English reuse of the column geometry the keyboard already paints, Traditional reuse of the author plus validate loop that produced the All level 3 sentences. The 400 token All level 1 length is accepted because level 1 is the basics drill and the row stays a single steady session.

## Feature design

**Data model sketch**:

- `DrillSpec`, `CLASSIC_KEYS`, `Lesson`: unchanged shapes. Only `groups` and `repeat` inputs change on four rows.
- Generators (new, pure, `src/domain/drillPattern.ts`): `columnTriples()` returns the 10 finger column triples in order; `columnPairs()` returns the 20 vertical pairs in column order, members tripled.
- `englishGroups("all", 1)` returns `columnPairs()`; `englishGroups("all", 2)` returns `columnTriples()`. Row local branches are untouched.
- Traditional tables (explicit data, `src/domain/classicDrills.ts`): 9 pair tokens for All level 1 and 9 triple tokens for All level 2, listed below.
- `repeat` stays 10 for both English All rows, 30 for Traditional All level 1, 10 for Traditional All level 2.

English All level 1 pairs, in order, each emitted 10 times:

`qqq aaa`, `aaa zzz`, `www sss`, `sss xxx`, `eee ddd`, `ddd ccc`, `rrr fff`, `fff vvv`, `ttt ggg`, `ggg bbb`, `yyy hhh`, `hhh nnn`, `uuu jjj`, `jjj mmm`, `iii kkk`, `kkk ,,,`, `ooo lll`, `lll ...`, `ppp ;;;`, `;;; ///`

English All level 2 triples, in order, each emitted 10 times:

`qaz`, `wsx`, `edc`, `rfv`, `tgb`, `yhn`, `ujm`, `ik,`, `ol.`, `p;/`

Traditional All level 1 pair tokens, in order, each emitted 30 times:

`बसत्रउ`, `किधय`, `मपभई`, `वाचग`, `नजतथ`, `बसशर`, `किह।`, `मपखप`, `वादल`

Traditional All level 2 triple tokens, in order, each emitted 10 times:

`बसित्र`, `किमच`, `वानश`, `त्रबस`, `धयख`, `भईद`, `शहम`, `खपत`, `दलक`

**State transitions**: none. The drill state machine from spec 0012 is untouched.

**API surface**:

| Surface | Kind | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `columnPairs` | pure domain (new) | none | `string[][]`, 20 pair groups | local only | none |
| `columnTriples` | pure domain (new) | none | `string[][]`, 10 triple groups | local only | none |
| `englishGroups` | pure domain (extended) | `category`, `difficulty` | `string[][]` | local only | throws on unknown difficulty |
| `buildPrompt` | pure domain (unchanged) | `groups`, `repeat` | `string` | local only | throws on invalid rule |
| `lintClassicDrills` | pure domain (unchanged) | `rows` (opt) | failing row ids | local only | none |
| `ALL_CLASSIC_DRILLS` | pure domain constant (unchanged) | none | `Lesson[]` | local only | none |

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Open All level 1 or 2 | Prompt text | `buildPrompt` over the groups above, computed at module load into `Lesson.prompt`, read through `lessonsForClassic` |
| Lint check | Pass or fail per row | `lintClassicDrills` over `ALL_CLASSIC_DRILLS` |
| Drift guard | Expected prompt strings | snapshot test over `ALL_CLASSIC_DRILLS` |
| Typing session | Lit key plus live speed | unchanged derivations from spec 0012, `codeForNextUnit` |

**Key invariants**:

- Row ids, layouts, titles, orders, categories and difficulties never change. Prompt text is the only derived field.
- Level 1 rows may repeat a unit back to back. Level 2 rows never do, enforced by `lintClassicDrills`.
- Every English All level 1 and 2 token holds only All key set chars.
- Every Traditional All unit has a Preeti key sequence, matras appear only in real combos.
- Generation stays deterministic. The same rule always yields the same prompt.

**Security model**: local single user app, no roles, no remote calls. Unchanged from spec 0012.

**Configuration required**: none.

**Critical test scenarios**:

- Happy path: open each All level 1 and 2 screen in each layout, type the full drill, red key tracks, save works, verifies **AC-1**, **AC-2**, **AC-3**, **AC-4**
- Content rule: no All level 1 or 2 group equals a row local group of the same layout, verifies **AC-1**, **AC-2**, **AC-3**, **AC-4**
- Difficulty rule: `lintClassicDrills` returns empty for all 24 rows, verifies **AC-7**
- Typeability: every Traditional All unit resolves to a Preeti sequence with no standalone i matra, verifies **AC-4**
- Regression: row local and All level 3 prompts byte identical, verifies **AC-6**
- Drift guard: snapshot matches the locked prompts, verifies **AC-7**
- Docs: 0017 note plus 0015 pointer present, verifies **AC-8**

## Build plan

Skateboard applies loosely since this is content work inside a built shell: land one layout at a time so each step stays verifiable.

1. Add `columnPairs` plus `columnTriples` to `src/domain/drillPattern.ts`, route `englishGroups("all", 1)` and `englishGroups("all", 2)` to them, with unit tests for exact groups plus purity plus the repeat rule, satisfies **AC-1**, **AC-2**
2. Author the Traditional All level 1 and 2 cross row tables in `src/domain/classicDrills.ts` with validation tests for exact tokens plus typeability plus matra shape, satisfies **AC-3**, **AC-4**
3. Rewire the four All rows to the new groups (repeats unchanged), run lint plus the full suite, satisfies **AC-5**, **AC-7**
4. Update the snapshot deliberately and assert untouched rows byte identical, satisfies **AC-6**, **AC-7**
5. Mark the All level 1 and 2 parts of spec 0017 superseded and point spec 0015 at this spec, satisfies **AC-8** (done at spec capture)

## Consequences

**Positive**:

- All level 1 and 2 teach motion no row screen teaches, which is the complaint answered
- English content stays generated from painted geometry, so fixes stay small and reviewable
- Deterministic prompts keep the snapshot guard meaningful

**Negative / tradeoffs**:

- Past best scores on the four rows stop comparing to the new drills (ids and history are kept)
- English All level 1 grows from 300 to 400 tokens, a longer single drill with no mid row checkpoint
- Traditional content is authored, so a Nepali reader must review token choices
- The snapshot must be updated on purpose whenever content changes, which is friction by design

**Neutral**:

- No schema change and no stored data migration. Attempts store only `lessonId`.
- The file now holds three content mechanisms: geometry rules for English rows, authored tables for Traditional rows, sentence tables for All level 3.

## Follow-up

- [ ] Land together with the uncommitted All level 3 sentence work (English plus Traditional). The snapshot covers both, so landing one without the other forces a second deliberate snapshot update.
- [ ] Consider a mid row checkpoint or split if the 400 token All level 1 row proves too long in real use.
- [ ] If All level 2 columns feel too easy or too hard in real use, revisit the column order before touching the rule.
