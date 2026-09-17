# 0013. English drill content pattern

**Date**: 2026-09-16
**Status**: Accepted

## Summary

This spec sets the drill content pattern for all English classic screens (Home, Top, Bottom, All, from spec 0012). Level 1 drills mirrored finger pairs with repeats allowed. Level 2 drills same hand groups of three distinct keys. Level 3 drills mixed hand groups of three. Every group repeats 10 times. Home rows already follow this pattern in code and are the reference. This spec extends it to Top, Bottom, and All, and marks the old English rows in spec 0012 as retired.

## Context

Spec 0012 shipped the classic shell with bundled English drill rows written as single hand runs (for example Home L1 was `aaa sss`, Top L1 was `qqq www`). Those rows teach one hand at a time and do not match how touch typing is taught, where each finger learns its left and right home keys together, then rolls within one hand, then alternates hands. The Home English rows were already rewritten in code to a pair based pattern. The open decision was whether that pattern extends to Top, Bottom, and All, what the exact pairs and groups are for those rows, and what happens to the old rows. Nepali rows are out of scope here and stay under the spec 0012 rule until their own decision lands.

## Requirements

**User stories**:

- As a learner, I want Top, Bottom, and All drills built from finger pairs like Home so that every screen teaches the same hand logic.
- As a learner, I want Level 2 to roll within one hand and Level 3 to mix both hands so that difficulty grows the same way on every screen.
- As a learner, I want steady drill length so that each row feels like the same amount of practice.

**Acceptance criteria**:

- **AC-1**: Top English L1 holds the five pairs q with p, w with o, e with i, r with u, t with y, each tripled and repeated 10 times.
- **AC-2**: Bottom English L1 holds the five pairs z with slash, x with dot, c with comma, v with m, b with n, each tripled and repeated 10 times.
- **AC-3**: All English L1 holds all 15 pairs (Home 5, then Top 5, then Bottom 5), each tripled and repeated 10 times.
- **AC-4**: Every English L2 row holds same hand groups of three distinct keys, each group repeated 10 times, with no back to back repeat of the same unit anywhere in the row.
- **AC-5**: Every English L3 row holds mixed hand groups of three, each group repeated 10 times, with no back to back repeat of the same unit anywhere in the row.
- **AC-6**: Row ids and order values stay unchanged, only prompt text changes, so saved progress keeps working.
- **AC-7**: Nepali and Romanized rows are byte for byte untouched.
- **AC-8**: Spec 0012 carries a note marking its English drill rows as retired in favor of this spec.

## Options considered

### Option 1: Pair and group pattern on all screens

Level 1 uses mirrored finger pairs (same finger, both hands). Level 2 uses same hand groups of three distinct keys. Level 3 uses mixed hand groups of three. Ten repeats per group on every row.

**Pros**:

- One hand logic on every screen, easy to teach and to verify.
- Reuses the Home rows already built as the proven reference.

**Cons**:

- Long rows (All L1 reaches 150 groups), which makes each drill a long session.
- Punctuation pairs on the Bottom row (slash, dot, comma) are awkward for pure beginners.

### Option 2: Keep the old single hand runs

Leave Top, Bottom, and All rows as they are and keep the new pattern Home only.

**Pros**:

- No work, shorter rows.

**Cons**:

- Two teaching logics in one app, confusing progression from Home to Top.
- Wastes the Home pattern already built and tested.

### Option 3: Real word drills at higher levels

Replace L2 and L3 with short English words using the row keys instead of abstract groups.

**Pros**:

- Feels like real typing sooner.

**Cons**:

- Row purity breaks (words pull in keys from other rows), which defeats row by row teaching.
- Harder to lint for the no repeat rule.

## Decision

**Chosen option**: Option 1: Pair and group pattern on all screens

Extend the Home pattern to Top, Bottom, and All with the pairs and groups below, ten repeats per group, same row ids, English only.

## Rationale

The Home rows already prove the pattern in code and the engineer confirmed each row level choice with the recommended pick. One hand logic across screens keeps teaching coherent (a finger learned on Home works the same on Top), the lint rule from spec 0012 still enforces Level discipline mechanically, and keeping ids stable avoids progress resets. Option 2 would split the app into two teaching logics. Option 3 breaks row purity, which is the whole point of row screens.

## Feature design

**Row content** (groups listed once each; the built row repeats every group 10 times in the given order; tripled units at L1 only):

- Home L1 (reference, already in code): aaa jjj, sss kkk, ddd lll, fff ;;;, ggg hhh.
- Home L2 (reference, already in code): asd, jkl, sdf, hk;, adg, jl;.
- Home L3 (reference, already in code): ajk, sdl, fj;, ghd, akj, dsl, ;lf, hgj.
- Top L1: qqq ppp, www ooo, eee iii, rrr uuu, ttt yyy.
- Top L2: qwe, wer, ert, yui, uio, iop.
- Top L3: qyu, woi, epr, yqw, uoe, rit, pir, tyq.
- Bottom L1: zzz ///, xxx ..., ccc ,,,, vvv mmm, bbb nnn.
- Bottom L2: zxc, xcv, cvb, nm,, m,., ,./.
- Bottom L3: znm, x,., cv/, vbn, bz/, mcz, nxm, /vx.
- All L1: the 5 Home pairs, then the 5 Top pairs, then the 5 Bottom pairs.
- All L2: asd, jkl, qwe, yui, zxc, nm,.
- All L3: qaj, wsl, eok, rpm, tyh, uxd, ivc, ozb.

**Data model sketch**: no shape change. `Lesson` rows keep id, layout `qwerty`, category, difficulty, and order values. Only the `prompt` field changes on the nine English rows (`cl-home-1-en` through `cl-all-3-en`).

**State transitions**: none. Drill state machine from spec 0012 is untouched.

**API surface**: no new endpoint. `load_lessons` with layout plus category plus difficulty filters already serves these rows.

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Open drill screen | Prompt text for screen plus level | `Lesson.prompt` from the row table above, via `load_lessons` |
| Lint check | Pass or fail per row | `hasConsecutiveRepeat` plus `drillPassesDifficulty` from spec 0012, run over the built prompts |
| Typing session | Lit key plus live speed | Unchanged derivations from spec 0012 |

**Key invariants**:

- L1 rows may repeat the same unit back to back. L2 and L3 rows never do, enforced by the existing lint test over every bundled row.
- Row ids and order values are stable. Prompt text is the only field that changes.
- Nepali and Romanized rows are untouched by this change.

**Security model**: local single user app, no roles, no remote calls. Unchanged from spec 0012.

**Configuration required**: none.

**Critical test scenarios**:

- Happy path: open each English screen at each level, type the full drill, red key tracks, save works, verifies **AC-1**, **AC-2**, **AC-3**.
- Difficulty rule: lint passes on all nine rebuilt rows (L2 and L3 rows hold zero back to back repeats), verifies **AC-4**, **AC-5**.
- Regression: old attempt history still maps to the same row ids, Nepali rows byte identical, verifies **AC-6**, **AC-7**.
- Docs: spec 0012 shows the retirement note pointing here, verifies **AC-8**.

## Build plan

Skateboard applies loosely here since this is content work inside a built shell: land one full screen at a time so each step stays verifiable, thin content first, no scaffolding needed.

1. Rewrite the three Top English rows from the table, run the drill lint, satisfies **AC-1**, **AC-4**, **AC-5**.
2. Rewrite the three Bottom English rows from the table, run the drill lint, satisfies **AC-2**, **AC-4**, **AC-5**.
3. Rewrite the three All English rows from the table, run the drill lint plus the full test suite, satisfies **AC-3**, **AC-4**, **AC-5**, **AC-6**, **AC-7**.
4. Add the retirement note to spec 0012 pointing at this spec, satisfies **AC-8**.

## Consequences

**Positive**:

- One teaching logic on all four drill screens, so progress from Home transfers directly to Top, Bottom, and All.
- Row content becomes generatable from a stated rule, so future rows need no fresh design.

**Negative / tradeoffs**:

- Long rows: All L1 runs 150 groups, which is a long single drill with no mid row checkpoint.
- Bottom L1 leans on punctuation keys early, which may frustrate pure beginners.
- The old English rows disappear, so any learner mid progression restarts those drills on new content (progress history itself is kept).

**Neutral**:

- Nepali rows now visibly lag the English pattern until their own decision lands.

## Follow-up

- [ ] Decide the Nepali Preeti transfer (physical key mapping) plus the matra pair question for f and l keys, then spec the Nepali rows the same way.
- [ ] Consider a mid row checkpoint or row split if the 150 group All L1 row proves too long in real use.
