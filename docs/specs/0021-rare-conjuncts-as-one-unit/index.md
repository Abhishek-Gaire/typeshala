# 0021. Score rare conjuncts as one unit

**Date**: 2026-09-25
**Status**: In Progress
**Revised**: 2026-09-30. The map decision held up under a live run of the
fourteen rows, and so did every criterion except the one about content.
That criterion added a thirteenth drill row, which no learner can reach, and
two claims rested on lesson prompts the app has no route to. The content now
folds into the All Level 1 Traditional row, a tenth criterion covers the
reference note that records these letters, and a new invariant stops a future
row from being added as unreachable content.

## Summary

Thirteen rare conjuncts in the Traditional (Preeti) layout, plus the rare
vowel `रू`, are typeable today but score as two or three units each, so a
learner who types one of them perfectly is credited for three letters. Every
other composed letter in the app already scores as one, so these are the only
inconsistency left. This spec adds fourteen rows to the key map, each spelled
with the same keys the learner already presses, so the letters score as one
unit with no new keys, no engine change, and no change to the shape of any
letter. To make the fix visible, the letters join the drill tokens of the All
Level 1 Traditional row, which is one of the twelve rows a learner can
actually open, rather than a new row of their own.

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
- **AC-7**: The rare conjuncts are drilled from a row that already occupies a
  slot, which today means the token list of `cl-all-1-tr`, the All Level 1
  Traditional row. Its token list gains tokens carrying at least one of `ट्ट`,
  `द्व`, and `हृ`, built in the same pseudo keyboard style as its current
  tokens rather than as dictionary words. The row keeps its category, its
  difficulty, its thirty repeat count, and its position in the spec list, so
  it stays the row the All Level 1 screen opens, and `lintClassicDrills`
  reports no findings. No new drill row is added. `ह्र` is deliberately not
  required: no everyday Nepali word carries it.
- **AC-8**: Stored attempts are not read, written, or migrated. A learner's
  existing WPM records stay exactly as they are, and the results screen keeps
  showing them unchanged.
- **AC-9**: The accepted regression is pinned by a test: after `6` `\` the
  buffer holds, and a following space is a miss that drops the keys, because
  no valid Nepali word contains a dead `ट`, `ङ`, `ड`, `ठ`, or `द`. Those five
  are the only bases the new rows leave holding before a halant; `x`, `/`,
  and `X` still flush on space because `ह`, `र`, and `ह्` are exact map rows.
- **AC-10**: `preeti-keymap-differences.md` stops calling these fourteen
  multi unit. Its "Single unit" column reads yes for all fourteen rows, the
  sentence that calls the fix open as this spec is rewritten to say the rows
  ship, and the reph row keeps its "n/a".

## Decision

**Chosen option**: Option 1: add the fourteen rows, spelled with the keys
already used.

**Chosen content route**: Option 4: fold the letters into the All Level 1
Traditional row, `cl-all-1-tr`.

No community skill shaped this decision. The change is a data edit to one pure
domain table, and the engine, the store, and the views stay as they are.

**Decisions I settled, with the runner up in each case**:

- **No engine change.** The existing prefix logic already commits a three key
  row as one unit. Runner up: a special case table consulted before the cut
  logic, which would have been strictly more code for the same result.
- **No view change.** `useTraditionalSession.ts:86` to `93` already walks a
  pending sequence key by key, so guidance lights `6`, then `\`, then `6` with
  no work. Runner up: extending `codeForNextUnit` to take the buffer, which
  would have duplicated logic the session already has. The on screen keyboard
  needs nothing either, because `ClassicScreen.expectedKeyCode()` (`:233` to
  `:237`) reads the session hint rather than `codeForNextUnit`, which is only
  the fallback in `ClassicKeyboard.tsx:47`.
- **No session change.** The early settle at `useTraditionalSession.ts:186` to
  `195` already hides the wait, so the accepted regression stays a pinned
  behaviour rather than becoming a new branch in the space path, which is the
  code that decides whether a keystroke counts as a mistake. Runner up: flush
  the longest exact prefix of an unflushable buffer on space, which would type
  a dead `ट` as two units at the cost of a new branch in the most safety
  critical code in the app.
- **Content folds into `cl-all-1-tr`, not a new row.** The reachability rule in
  `## Context` makes a thirteenth row dead content. Among the rows a learner
  can open, All Level 1 is the one whose tokens are already pseudo keyboard
  strings rather than words, which is the only shape these letters can take
  without a dictionary, and its thirty repeats are what a three key spelling
  needs. Runner up: All Level 2, which shares the shape but repeats ten times
  and offers half the practice.
- **One new test, not a new row guard elsewhere.** A test asserts that each
  screen and level pair returns exactly one Traditional row, so the next person
  to add a row finds out in the suite that they added unreachable content.
  Runner up: leaving the guard out and trusting the note in this spec.
- **The reference note is part of the change.** `preeti-keymap-differences.md`
  is the file a contributor opens to learn the status of these letters, and it
  currently states the opposite of what the rows do. Runner up: leaving it for
  a later sync pass, which leaves the repo asserting a falsehood for a release.
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

**Rationale**: the decision record (context, options, rationale) lives in
[`rationale.md`](rationale.md). `/develop` builds from this file only.

## Feature design

**Data model sketch**: no new entity and no schema change. The target is
fourteen rows in `PREETI_MAP`, each mapping a key sequence to one letter. The
sequence is a string of one to three literal keys, all of which already exist
as keys in the map. `SEQUENCES` and `CLUSTERS` are derived from the map at
module load (`src/domain/preeti.ts:207` to `212`), so no other wiring is
needed and nothing reads the new rows at build time. Unique constraint: one
value per sequence and one sequence per value, already enforced by the test at
`tests/domain/preeti.test.ts:61`.

**State transitions**: none. The buffer state machine in `advancePreeti` is
unchanged, and no row adds a new transition; a three key row uses the existing
hold, hold, commit path.

**Interface surface** (a local domain library, not a network API, so the
consumers are named instead of endpoints):

| Export                          | Change                                    | Consumer                                                                     |
| ------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------- |
| `PREETI_MAP`                    | fourteen rows added                       | everything below, by derivation                                              |
| `splitUnits`                    | none, derives new clusters                | `useTraditionalSession`, `classicDrills`, lesson tests                       |
| `advancePreeti`                 | none                                      | `useTraditionalSession`                                                      |
| `exactCommitPreeti`             | none                                      | `useTraditionalSession` space path and end of prompt flush                   |
| `sequenceForPreeti`             | none, now answers for fourteen more units | `useTraditionalSession` guidance, `ClassicScreen.expectedKeyCode`            |
| `calcWpm`, `calcAccuracy`       | none                                      | `useTraditionalSession`, results                                             |
| `useTraditionalSession`         | no code change, behaviour only            | typing view                                                                  |
| `classicLayout.codeForNextUnit` | no change                                 | keyboard fallback only, `ClassicKeyboard.tsx:47`                             |
| `TRADITIONAL_ALL_L1_TOKENS`     | three or more tokens added                | `cl-all-1-tr`, exported and asserted in `tests/domain/classicDrills.test.ts` |

**Value sourcing** (every value an acceptance criterion needs, and where it
comes from):

| Value produced or displayed                                | Source                                                                             |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| which keys a letter is typed with                          | the row's sequence in `PREETI_MAP`                                                 |
| that a letter is one unit                                  | derived: `CLUSTERS` from map values, `src/domain/preeti.ts:210` to `212`           |
| the next letter the prompt expects                         | `splitUnits(prompt)` in `useTraditionalSession`                                    |
| the key to light at each step                              | `sequenceForPreeti` plus the pending buffer, `useTraditionalSession.ts:86` to `93` |
| that a pending key commits at once when it already matches | the early settle branch, `useTraditionalSession.ts:186` to `195`                   |
| WPM and accuracy                                           | `calcWpm` over `countCorrectUnits`, unchanged                                      |
| stored historical WPM                                      | `Attempt.wpm` in the local store, read only, untouched                             |
| drill tokens are valid                                     | `lintClassicDrills`, `src/domain/classicDrills.ts:371`                             |
| which drill row a screen opens                             | `lessonsForClassic` first match, `src/features/classic/ClassicScreen.tsx:170`      |
| the rare conjunct tokens themselves                        | `TRADITIONAL_ALL_L1_TOKENS`, `src/domain/classicDrills.ts:197`                     |
| that each slot holds exactly one row                       | a new assertion over `lessonsForClassic`, one per screen and level                 |
| the status of these fourteen letters in the reference note | `preeti-keymap-differences.md`, the "Single unit" column at `:188` to `:203`       |

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
- Every screen and level pair keeps exactly one Traditional drill row. A second
  row in a filled slot is unreachable content, so it is a defect even though
  no test would otherwise fail.

**Security model**: none applies. This is an on device app with no accounts, no
network calls, and no user data beyond a local score store, and this change
reads nothing and writes nothing outside three source files and the tests.

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
- Existing tests updated: the comma case now expects `{ commits: [], buffer:
",", error: false }` with a comment saying it is deliberate, and the spec
  0020 `ह्र` case now expects `splitUnits("ह्र")` and `typeKeys("X/")` to be
  `["ह्र"]`, keeping its `x|` assertion. Verifies **AC-6**.
- The `COMPOSITION_ROWS` coverage block at `tests/domain/preeti.test.ts:249`
  needs no edit: it asserts `typeKeys(keys)` equals `splitUnits(unit)`, which
  holds before and after because both sides move together. Its comment should
  say the rows are now map rows rather than a reachability probe, so the next
  reader does not read it as a claim that they are still split. Verifies
  **AC-2**.
- Drill content: assert the All Level 1 Traditional row carries `ट्ट`, `द्व`,
  and `हृ`, that it is still the row `lessonsForClassic` returns for that
  screen and level, that `lintClassicDrills` returns no findings, and that
  every screen and level pair returns exactly one Traditional row. Verifies
  **AC-7**.
- Reference note: no test, this is prose. **AC-10** is checked by reading the
  updated table, and the Follow-up names the file so a sync pass keeps it.
- No data change: assert the store layer is untouched, which here means no code
  change at all outside the map, the header comment, the drill token list, the
  reference note, and the tests. Verifies **AC-8**.

## Build plan

Skateboard, the project default: the thinnest whole that works, then grow it.
The map rows are that whole, and the drill tokens are what make them visible,
so the rows land first and alone, the tests lock the behaviour, and content
last.

1. [x] Add the fourteen rows to `PREETI_MAP` in `src/domain/preeti.ts`, in the
       conjunct section, each with a short comment saying it is the three key
       spelling of that letter and that no source gives it a shorter one. Satisfies
       **AC-1**, **AC-2**.
2. [x] Rewrite the header exception paragraph at `src/domain/preeti.ts:29` to `36`
       so it no longer calls these letters "deliberately left out as single
       units", leaving reph as the only exception and pointing here for the rest.
       Satisfies the Consequences claim about the header.
3. [x] Update the two existing expectations in `tests/domain/preeti.test.ts`: the
       comma case at `:163` to a pending comma with a comment naming this spec as
       the reason, and the spec 0020 `ह्र` case at `:281` to `:282` to expect one
       unit, keeping the `x|` assertion at `:283`. Satisfies **AC-6**.
4. [x] Add the new tests: the fourteen rows end to end, plain typing for the eight
       first keys, and the stuck buffer plus its null `exactCommitPreeti` in
       `tests/domain/preeti.test.ts`; the early settle for `b`, `x`, and `/`, the
       guidance steps for `ट्ट`, and the space-is-a-miss at `6\` in
       `tests/features/typing/useTraditionalSession.test.tsx`, where that hook is
       already covered. Satisfies **AC-2**, **AC-3**, **AC-4**, **AC-5**, **AC-9**.
5. [x] Add rare conjunct tokens to `TRADITIONAL_ALL_L1_TOKENS` in
       `src/domain/classicDrills.ts`, at least one carrying `ट्ट`, one `द्व`, and
       one `हृ`, built from the row's existing pseudo keyboard style rather than
       from dictionary words, and rewrite that list's comment so it no longer
       describes only cross row pairs. No row is added, so the category, the
       difficulty, the order, the repeat count, `EXPECTED_META`, and both
       `toHaveLength(12)` assertions all stay as they are. Satisfies **AC-7**.
6. [x] Update the three exact token count expectations in
       `tests/domain/classicDrills.test.ts` for the new count: the token length and
       distinct count in the All Level 1 block at `:114` to `:117`, the exact
       `TRADITIONAL_ALL_L1_TOKENS` list at `:257` to `:268`, and the totals table
       entry for `cl-all-1-tr` at `:205`. Add one test asserting that each screen
       and level pair returns exactly one Traditional row, so a future row cannot
       be added as unreachable content. The linter
       (`lintClassicDrills`, which only checks the difficulty rule) must stay
       quiet, and the row must also satisfy the test level rules in that file: no
       standalone `ि`, no back to back repeats above L1. Satisfies **AC-7**.
7. [x] Update `preeti-keymap-differences.md`: the "Single unit" column reads yes for
       all fourteen rows, the surrounding sentence says the rows ship rather than
       that the fix is open, and the reph row keeps its `n/a`. Satisfies
       **AC-10**.
8. [x] Run lint, format check, typecheck, and the full suite. The map rows change
       no snapshot, but the drill token list does, because
       `tests/domain/classicDrills.test.ts:137` snapshots `ALL_CLASSIC_DRILLS`;
       update that snapshot deliberately and confirm no file outside
       `src/domain/preeti.ts`, `src/domain/classicDrills.ts`,
       `preeti-keymap-differences.md`, and the tests was modified. Satisfies
       **AC-8**.

## Consequences

**Positive**:

- One rule holds across the whole layout: a letter is one unit, however many
  keys produce it. The header's exception list shrinks to reph alone.
- WPM stops counting a `ट्ट` as three letters, so the score matches what the
  learner typed.
- The learner sees the right key at every step of a three key letter, with no
  view change, because the session already walked pending sequences.

**Negative / tradeoffs**:

- Eight keys now hold for one keystroke before committing: `,` `6` `8` `7`
  `b` `x` `/` `X`, which are the letters `ङ` `ट` `ड` `ठ` `द` `ह` `र` plus the
  half form `ह्`. We expect the early settle to hide this, but
  that is the one claim here we cannot prove from a unit test alone, and it is
  worth watching in the real app.
- A prompt containing one of these letters reports a lower WPM after this
  change than before, and stored history keeps the old number, so a learner's
  trend across the change mixes two scales. We chose not to migrate or relabel
  anything, so this is visible in the numbers rather than hidden. It is not
  felt today, because no prompt a learner can reach contains one of these
  letters: the twenty six Traditional lessons that would be affected have no
  route from the interface, and the one that does contain `ह्र` is
  `nt-common-words-a`, which goes from 63 units to 62 in the data file while
  remaining unopenable.
- Two existing tests change meaning: "a comma commits at once" becomes "a comma
  holds", and "ह्र splits as `ह्` plus `र`" becomes "ह्र is one unit". Future
  readers will find both surprising without the comments.
- An unflushable pending buffer now exists where none did before, so a learner
  who mistypes one of those letters and then presses space loses the keys and
  takes a miss. Only the five halant rows are exposed, since `x`, `/`, and `X`
  still flush exactly. We judged this acceptable because no valid Nepali word
  contains a dead `ट`, `ङ`, `ड`, `ठ`, or `द`, and we pinned it with a test
  rather than leaving it to be discovered.
- Error highlighting gets coarser for these letters: a missed `ट्ट` is one red
  span instead of three, because the view colors per unit. The text and the
  verdict are unchanged, only the width of the red.
- The fix is invisible to a learner who never types one of these letters, which
  is most of them. The All Level 1 tokens are what make it visible, and they
  help only a learner who reaches that screen.
- The All Level 1 Traditional row stops being pure cross row key practice. It
  now carries rare conjuncts, so a learner working that row is practising a
  different thing at the start of it, and the row grows from nine tokens toward
  twelve. A row of its own would have been one nobody can open.

**Neutral**:

- No stored data changes and no migration. Revert is a single commit with
  nothing to clean up.
- The Romanized layout is untouched, since it has no conjuncts.
- The drill grid is untouched: still four screens, three levels, twelve rows
  per layout. Nothing about the classic screen changes.
- Spec 0020's audit of these letters still stands; this spec changes what the
  app does with them, not what the sources say about them. One of its claims
  is now known to be wrong and is flagged in the Follow-up.

## Follow-up

- [ ] Watch the one key wait in the real app on the Traditional layout, typing
      ordinary words that start with `द`, `ह`, and `र`. If the early settle
      ever fails to fire, revisit **AC-4** before anything else.
- [ ] Lesson coverage for the letters that reach no shipped prompt
      (`ङ्ग`, `ङ्ख`, `ङ्क`, `ङ्घ`, `ङ्ढ`, `ट्ट`, `ड्ड`, `ठ्ठ`, `ट्ठ`, `द्घ`, `द्व`,
      `हृ`, `रू`), appended rather than editing shipped prompts. This one is
      blocked, not just open: the lesson prompts have no screen to live on
      (`App.tsx:16` has two views, and the lessons menu in `ClassicShell` is the
      four drill screens). A lessons screen is the prerequisite, and it is its
      own decision. `ह्र` is the exception and sits inside `गाह्रो` in
      `nt-common-words-a`; `ङ्क` and `रू` appear in lesson titles only.
- [ ] Decide separately whether the other composition only clusters (`स्व`,
      `त्व`, `श्व`, `स्त्र`, `न्त्र`, `द्र`, `दृ`, `क्व`, `ज्व`) should also score
      as one unit. Same mechanism, wider effect, and `द्र` and `दृ` are common
      enough to deserve their own decision. Note that none of them is a map row
      today either, so that decision also changes the All row content the same
      way this one does.
- [ ] Correct spec 0020's claim that `स्व` (`:j`), `स्त्र` (`;q`), and `द्र`
      (`b|`) are shipped single units. They are not: `स्व` and `स्त्र` split as
      two units and `द्र` splits as `["द", "्र"]`, which
      `preeti-keymap-differences.md` already records. The audit is otherwise
      sound and 0020 stays `Accepted`; this is one sentence in its `## Summary`.
- [ ] Confirm the one claim no unit test can prove, named in Consequences: that
      the early settle hides the one key wait on the real layout, across the
      session hook, the classic screen, and the touch board.
