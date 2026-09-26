# 0021. Score rare conjuncts as one unit

**Date**: 2026-09-25
**Status**: Proposed

## Summary

Thirteen rare conjuncts in the Traditional (Preeti) layout, plus `ह्र`, are
typeable today but score as two or three units each, so a learner who types
them perfectly is credited for three letters. Every other composed letter in
the app already scores as one, so these are the only inconsistency left. This
spec adds fourteen rows to the key map, each spelled with the same keys the
learner already presses, so the letters score as one unit with no new keys, no
engine change, and no change to any letter's appearance. A small drill group
makes the fix visible, since no shipped lesson practises these letters.

## Context

> ⚠️ Premise note: this fixes a real inconsistency but it is a narrow one, and
> it is not free. These letters appear in few everyday Nepali words, so most
> learners will never notice the change, and any prompt that does contain one
> will now report a lower WPM (words per minute, here units per minute) than
> the same prompt did before, because one letter counts once instead of three
> times. Stored history keeps the old number, so old and new scores are not
> comparable. We accepted that in exchange for one rule that holds everywhere
> in the app: a letter is one unit, no matter how many keys produce it. If the
> goal were instead to make these letters faster to type, nothing in this spec
> would help, because the keys are already the shortest honest spelling.

`src/domain/preeti.ts` scores by unit, and a unit is one entry of
`splitUnits`, the function that cuts a prompt into what gets compared against
what the learner typed. WPM is units per minute by design, stated in the file
header at `src/domain/preeti.ts:38` to `40`. `splitUnits` derives its clusters
from the values of `PREETI_MAP`, so a letter is one unit exactly when the map
has a row whose value is that whole letter.

The map already does this for every composed letter it can. `cf` produces `आ`
from two keys and scores as one unit. `km` produces `फ`, `lx` produces `हि`,
`f]` produces `ो`, `P]` produces `ऐ`, and `qm` produces `क्र`. The thirteen rare
conjuncts, and `ह्र`, have no row, so `splitUnits` cuts them into their
constituent parts: `ट्ट` reads as `["ट", "्", "ट"]` and `ह्र` as `["ह्", "र"]`.

A learner can still type them, and does, because the halant key `\` and the
matra keys are in the map. A BFS (breadth first search, trying every key in
turn) over `advancePreeti` confirmed all fourteen resolve to keystrokes whose
committed units match the prompt exactly: `6` `\` `6` for `ट्ट`, `X` `/` for
`ह्र`, and so on. Nothing is unreachable. The defect is purely one of
grouping, and it is the last place in the layout where a single letter costs
more than one unit.

The map is a flat table and the engine needs no change to accept a three key
row, which we verified rather than assumed. `advancePreeti` holds a buffer
while it is a prefix of some known sequence, and a buffer of `6\` is a prefix
of `6\6`, so the halant in the middle of the sequence does not break the match.
Adding `"6\\6": "ट्ट"` to a copy of the map and tracing it gave: `6` holds
pending, `6\` holds pending, `6\6` commits `["ट्ट"]`. Plain typing was
unaffected in the same trace, with `6s` still committing `["ट", "क"]` and a
lone `6` still committing `["ट"]`.

The legacy layout is not being improved here, it is being copied. No source
gives any of these fourteen a shorter spelling. The chart transcription
(`reference/preeti-keymap.ts`) claims plain keys only for two of them, and both
claims are wrong: `ङ्ख` on `x|` contradicts that same file's `ह` on `x` (`:77`)
and `्र` on `|` (`:142`), which compose to `ह्र`, and `ङ्क` on `X` collides with
`ह्`, which the app already uses (`src/domain/preeti.ts:125`). The
authoritative mirror (`reference/shuvayatra-preeti.ts`) lists all fourteen as
dead keys, and its post rules (`:451` to `:496`) contain no rule that collapses
a doubled consonant or drops an implied halant, which is why the three key
spelling is the honest one. Spec 0020 carries the full audit.

## Requirements

**User stories**:

- As a learner on the Traditional layout, I want a rare letter like `ट्ट` to
  count as the one letter it is, so my speed score reflects what I actually
  typed.
- As a contributor, I want the rule "a letter is one unit" to hold for every
  letter in the map, so nobody has to remember which ones are exceptions.

**Acceptance criteria**:

- **AC-1**: `PREETI_MAP` gains exactly these fourteen rows and no other change
  to any row. Each row is spelled only with keys already in the map, and the
  text a learner produces for any letter is byte for byte what it is today.

  | Letter | Keys        | First key becomes pending for one key |
  | ------ | ----------- | ------------------------------------- |
  | `ङ्ग`  | `,` `\` `u` | `,` (`ङ`)                             |
  | `ङ्ख`  | `,` `\` `v` | `,`                                   |
  | `ङ्क`  | `,` `\` `s` | `,`                                   |
  | `ङ्घ`  | `,` `\` `3` | `,`                                   |
  | `ङ्ढ`  | `,` `\` `9` | `,`                                   |
  | `ट्ट`  | `6` `\` `6` | `6` (`ट`)                             |
  | `ड्ड`  | `8` `\` `8` | `8` (`ड`)                             |
  | `ठ्ठ`  | `7` `\` `7` | `7` (`ठ`)                             |
  | `ट्ठ`  | `6` `\` `7` | `6`                                   |
  | `द्घ`  | `b` `\` `3` | `b` (`द`)                             |
  | `द्व`  | `b` `\` `j` | `b`                                   |
  | `हृ`   | `x` `[`     | `x` (`ह`)                             |
  | `रू`   | `/` `"`     | `/` (`र`)                             |
  | `ह्र`  | `X` `/`     | `X` (`ह्`)                            |

- **AC-2**: `splitUnits` returns each of the fourteen as exactly one unit, and
  feeding that row's keys through `advancePreeti` commits exactly that one
  unit and nothing else.
- **AC-3**: For each of the eight first keys that now become pending, a key
  that does not continue the sequence still commits the base letter, so plain
  typing is unchanged. `sequenceForPreeti` still round trips every value in the
  map, and every value stays unique.
- **AC-4**: The pending key never waits when the letter is already the one the
  prompt expects. Typing `b` where the prompt expects `द` commits `द` at once,
  and the same holds for `x` and `/`, pinned by a test for each.
- **AC-5**: Guidance still lights the right key at every step of a three key
  letter, so a learner is shown `6`, then `\`, then `6` for `ट्ट`, pinned by a
  test.
- **AC-6**: The existing test that expects a comma to commit `ङ` at once is
  updated to expect a pending comma, with a comment saying the change is
  deliberate, because `,` now also begins a three key letter.
- **AC-7**: A Traditional drill group exists whose tokens contain at least one
  of `द्व`, `ह्र`, and `ट्ट`, and `lintClassicDrills` reports no findings.
- **AC-8**: Stored attempts are not read, written, or migrated. A learner's
  existing WPM records stay exactly as they are, and the results screen keeps
  showing them unchanged.
- **AC-9**: The accepted regression is pinned by a test: after `6` `\` the
  buffer holds, and a following space is a miss that drops the keys, because
  no valid Nepali word contains a dead `ट`, `ङ`, `ड`, `ठ`, `द`, or `घ`.

## Options considered

### Option 1: Add the fourteen rows, spelled with the keys already used

One row per letter, no new physical keys, no engine change. The learner presses
exactly what they press today and the letter scores once.

**Pros**:

- Makes the layout obey one rule everywhere, which is the only reason the
  other composed letters already work that way.
- Cheapest real fix: one file, plus tests.
- Improves rendering slightly, because the shaper now receives a whole cluster
  instead of a bare halant between two letters.

**Cons**:

- Seven common letters become pending for one key, which is a small,
  invisible cost that depends on the session settling them early.
- One existing test has to change, and the shift in WPM makes old and new
  scores non comparable.

### Option 2: Leave the map alone and describe the letters as they are

Document in the header that these fourteen cost two or three units, and spend
the effort on lesson content instead.

**Pros**:

- Zero risk, zero behaviour change, nothing to migrate, no test to rewrite.
- Faithful to a reading of the legacy layout where the keystroke count is the
  honest measure.

**Cons**:

- Leaves `ट्ट` as the only letter in the app that costs three units, and the
  header keeps carrying an exception list that every future contributor has to
  read and respect.
- WPM stays inflated on any prompt containing one of these letters, which is
  the metric the learner is judged on.

### Option 3: Make the letters single units with invented shorter keys

Give each letter a new one or two key spelling, the way `km` gives `फ`.

**Pros**:

- Fastest possible typing for these letters, and the fewest units per prompt.

**Cons**:

- No source gives any of them such a spelling. It would teach a reflex the
  original software never had, on the strength of a chart row that contradicts
  its own table, and it would take keys away from letters that already have
  them. Spec 0020 rejected exactly this for `x|` and `?` plus `"`, and
  changing that answer here for speed alone would be inconsistent.

## Decision

**Chosen option**: Option 1: add the fourteen rows, spelled with the keys
already used.

No community skill shaped this decision. The change is a data edit to one pure
domain table, and the engine, the store, and the views stay as they are.

**Decisions I settled, with the runner up in each case**:

- **No engine change.** The existing prefix logic already commits a three key
  row as one unit. Runner up: a special case table consulted before the cut
  logic, which would have been strictly more code for the same result.
- **No view change.** `useTraditionalSession.ts:86` to `93` already walks a
  pending sequence key by key, so guidance lights `6`, then `\`, then `6` with
  no work. Runner up: extending `codeForNextUnit` to take the buffer, which
  would have duplicated logic the session already has.
- **No session change.** The early settle at `useTraditionalSession.ts:186` to
  `195` already hides the wait, so the accepted regression stays a pinned
  behaviour rather than becoming a new branch in the space path, which is the
  code that decides whether a keystroke counts as a mistake. Runner up: flush
  the longest exact prefix of an unflushable buffer on space, which would type
  a dead `ट` as two units at the cost of a new branch in the most safety
  critical code in the app.
- **Reph stays out.** It is a text reordering problem, not a letter, and the
  mirror stores it as a dead key anyway (`reference/shuvayatra-preeti.ts:134`).
  Runner up: fold it in, which would mix two unrelated mechanisms into one
  change.
- **Scope held to the fourteen.** The other composition only clusters found in
  the audit, `स्व`, `त्व`, `श्व`, `स्त्र`, `न्त्र`, `द्र`, `दृ`, `क्व`, `ज्व`, are
  left alone, because `द्र` and `दृ` are common enough that folding them in
  would change the scoring of ordinary words inside a change about rare ones.
  Runner up: include them, which is more consistent but a much wider blast
  radius for no gain on the letters this spec is about.

## Rationale

The force that settled this is the one already inside the codebase. `cf` gives
`आ` from two keys and counts as one unit, `lx` gives `हि` from two keys and
counts as one unit, and the file header states plainly that long vowels and
composed marks are handled as data rather than as new engine logic. Fourteen
letters sitting outside that rule is not a design position anyone chose; it is
what fell out of never adding the rows. Option 1 makes the table match the rule
the file already claims to follow, and it does so with the shortest spelling
the legacy layout actually supports, which is why no key changes.

Option 2 was the serious alternative and it is defensible on faithfulness. It
loses because the cost of the status quo is not zero: it keeps fourteen
exceptions alive in the one file every contributor reads, and it keeps WPM
wrong on any prompt that uses them, for a layout whose entire purpose is
teaching someone to type those letters well. Option 3 loses on evidence, not
on taste. The one chart row that offers a plain key for `ङ्ख` is contradicted
by two other rows of the same table, and no source at all offers one for the
other thirteen.

The measured blast radius is what made this comfortable. We patched twelve of
the rows into the real map and ran the whole suite: one existing test failed,
the comma one, and nothing else moved. No snapshot changed, no lesson test
changed, the drill linter stayed quiet, and `splitUnits("अङ्कहरू")` went from
seven units to five while the learner still typed the same three keys. For a
change that touches scoring, that is about as small as it gets, and it is
revertible with a single commit.

## Feature design

**Data model sketch**: no new entity and no schema change. The target is
fourteen rows in `PREETI_MAP`, each mapping a key sequence to one letter. The
sequence is a string of one to three literal keys, all of which already exist
as keys in the map. `SEQUENCES` and `CLUSTERS` are derived from the map at
module load (`src/domain/preeti.ts:206` to `211`), so no other wiring is
needed and nothing reads the new rows at build time. Unique constraint: one
value per sequence and one sequence per value, already enforced by the test at
`tests/domain/preeti.test.ts:61`.

**State transitions**: none. The buffer state machine in `advancePreeti` is
unchanged, and no row adds a new transition; a three key row uses the existing
hold, hold, commit path.

**Interface surface** (a local domain library, not a network API, so the
consumers are named instead of endpoints):

| Export                          | Change                                    | Consumer                                                          |
| ------------------------------- | ----------------------------------------- | ----------------------------------------------------------------- |
| `PREETI_MAP`                    | fourteen rows added                       | everything below, by derivation                                   |
| `splitUnits`                    | none, derives new clusters                | `useTraditionalSession`, `classicDrills`, lesson tests            |
| `advancePreeti`                 | none                                      | `useTraditionalSession`                                           |
| `exactCommitPreeti`             | none                                      | `useTraditionalSession` space path and end of prompt flush        |
| `sequenceForPreeti`             | none, now answers for fourteen more units | `useTraditionalSession` guidance, `classicLayout.codeForNextUnit` |
| `calcWpm`, `calcAccuracy`       | none                                      | `useTraditionalSession`, results                                  |
| `useTraditionalSession`         | no code change, behaviour only            | typing view                                                       |
| `classicLayout.codeForNextUnit` | no change                                 | keyboard view                                                     |

**Value sourcing** (every value an acceptance criterion needs, and where it
comes from):

| Value produced or displayed                                | Source                                                                             |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| which keys a letter is typed with                          | the row's sequence in `PREETI_MAP`                                                 |
| that a letter is one unit                                  | derived: `CLUSTERS` from map values, `src/domain/preeti.ts:209` to `211`           |
| the next letter the prompt expects                         | `splitUnits(prompt)` in `useTraditionalSession`                                    |
| the key to light at each step                              | `sequenceForPreeti` plus the pending buffer, `useTraditionalSession.ts:86` to `93` |
| that a pending key commits at once when it already matches | the early settle branch, `useTraditionalSession.ts:186` to `195`                   |
| WPM and accuracy                                           | `calcWpm` over `countCorrectUnits`, unchanged                                      |
| stored historical WPM                                      | `Attempt.wpm` in the local store, read only, untouched                             |
| drill tokens are valid                                     | `lintClassicDrills`, `src/domain/classicDrills.ts:371`                             |

**Key invariants**:

- One letter, one unit, for every value in the map. A new row whose value is
  not a whole letter, or a second row for a letter that already has one,
  breaks this.
- A row may only use keys that already exist in the map, so the physical board
  never grows a key for this feature.
- The first two keys of a three key row must be a prefix of the row itself. If
  they are not, the buffer cannot hold through them and the row can never
  commit. Every row in AC-1 satisfies this because the halant is the second
  key.
- The text produced for any prompt is byte for byte identical before and after.
  Only the grouping into units changes, and grouping is what this spec is for.
- Values stay unique and `sequenceForPreeti` round trips, so the reverse lookup
  used for guidance never returns the wrong keys.

**Security model**: none applies. This is an on device app with no accounts, no
network calls, and no user data beyond a local score store, and this change
reads nothing and writes nothing outside the source file.

**Critical test scenarios**:

- Happy path: for each of the fourteen rows, feed its keys through
  `advancePreeti` and assert the commits are exactly `[letter]` and the buffer
  is empty, and assert `splitUnits(letter)` is `[letter]`. Verifies **AC-1**,
  **AC-2**.
- Plain typing unchanged: for each of the eight first keys, feed it plus a key
  that does not continue the sequence and assert the base letter commits
  first, plus the existing uniqueness and round trip test. Verifies **AC-3**.
- The wait never shows: assert that typing `b` against a prompt expecting `द`
  commits `द` immediately rather than holding, and the same for `x` and `/`.
  Verifies **AC-4**.
- Guidance steps: assert the lit key for `ट्ट` is `6` with an empty buffer, `\`
  after `6`, and `6` after `6\`. Verifies **AC-5**.
- The accepted regression: assert that after `6` `\` the buffer is `6\`, that
  `exactCommitPreeti("6\\")` is null, and that a space at that point is a miss.
  Verifies **AC-9**.
- Existing test updated: the comma case now expects `{ commits: [], buffer:
",", error: false }` with a comment saying it is deliberate. Verifies
  **AC-6**.
- Drill content: assert the new group's prompts contain at least one of `द्व`,
  `ह्र`, `ट्ट`, and that `lintClassicDrills` returns no findings. Verifies
  **AC-7**.
- No data change: assert the store layer is untouched, which here means no code
  change at all outside the map, the drill group, and tests. Verifies **AC-8**.

## Build plan

Skateboard, the project default: the thinnest whole that works, then grow it.
The map rows are that whole, and the drill group is what makes it visible, so
the rows land first and alone, the tests lock the behaviour, and content last.

1. Add the fourteen rows to `PREETI_MAP` in `src/domain/preeti.ts`, in the
   conjunct section, each with a short comment saying it is the three key
   spelling of that letter and that no source gives it a shorter one. Satisfies
   **AC-1**, **AC-2**.
2. Update the comma expectation in `tests/domain/preeti.test.ts` to a pending
   comma, with a comment naming this spec as the reason. Satisfies **AC-6**.
3. Add the new tests: the fourteen rows end to end, plain typing for the eight
   first keys, the early settle for `b`, `x`, and `/`, the guidance steps for
   `ट्ट`, and the accepted stuck buffer. Satisfies **AC-2**, **AC-3**, **AC-4**,
   **AC-5**, **AC-9**.
4. Add one Traditional drill group to `src/domain/classicDrills.ts` whose
   tokens use `द्व` (from `द्वारा`, `द्वि`), `ह्र` (from `हृदय`), and `ट्ट` (from
   `ट्टा`), keeping the existing rules the linter enforces: no standalone `ि`
   and no back to back repeats. Satisfies **AC-7**.
5. Run lint, format check, typecheck, and the full suite. Confirm no snapshot
   changed and that no file outside `src/domain/preeti.ts`,
   `src/domain/classicDrills.ts`, and the tests was modified. Satisfies
   **AC-8**.

## Consequences

**Positive**:

- One rule holds across the whole layout: a letter is one unit, however many
  keys produce it. The header's exception list shrinks to reph alone.
- WPM stops counting a `ट्ट` as three letters, so the score matches what the
  learner typed.
- The learner sees the right key at every step of a three key letter, with no
  view change, because the session already walked pending sequences.
- The shaper receives a whole cluster for these letters, which is a small
  rendering improvement over a bare halant between two letters.

**Negative / tradeoffs**:

- Eight keys now hold for one keystroke before committing: `,` `6` `8` `7`
  `b` `x` `/` `X`, which are the letters `ङ` `ट` `ड` `ठ` `द` `ह` `र` plus the
  half form `ह्`. We expect the early settle to hide this, but
  that is the one claim here we cannot prove from a unit test alone, and it is
  worth watching in the real app.
- A prompt containing one of these letters reports a lower WPM after this
  change than before, and stored history keeps the old number, so a learner's
  trend across the change mixes two scales. We chose not to migrate or relabel
  anything, so this is visible in the numbers rather than hidden.
- One existing test changes meaning, from "a comma commits at once" to "a comma
  holds", which future readers will find surprising without the comment.
- An unflushable pending buffer now exists where none did before, so a learner
  who mistypes one of those letters and then presses space loses the keys and
  takes a miss. We judged this acceptable because no valid Nepali word
  contains a dead `ट`, `ङ`, `ड`, `ठ`, `द`, or `घ`, and we pinned it with a
  test rather than leaving it to be discovered.
- The fix is invisible to a learner who never types one of these letters, which
  is most of them. The drill group exists to make it visible.

**Neutral**:

- No stored data changes and no migration. Revert is a single commit with
  nothing to clean up.
- The Romanized layout is untouched, since it has no conjuncts.
- Spec 0020's audit of these letters still stands; this spec changes what the
  app does with them, not what the sources say about them.

## Follow-up

- [ ] Watch the one key wait in the real app on the Traditional layout, typing
      ordinary words that start with `द`, `ह`, and `र`. If the early settle
      ever fails to fire, revisit **AC-4** before anything else.
- [ ] Point spec 0020's scoring follow up at this spec, and leave 0020's own
      coverage test and transcription fixes as they are.
- [ ] Decide separately whether the other composition only clusters (`स्व`,
      `त्व`, `श्व`, `स्त्र`, `न्त्र`, `द्र`, `दृ`, `क्व`, `ज्व`) should also score
      as one unit. Same mechanism, wider effect, and `द्र` and `दृ` are common
      enough to deserve their own decision.
- [ ] Lesson coverage for the remaining letters that have no everyday word
      (`ङ्ग`, `ङ्ख`, `ङ्घ`, `ङ्ढ`, `द्घ`, `रू`), appended rather than editing
      shipped prompts.
