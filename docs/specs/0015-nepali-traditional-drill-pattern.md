# 0015. Nepali Traditional drill content pattern

**Date**: 2026-09-17
**Status**: Accepted

**Note**: Counts are corrected to 10 (Level 2 and Level 3) and 30 (Level 1 pairs), and prompt storage moved to compact token groups, per spec [0017](0017-dynamic-drill-generation.md).

## Summary

This spec sets the drill content pattern for all Nepali Traditional classic screens (Home, Top, Bottom, All, from spec 0012). Level 1 drills use mirrored finger pairs with matra+consonant combos as units. Level 2 drills use same hand groups of three distinct keys. Level 3 drills use mixed hand groups of three. Every group repeats 10 times. English pattern from spec 0013 is the reference. Nepali Romanized rows are out of scope.

## Context

Spec 0012 shipped the classic shell with bundled Traditional drill rows written as placeholder content (for example Home L1 was `ममम पपप`). Those rows teach one hand at a time and do not match how touch typing is taught, where each finger learns its left and right home keys together, then rolls within one hand, then alternates hands. The English rows were already rewritten in spec 0013 to a pair based pattern. The open decision was whether that pattern extends to Traditional, what the exact pairs and groups are for those rows given Preeti key mappings, and how matra keys (`f` = ा, `l` = ि) are handled. Romanized rows stay under spec 0006 until their own decision lands.

## Requirements

**User stories**:

- As a Nepali Traditional learner, I want Home, Top, Bottom, and All drills built from finger pairs like English so that every screen teaches the same hand logic.
- As a Nepali Traditional learner, I want Level 2 to roll within one hand and Level 3 to mix both hands so that difficulty grows the same way on every screen.
- As a Nepali Traditional learner, I want matra keys (`f` and `l`) taught as real consonant+matra combos so that I learn true Preeti sequences.
- As a Nepali Traditional learner, I want steady drill length so that each row feels like the same amount of practice.

**Acceptance criteria**:

- **AC-1**: Home Traditional L1 holds the five mirrored finger pairs `a;` (ब-स), `ls` (कि), `dk` (म-प), `jf` (वा), `gh` (न-ज), each tripled and repeated 10 times. Pairs use the order that produces correct Preeti combos (right→left for pre-posed matra `l` and post-posed matra `f`).
- **AC-2**: Top Traditional L1 holds the five pairs `qp` (त्र-उ), `wo` (ध-य), `ei` (भ-इ), `ru` (च-ग), `ty` (त-थ), each tripled and repeated 10 times.
- **AC-3**: Bottom Traditional L1 holds the four viable pairs `z/` (श-र), `x.` (ह-।), `vk` (ख-प), `bn` (द-ल), each tripled and repeated 10 times. (Middle finger pair omitted: left `c` has no Preeti mapping. `m` is a modifier key, not a consonant, so the pair is `vk`.)
- **AC-4**: All Traditional L1 holds all 14 pairs (Home 5, then Top 5, then Bottom 4), each tripled and repeated 10 times.
- **AC-5**: Every Traditional L2 row holds same hand groups of three distinct keys, each group repeated 10 times, with no back to back repeat of the same unit anywhere in the row.
- **AC-6**: Every Traditional L3 row holds mixed hand groups of three, each group repeated 10 times, with no back to back repeat of the same unit anywhere in the row.
- **AC-7**: Row ids and order values are new (e.g., `cl-home-1-tr` through `cl-all-3-tr`), English `cl-*-en` rows unchanged, Nepali Romanized rows byte for byte untouched.
- **AC-8**: Spec 0012 carries a note marking its Traditional drill rows as retired in favor of this spec.
- **AC-9**: Lint passes on all 12 rebuilt Traditional rows (L2 and L3 rows hold zero back to back repeats).

## Options considered

### Option 1: Pair and group pattern on all screens (chosen)

Level 1 uses mirrored finger pairs (same finger, both hands) with matra+consonant combos as units. Level 2 uses same hand groups of three distinct keys. Level 3 uses mixed hand groups of three. Ten repeats per group on every row.

**Pros**:

- One hand logic on every screen, easy to teach and to verify.
- Reuses the English pattern already built as the proven reference.
- Matra keys taught as real combos (`sf` → का, `sl` → कि) matching Preeti behavior.

**Cons**:

- Long rows (All L1 reaches 150 groups), which makes each drill a long session.
- Preeti key density differs from English; some finger pairs are less natural.

### Option 2: Keep the old placeholder rows

Leave Home, Top, Bottom, and All rows as they are and keep the new pattern English only.

**Pros**:

- No work, shorter rows.

**Cons**:

- Two teaching logics in one app, confusing progression from English to Nepali.
- Wastes the English pattern already built and tested.

### Option 3: Separate matra drills

Add dedicated matra rows before consonant pairs.

**Pros**:

- Isolates matra learning.

**Cons**:

- Teaches wrong habit (matras never typed alone in Preeti).
- Breaks the finger pair progression.

## Decision

**Chosen option**: Option 1: Pair and group pattern on all screens

Extend the English pattern to Traditional with the pairs and groups below, ten repeats per group, new row IDs, Traditional only.

**Implementation skills**: `vercel-react-best-practices` (`vercel-labs/agent-skills`, `.agents/skills/vercel-react-best-practices/`) · `typescript-advanced-types` (`wshobson/agents`, `.agents/skills/typescript-advanced-types/`) · `tailwindcss` (`hairyf/skills`, `.agents/skills/tailwindcss/`)

## Rationale

The English Home rows already prove the pattern in code and the engineer confirmed each row level choice with the recommended pick. One hand logic across screens keeps teaching coherent (a finger learned on English Home works the same on Traditional Home), the lint rule from spec 0012 still enforces Level discipline mechanically, and keeping new IDs avoids progress resets. Option 2 would split the app into two teaching logics. Option 3 teaches matras in isolation which never happens in real Preeti typing.

## Feature design

**Row content** (groups listed once each; the built row repeats every group 10 times in the given order; tripled units at L1 only):

- Home L1: `a; a; a;`, `ls ls ls`, `dk dk dk`, `jf jf jf`, `gh gh gh`
- Home L2: `a;l`, `lsd`, `jfg`, `dkj`, `gha`
- Home L3: `a;ls`, `dkjf`, `ghdk`, `a;gh`, `lsjf`
- Top L1: `qp qp qp`, `wo wo wo`, `ei ei ei`, `ru ru ru`, `ty ty ty`
- Top L2: `qwe`, `woi`, `eir`, `typ`, `ruy`
- Top L3: `qwo`, `eir`, `uyp`, `qei`, `wru`, `typ`, `qwo`, `eir`
- Bottom L1: `z/ z/ z/`, `x. x. x.`, `vk vk vk`, `bn bn bn`
- Bottom L2: `zxv`, `z/`, `vbn`, `x.`, `vk`
- Bottom L3: `zxv`, `z/`, `vbn`, `x.`, `vk`, `bn`, `z/.`, `xvk`
- All L1: the 5 Home pairs, then the 5 Top pairs, then the 4 Bottom pairs.
- All L2: `a;l`, `lsd`, `qwe`, `woi`, `vbn`, `zxv`
- All L3: `a;ls`, `qwo`, `zxv`, `dkjf`, `eir`, `vbn`, `ghdk`, `uyp`, `bn`

Group order was adjusted from the first draft so a group's last unit never equals the next group's first unit. The draft order `dkj` then `jfg` (and similar pairs) collided at the boundary, which the Level 2 and Level 3 lint rule rejects.

**Data model sketch**: no shape change. `Lesson` rows keep id, layout `traditional`, category, difficulty, and order values. Twelve new Traditional rows (`cl-home-1-tr` through `cl-all-3-tr`) replace the retired placeholder rows in `CLASSIC_DRILLS_TRADITIONAL`. English `cl-*-en` rows and Nepali Romanized rows are untouched.

**State transitions**: none. Drill state machine from spec 0012 is untouched.

**API surface**: no new endpoint. `load_lessons` with layout plus category plus difficulty filters already serves these rows.

**Value sourcing**:

| Action            | Value produced / displayed        | Source                                                                                         |
| ----------------- | --------------------------------- | ---------------------------------------------------------------------------------------------- |
| Open drill screen | Prompt text for screen plus level | `Lesson.prompt` from the row table above, via `load_lessons`                                   |
| Lint check        | Pass or fail per row              | `hasConsecutiveRepeat` plus `drillPassesDifficulty` from spec 0012, run over the built prompts |
| Typing session    | Lit key plus live speed           | Unchanged derivations from spec 0012, using `codeForNextUnit` with `PREETI_MAP`                |

**Key invariants**:

- L1 rows may repeat the same unit back to back. L2 and L3 rows never do, enforced by the existing lint test over every bundled row.
- Row ids and order values are stable. Prompt text is the only field that changes.
- English and Nepali Romanized rows are untouched by this change.
- Matra keys `f` (aa-matra) and `l` (i-matra) only appear in combos with correct Preeti order: `ls` (कि, pre-posed), `jf` (वा, post-posed). Never standalone.
- Bottom row has 4 pairs (middle finger `c` has no Preeti mapping).

**Security model**: local single user app, no roles, no remote calls. Unchanged from spec 0012.

**Configuration required**: none.

**Critical test scenarios**:

- Happy path: open each Traditional screen at each level, type the full drill, red key tracks, save works, verifies **AC-1**, **AC-2**, **AC-3**, **AC-4**.
- Difficulty rule: lint passes on all twelve rebuilt rows (L2 and L3 rows hold zero back to back repeats), verifies **AC-5**, **AC-6**, **AC-9**.
- Regression: English rows unchanged, Nepali Romanized rows byte identical, verifies **AC-7**.
- Docs: spec 0012 shows the retirement note pointing here, verifies **AC-8**.
- Matra order: `ls` produces कि, `jf` produces वा, verifies **AC-1** matra combos.

## Build plan

Skateboard applies: land one full screen at a time so each step stays verifiable, thin content first, no scaffolding needed.

1. Add twelve new Traditional rows (`cl-home-1-tr` through `cl-all-3-tr`) to `classicDrills.ts` with prompts from the table above, run the drill lint, satisfies **AC-1**, **AC-2**, **AC-3**, **AC-4**, **AC-5**, **AC-6**, **AC-7**, **AC-9**.
2. Update `lessonsForClassic` or the picker to serve new Traditional rows alongside English ones (layout filter handles this), satisfies **AC-7**.
3. Add the retirement note to spec 0012 pointing at this spec, satisfies **AC-8**.

## Consequences

**Positive**:

- One teaching logic on all four drill screens for both English and Traditional, so progress transfers directly.
- Row content becomes generatable from a stated rule, so future rows need no fresh design.
- Matra keys taught as real combos with correct Preeti order (`ls` = कि, `jf` = वा).

**Negative / tradeoffs**:

- Long rows: All L1 runs 140 groups (14 pairs × 3 × 10), a long single drill with no mid row checkpoint.
- Home row pairs use right→left order for matra keys (`ls`, `jf`) to produce correct combos, breaking left→right consistency.
- Bottom row has only 4 pairs (left middle `c` unmapped), making it shorter than Home/Top.

**Neutral**:

- Nepali Romanized rows now visibly lag the English/Traditional pattern until their own decision lands.

## Follow-up

- [ ] Decide the Nepali Romanized drill pattern (separate spec), then spec the Romanized rows the same way.
- [ ] Consider a mid row checkpoint or row split if the 140 group All L1 row proves too long in real use.
