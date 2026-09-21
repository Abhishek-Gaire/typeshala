# Review, feat/dynamic-drill-generation, 2026-09-20

**Reviewed by**: Muse Spark (fresh-eyes reviewer; did not write this code)
**Scope**: 10 files, uncommitted (feat/dynamic-drill-generation working tree vs main @ 54d5dd58)
**Verdict**: Approve with nits

## Summary

This change replaces hand-written drill prompt literals with a small generator (`drillPattern.ts`: mirror pairs, same-hand windows, mixed triples, `buildPrompt`) plus compact Traditional token-group tables, fixing real shipped drift (stray `nm` token, under/over repeats, non-mirror Home L1). It is spec-faithful to 0017 AC-1 through AC-9, keeps all row ids/orders/meta, and adds strong tests (generator units, exact token totals, key purity, lint, snapshot drift guard). Typecheck, eslint, prettier (on changed files), and the full suite (224 passed) are green. No blockers or majors; remaining items are small hardening nits the author can take or leave.

## Minor

### 🟡 Token validation misses embedded whitespace, `src/domain/drillPattern.ts:91`

**Problem**: `buildPrompt` rejects empty groups, empty tokens, and `repeat < 1`, but accepts tokens containing spaces (e.g. `"a b"`). Such a token would pass validation yet split into two tokens under `tokensForPrompt`, silently breaking the exact-count invariants the tests lock.
**Why it matters**: All current tokens are clean so nothing is broken today, but a future Traditional phrase token with a space would corrupt counts without a fail-fast error, which is exactly the drift class this spec exists to prevent.
**Suggested fix**: Reject tokens containing whitespace in `buildPrompt` alongside the existing empty-token check.

### 🟡 Shared mutable Traditional L1 group arrays are aliased across rows, `src/domain/classicDrills.ts:137`

**Problem**: `TRADITIONAL_L1_GROUPS.home/top/bottom` inner arrays are referenced directly by their single rows (`groups: TRADITIONAL_L1_GROUPS.home`) and also spread by reference into the All L1 row. Mutating one inner group would corrupt two rows at once.
**Why it matters**: Nothing mutates today (module-private const, `buildPrompt` only reads), so this is latent, but the aliasing turns a future accidental push into a cross-row defect. The sharing is intentional DRY for edits; the risk is only unstructured mutation.
**Suggested fix**: Freeze the group tables or deep-copy on use so each spec owns its arrays.

## Nits

- ⚪ `src/domain/classicDrills.ts:290`, stale comment still cites "(spec 0013) plus Traditional (spec 0015)" — should cite spec 0017.
- ⚪ `src/domain/classicDrills.ts:143`, `TRADITIONAL_SPECS` comment cites spec 0015 only; mention the 0017 count correction like the file header does.
- ⚪ `src/domain/drillPattern.ts:27`, `CLASSIC_KEYS` hardcodes the `ROWS` geometry from `classicLayout.ts` with no cross-check test; a geometry edit could drift the drills silently (spec chose the copy; a lock test would harden it).
- ⚪ `src/domain/drillPattern.ts:38`, `mirrorPairs`/`mixedTriples` assume 5-key hands and fail cryptically (`undefined.repeat`) on mismatched lengths; consider an explicit length assertion.
- ⚪ `src/domain/drillPattern.ts:46`, `sameHandTriples` on a short hand returns `[]`, so `englishGroups("all", 2)` would embed `undefined` groups and fail downstream with a confusing error rather than at the source.

## Strengths

- Spec fidelity is excellent: mirror pairing (`right[4-i]`), sliding windows, `left[i]/right[mirror]/left[i+2]` mixed rule, All-screen sampling (15/6/6 groups), Traditional 30/10 counts with 14 All-L1 pairs, and unchanged row identity all match 0017 AC-1 through AC-5 and AC-9 exactly.
- Test design is genuinely good: per-generator unit tests with exact expected tokens, exact per-row token totals, key-purity checks on both layers, lint plus a snapshot drift guard, and fail-fast validation cases — the snapshot plus exact totals mean any future count/content drift fails CI.
- Clean domain layering: zero framework imports, type-only cross-imports (no runtime cycle), strict types with no `any`, short doc comments on every public API per AGENTS.md, and changed files are prettier-clean with typecheck plus eslint green.

## Test coverage

Covered: English generators (L1 mirrors, L2 windows, L3 mixed, All sampling), `buildPrompt` ordering/repeat/validation, key purity (all screens), row identity (24 ids/orders/meta), Traditional 30/10 counts with exact per-row totals and the intentional Top-L3 duplicate-tail case, lint on all rows, spacing invariants, and the snapshot drift guard. Full suite: 28 files, 224 tests passed; typecheck, eslint, and prettier (changed files) green. No new-logic coverage gaps found; the generic modulo-count test's weakness is already covered by the exact-totals test beside it.
