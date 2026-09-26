# 0020. Preeti legacy conjunct gaps

**Date**: 2026-09-25
**Status**: Accepted
**Revised**: 2026-09-25, twice. The first draft proposed adding `x|` for
ङ्ख; withdrawn, the chart row is misread. The second claimed `ह्र` was
unscoreable; withdrawn, `X` + `/` types it correctly. What survives is a
coverage claim that turns out to be complete, a header that misstates why,
and four transcription errors.

## Summary

The header of `src/domain/preeti.ts` lists 13 rarer conjuncts plus reph as
things that "were only reachable in the original software via obscure
legacy-keyboard-driver combinations ... that don't map cleanly onto a
standard browser KeyboardEvent". That framing is wrong in a way that matters:
**every one of the 13 is typeable and scoreable in the app today.** They are
not unreachable. They are reachable as two or three scored units instead of
one, through the same halant and matra composition the map already ships for
`स्व` (`:j`), `स्त्र` (`:q`), and `द्र` (`b|`).

A BFS over `advancePreeti` confirms it, prompt units matched keystroke for
keystroke:

| Unit | Keys        | Scored units |
| ---- | ----------- | ------------ |
| ङ्ग  | `,` `\` `u` | 3            |
| ङ्ख  | `,` `\` `v` | 3            |
| ङ्क  | `,` `\` `s` | 3            |
| ङ्घ  | `,` `\` `3` | 3            |
| ङ्ढ  | `,` `\` `9` | 3            |
| ट्ट  | `6` `\` `6` | 3            |
| ड्ड  | `8` `\` `8` | 3            |
| ठ्ठ  | `7` `\` `7` | 3            |
| ट्ठ  | `6` `\` `7` | 3            |
| द्घ  | `b` `\` `3` | 3            |
| द्व  | `b` `\` `j` | 3            |
| हृ   | `x` `[`     | 2            |
| रू   | `/` `"`     | 2            |
| ह्र  | `X` `/`     | 2            |

The rest of the alphabet is single-unit and direct: all 33 barakhadi
consonants (`s v u 3 ,` … `फ` on `km`, `ण` on `N`, `ङ` on `,`), all 11 vowels,
all 10 matras, and the eight chart conjuncts `क्ष` `त्र` `ज्ञ` `श्र` `द्ध` `द्द`
`द्य` `क्र`. Nothing in ordinary Nepali text is missing.

So this spec adds no key path. It does four things:

- **Correct the header** so it stops implying these units are unreachable. The
  real distinction is one scored unit versus several, and that is a scoring
  decision, not a keymap gap.
- **Add a coverage test** that locks the claim above in, so a future map edit
  cannot silently make one of the 14 untypeable.
- **Fix four transcription errors** in `reference/preeti-keymap.ts`, found by
  reading the chart PNGs.
- **Withdraw two claims** this document previously made, with the evidence
  that kills them.

## Context

### The two claims being withdrawn

**`x|` is not `ङ्ख`.** `reference/preeti-keymap.ts:99` does read `ङ्ख` = `x|`,
but the same file reads `ह` = `x` (`:77`) and `्र` = `|` (`:142`), so its own
rows compose `x|` to `ह्र`. The mirror agrees and is unanimous across all
three fonts — `x` → `ह` (`:111`, `:187`, `:376`), `|` → `्र` (`:110`, `:185`,
`:375`) — and no post-rule (`:451-496`) rewrites `ह्र` into `ङ्ख`. The
mirror's own `ङ्ख` is a dead key (`:94`). This is the `W` case, not the `E`
case: `W` was rejected as "ambiguous at chart size and likely misread"
(`preeti-keymap-differences.md:111-112`). Two smaller signals: the
differences note carries a literally broken table row for this entry (`:129`,
an unescaped `|` inside a cell), and the transcription's caveats admit
small-text misreads on exactly this chart (`:155-161`).

Adding `"x|": "ङ्ख"` would also be a downgrade, not an upgrade: `,\v` already
types `ङ्ख` correctly in three keystrokes with matching prompt units, and the
new row would both rest on a contradicted source and force a single-unit
segmentation that no lesson currently teaches.

**`ह्र` is not unscoreable.** `splitUnits("ह्र")` is `["ह्", "र"]`, and
`x` `|` commits `["ह", "्र"]` — the same three codepoints, differently split,
so that path never matches a prompt. But `X` `/` commits `["ह्", "र"]`, which
does. `ह्रदय` types as `X/bo` and `बिहार` as `laxf/`. The earlier claim that
"no keystroke sequence can satisfy that prompt" was wrong, and it was only
wrong because it considered the `x` `|` path and stopped. Both routes produce
identical text; only the unit boundaries differ, which is a scoring question
(AC-2), not a correctness bug.

### The 14 items, audited

Chart column is `reference/preeti-keymap.ts` unless noted. Mirror column is
the `SHUVAYATRA_PREETI_CHAR_MAP` line in `reference/shuvayatra-preeti.ts`.

| Unit      | Chart claim                                                 | Mirror claim   | Reachable in-app | Single unit |
| --------- | ----------------------------------------------------------- | -------------- | ---------------- | ----------- |
| ङ्ख       | `x\|` (`:99`, misread)                                      | `:94`          | `,\v`            | no, 3       |
| ङ्क       | `X` (`:100`)                                                | `:126`         | `,\s`            | no, 3       |
| ङ्ग       | none — `:101` is a misattribution                           | `:61`          | `,\u`            | no, 3       |
| ङ्घ       | none                                                        | `:166`         | `,\3`            | no, 3       |
| ङ्ढ       | none                                                        | `:163`         | `,\9`            | no, 3       |
| ड्ड       | none                                                        | `:71`          | `8\8`            | no, 3       |
| ट्ट       | `Alt+0248`, `Alt+0204` (`:92`, `:94`)                       | `:68`          | `6\6`            | no, 3       |
| ट्ठ       | `Alt+0229` (`:96`), `Alt+0171`, `Alt+0176` (`:161`, `:162`) | `:119`         | `6\7`            | no, 3       |
| ठ्ठ       | `Alt+0136` (`:95`)                                          | `:97`          | `7\7`            | no, 3       |
| द्घ       | `Alt+0132`, `Alt+0165+o`                                    | `:104`         | `b\3`            | no, 3       |
| द्व       | `Alt+0216` (`:93`)                                          | `:112`         | `b\j`            | no, 3       |
| हृ        | `Alt+0155` (`:97`), `Alt+0197` in `preeti3.png`             | `:123`         | `x[`             | no, 2       |
| रू        | `Alt+0191` (`:98`)                                          | `:65`          | `/"`             | no, 2       |
| reph `र्` | `Alt+0165+o` (`:127`)                                       | `:134` → `र्‍` | n/a              | n/a         |

Every "single unit = no" is a scoring consequence, not a reachability
failure. The mirror matters for a different reason: it is the only source
that attests these units at all, and the first draft of this spec claimed
three of them had no source in the repo. They do —
`reference/shuvayatra-preeti.ts:71` (`ड्ड`), `:166` (`ङ्घ`), `:163` (`ङ्ढ`).

Two cautions for whoever reads that table next. First, mirror dead keys are
not interchangeable with the chart's `Alt+NNNN` numbers: within Latin-1 a
codepoint's byte equals the Alt number, confirmed by `U+00A3` → `घ्` in all
three font maps (`:70`, `:234`, `:332`) against `Alt+0163`
(`reference/preeti-keymap.ts:107`), but past that the fonts disagree about
the same codepoint — `U+00B0` is `ङ्ढ` in Preeti (`:163`) and Kantipur
(`:435`) but `ङ्क` in PCS-Nepali (`:281`); `U+00CE` is `ङ्ख` in Preeti (`:94`)
and `फ्` in Kantipur (`:357`). And one Alt number is claimed for different
characters across sources: `Alt+0203` is `फ्` in `preeti1.png` and `U+00CB` →
`ङ्ग` in the mirror; `Alt+0167` is `द्द` in `preeti1.png`, `ऱ` in
`reference/preeti-keymap.ts:160`, and `U+00A7` → `ट्ट` in the mirror. A mirror
entry proves a unit is reachable in principle, never which key types it.

Second, `ट्ठ`'s three chart codes are not three independent sources. Two are
best-effort Alt-glyph names the transcription itself flags (`:12`), and
`Alt+0171`'s glyph is `्र` in the mirror (`:73`), so it is most likely a
misread rather than a contradiction.

## Requirements

**User stories**:

- As a learner, I want every letter of ordinary Nepali text to be typeable
  and scored the way the charts say, and I want nobody to "fix" a working
  path from a chart row that contradicts itself.
- As a contributor, I want the header in `preeti.ts` to describe the real
  situation, and I want the coverage claim tested so I can trust it.

**Acceptance criteria**:

- **AC-1**: `PREETI_MAP` is unchanged. No sequence added, removed, or
  remapped. Only the leading block comment of `src/domain/preeti.ts` is
  edited.
- **AC-2**: The header comment states that all 13 conjuncts are reachable
  today through halant and matra composition, that they score as 2-3 units
  rather than one, that this is a scoring decision rather than a keymap gap,
  and that `x|` and `X` are not available for `ङ्ख` and `ङ्क` (the first is a
  misread, the second is `ह्`). The current "only reachable via
  legacy-keyboard-driver combinations" sentence goes.
- **AC-3**: `tests/domain/preeti.test.ts` gains a coverage block that locks
  the table above in:
  - every barakhadi consonant, vowel, and matra has a non-empty
    `sequenceForPreeti` and a single prompt unit;
  - each of the 14 composition rows, when its keys are fed through
    `advancePreeti` and flushed, commits exactly `splitUnits(unit)`.
    A change to `PREETI_MAP` that breaks either assertion fails here.
- **AC-4**: `reference/preeti-keymap.ts` stops claiming `ङ्ग` is on
  `Alt+0132` and gains the three chart rows it is missing.
  - `public/preeti2.png` prints two `द्घ` rows, `Alt+0132` and `Alt+0165+o`,
    and `preeti3.png` Table 2 repeats `द्घ` on `Alt+0132`. The differences
    note records all of them (`:52-54`, `:75-76`), but the transcription
    filed the first as `ङ्ग` (`reference/preeti-keymap.ts:101`, a character
    that appears in no chart) and dropped the other two.
  - `preeti3.png` Table 2 appears to list `हृ` on `Alt+0197`, which the
    mirror's `U+00C5` (197) corroborates; the transcription kept only
    `Alt+0155` (`:97`). The glyph is small, so read it before trusting it.

  So: delete the invented `ङ्ग` row with a comment pointing at the mirror,
  add the two `द्घ` rows and the `हृ` row, and confirm afterwards that
  `keysForCharacter("द्घ")` returns two entries and that no entry anywhere maps
  to `ङ्ग`.

- **AC-5**: `preeti-keymap-differences.md` drops `ङ्ग` from "In the chart
  only", adds an "In the mirror only" list (ङ्ग, ङ्घ, ङ्ढ, ड्ड — the four
  absent from all three charts), and records the reachability table plus the
  codepoint caveat from "Context" so the next audit starts from the same
  footing.
- **AC-6**: Reph stays out of `PREETI_MAP`. The mirror encodes it as a single
  dead key → `र्‍` (`र` + virama + ZWJ,
  `reference/shuvayatra-preeti.ts:134`), so the blocker is dead-key
  unreachability, not only the reordering architecture.
- **AC-7**: Lint, format check, typecheck, and the full suite pass. No
  existing test expectation changes.

## Decision

**Chosen option**: change no key paths. Correct the header, add the coverage
test, correct four transcription errors, and route the single-unit question
to a scoring spec.

### Why no row is added

Every candidate fails on one of three counts, and none of them is "it is
hard".

- **Sourced but wrong**: `x|` for `ङ्ख` contradicts the chart's own `ह` and
  `्र` rows and all three mirror fonts, and it would replace a working
  three-key path with a shorter one built on a misread.
- **Unsourced**: `?"` for `रू` is a coherent proposal — `?` is `रु`, `"` is
  `ू`, and the precedent for collapsing base + long matra is `pm` → `ऊ`
  (`src/domain/preeti.ts:155`) — but no source attests it, and `/"` already
  types `रू` correctly in two keystrokes. Teaching a reflex the original
  software never had, to save one keystroke on a letter pair that occurs in
  perhaps a handful of words, is a bad trade.
- **Already covered**: `X` for `ङ्क` collides with `ह्`, and `ह्र` already
  types as `X/`.

### The real open question, which is not a keymap question

Eleven of the 14 score as 3 units and three score as 2, where a learner who
knows Preeti expects one keystroke and one unit. WPM here is units per minute
by design (`src/domain/preeti.ts:38-40`), so a prompt full of `ट्ठ` or `द्व`
inflates the unit count against a learner who typed it correctly. Fixing that
means deciding what a "unit" is, then adding map rows and accepting the
segmentation change: `splitUnits` would start returning `["ट्ठ"]` where it
returns `["ट", "्", "ठ"]` today, which invalidates any lesson or drill that
already teaches the three-key form. That is a scoring-design decision with
content fallout, not a table edit, and it wants its own spec.

## Feature design

**No data model change.** `PREETI_MAP` is untouched (AC-1).

**Header rewrite.** Lines 29-35 become roughly:

```
 * Deliberately left out as single units (documented, not silent): 13 rare
 * conjuncts plus reph. All 13 are typeable today by halant and matra
 * composition — `,\s` for ङ्क, `6\7` for ट्ठ, `b\j` for द्व — but they
 * score as 2-3 units, not one, which is a scoring decision, not a missing
 * key. `X` stays `ह्` and `x|` is not ङ्ख (that chart row is misread; it
 * composes to ह्र). Coverage evidence and triage:
 * docs/specs/0020-preeti-legacy-conjunct-gaps.md
```

**State transitions.** None.

**Critical test scenarios** (all in `tests/domain/preeti.test.ts`):

- Direct coverage: every barakhadi consonant, vowel, and matra resolves to a
  non-empty sequence and one prompt unit. Guards AC-3's first half.
- Composition coverage: for each of the 14 rows, feeding the keys through
  `advancePreeti` and flushing the tail commits exactly `splitUnits(unit)`.
  This is the assertion that would have caught both withdrawn claims — run it
  and `ह्र` resolves via `X/`, not via `x|`.
- Regression: the existing 271 tests pass unmodified.

## Build plan

1. Rewrite the header gap paragraph in `src/domain/preeti.ts`. AC-2.
2. Add the coverage block to `tests/domain/preeti.test.ts`. AC-3.
3. Fix the transcription against the chart PNGs: drop the invented
   `ङ्ग` = `Alt+0132` entry with a pointer to the mirror, and add the two
   `द्घ` rows plus the `हृ` = `Alt+0197` row. AC-4.
4. Update `preeti-keymap-differences.md`: drop `ङ्ग` from "In the chart only",
   add "In the mirror only", add the reachability table and the codepoint
   caveat. AC-5.
5. Run lint, format check, typecheck, and the full suite. AC-6, AC-7.

No map, lesson, or drill content changes.

## Consequences

**Positive**:

- The header stops claiming thirteen typeable conjuncts are unreachable, and
  stops reading as an invitation to add a sequence from a chart row that
  contradicts its own table.
- Coverage becomes a test instead of a claim, so the next map edit cannot
  quietly orphan a letter.
- Four transcription errors fixed, so the next audit starts from correct data.

**Negative / tradeoffs**:

- This PR still adds no glyph. The user-visible change is zero; the value is
  in the header, the test, and the corrected reference data.
- The scoring question stays open, so a learner still counts `ट्ठ` as three
  units. That is a deliberate deferral, not a fix.

**Neutral**:

- No stored-data or schema impact.
- Revert is a single-commit revert with nothing to migrate.

## Follow-up

- [ ] Scoring and single unit question for the 11 three unit and 3 two unit
      conjuncts is decided in
      [0021](0021-rare-conjuncts-as-one-unit.md), which adds the rows. The
      keys are already known from the reachability table above.
- [ ] `ङ्क` is the only item where a shorter path would be a genuine
      improvement rather than a cosmetic one, and only if `X` is ever freed
      from `ह्`. Revisit only alongside a decision on `X`.
- [ ] Reph: separate spec if wanted. Start from the mirror's `र्‍` (`:134`)
      and the reordering problem, not from a keymap row.
- [ ] Cleared during this audit, no spec needed: `दृ` and `फ्` look like
      omissions in `preeti-keymap-differences.md:128` and `:144` because the
      app has no atomic row for them, but both resolve through existing keys
      with matching prompt units (`b` `[`, and `km` `\`).
- [ ] Lesson coverage for any unit that lands, in the style of spec 0018's
      lesson-coverage child (append, don't edit shipped prompts).
