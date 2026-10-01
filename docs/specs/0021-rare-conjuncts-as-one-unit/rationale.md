# 0021. Score rare conjuncts as one unit: rationale

The decision record for spec 0021. The build spec next door is
`index.md`; this file is history and reasoning, not build input.

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
>
> The WPM part of that note is smaller than it reads. No prompt a learner can
> reach today contains one of these letters, so no stored score actually
> changes scale. That is luck, not design, and the note stays because the day
> a lesson screen exists the problem arrives with it.

`src/domain/preeti.ts` scores by unit, and a unit is one entry of
`splitUnits`, the function that cuts a prompt into what gets compared against
what the learner typed. WPM is units per minute by design, stated in the file
header at `src/domain/preeti.ts:38` to `41`. `splitUnits` derives its clusters
from the values of `PREETI_MAP`, so a letter is one unit exactly when the map
has a row whose value is that whole letter.

The map already does this for every composed letter it can. `cf` produces `आ`
from two keys and scores as one unit. `km` produces `फ`, `lx` produces `हि`,
`f]` produces `ो`, `P]` produces `ऐ`, and `qm` produces `क्र`. The thirteen
rare conjuncts and `रू` have no row, so `splitUnits` cuts them into their
constituent parts: `ट्ट` reads as `["ट", "्", "ट"]` and `ह्र` as `["ह्", "र"]`.
Eleven of the fourteen cost three units today and three (`हृ`, `रू`, `ह्र`)
cost two.

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
and `्र` on `|` (`:148`), which compose to `ह्र`, and `ङ्क` on `X` collides with
`ह्`, which the app already uses (`src/domain/preeti.ts:126`) and the chart
itself prints on `X` (`reference/preeti-keymap.ts:133`). The authoritative
mirror (`reference/shuvayatra-preeti.ts`) lists thirteen of the fourteen as
dead keys; the fourteenth, `ह्र`, it does not carry at all, because it composes
from the two live keys `X` and `/` that the app already uses. Its post rules
(`:451` to `:496`) contain no rule that collapses a doubled consonant or drops
an implied halant, which is why the three key spelling is the honest one.
Spec 0020 carries the full audit.

### Where a learner can actually reach a prompt

This is the constraint that decided the content half of the change, and it was
not obvious until the shipping app was traced end to end.

`lessonsForClassic` returns every bundled row matching a screen, a level, and a
layout, and `ClassicScreen.tsx:170` takes `hits[0]`, so the classic screen shows
exactly one drill row per slot. The shell offers four lesson screens and three
levels (`ClassicShell.tsx:7`, `:67`), so there are twelve slots per layout and
`TRADITIONAL_SPECS` already fills all twelve. A thirteenth row is content no
learner can open: it passes the linter, it passes every test, and it is
invisible. The same one row per slot rule means the only way to make new
content reachable is to put it inside a row that already occupies a slot.

The `nt-*` lesson prompts are not a way out. `App.tsx` renders the classic shell
and the settings screen and nothing else, the lessons menu in `ClassicShell` is
the same four drill screens, and the game screen keeps only the `qwerty` and
`romanized` layouts (`App.tsx:37`). So all twenty six Traditional lessons,
including `nt-common-words-a` and the `गाह्रो` inside it, are bundled data with
no route from the interface. `nt-common-words-a` is sixty three units today and
sixty two after this change, which is true of the file and invisible to every
learner. This spec therefore cannot lean on lesson prompts as coverage for
`ह्र`, and the lesson follow up is blocked on a lessons screen that does not
exist.

## Options considered

### Option 1: Add the fourteen rows, spelled with the keys already used

One row per letter, no new physical keys, no engine change. The learner presses
exactly what they press today and the letter scores once.

**Pros**:

- Makes the layout obey one rule everywhere, which is the only reason the
  other composed letters already work that way.
- Cheapest real fix: one file, plus tests.
- One less thing to explain: the header's exception paragraph shrinks to reph
  alone.

**Cons**:

- Seven common letters become pending for one key, eight keys in all once the
  `ह्` half form is counted, which is a small, invisible cost that depends on
  the session settling them early.
- Two existing test expectations change, not one, and the shift in WPM makes
  old and new scores non comparable.

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

### A second question: how the content reaches a learner

The map decision above settles scoring. It says nothing about making the fix
visible, and the first draft of this spec answered that question with a new
drill row, which the reachability rule in `## Context` rules out. Four real
routes exist.

**Option 4: Fold the letters into an occupied drill row.** Add rare conjunct
tokens to the All Level 1 Traditional row.

- **Pros**: reachable on the next build with no interface work, no new slot,
  and the least test churn of any route, since no row is added and the meta
  table, the row counts, and the layout screens all stay as they are. The
  thirty repeat count means the learner meets each new letter many times, which
  is what a three key spelling needs.
- **Cons**: the All Level 1 row stops being pure cross row key practice, and a
  learner who wants ordinary words still has nowhere to go, because that screen
  is the only one they can reach.

**Option 5: Add a thirteenth row and let the screen list the rows in a slot.**

- **Pros**: the rare letters get their own row and their own place on the
  screen, and the content stays separate from cross row practice.
- **Cons**: it needs a row picker that the Win95 style screen has no room for,
  it adds a selection concept to the one screen every drill passes through, and
  it is interface work paid for a change that is invisible without it anyway.

**Option 6: Add a fourth level or a new screen.**

- **Pros**: the letters get a home of their own with no new interaction model.
- **Cons**: four levels or five screens is a much larger product statement than
  a scoring fix earns, it changes the drill grid for every layout including
  English, and it needs its own design and its own spec.

**Option 7: Ship the map rows with no content at all.**

- **Pros**: the smallest possible change, one file plus tests, and nothing to
  dilute any existing row.
- **Cons**: the fix stays invisible, which is the one promise this spec makes
  beyond the scoring rule. The letters are still reachable inside real words, so
  the fix is not dead code, but nothing in the app ever asks for them.

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

The measured blast radius is what made this comfortable. The fourteen rows were
patched into the real map and the whole suite run. Two existing expectations
failed, the comma one and the spec 0020 `ह्र` split, and nothing else moved:
272 tests passed, no snapshot changed, no lesson test changed, the drill linter
stayed quiet, all 147 map values stayed unique with a working reverse lookup,
`splitUnits("अङ्कहरू")` went from seven units to four while the learner still
typed the same three keys, and `nt-common-words-a` went from 63 to 62. Each of
the fourteen rows commits exactly its own letter and nothing else, and
`exactCommitPreeti` returns null for exactly the five halant buffers **AC-9**
names. For a change that touches scoring, that is about as small as it gets,
and it is revertible with a single commit.

The content half was corrected by the same kind of reading, and it changed the
answer. The first draft proposed a new drill group on the strength of the
`## Requirements` text alone. Tracing how a prompt reaches a screen showed the
classic screen shows one row per slot, that all twelve slots are taken, and
that a thirteenth row is content no learner can open. Option 5 and Option 6
could make a new row reachable, but both spend interface work from a scoring
fix, and the drill grid change in Option 6 would touch every layout including
English. Option 4 puts the letters in a row that is already reachable, in the
one shape they can take without a dictionary, and it is the only route whose
cost is confined to this spec. Option 7 was the honest alternative and it is
strictly smaller, but it leaves the app never asking for the fourteen letters,
which is the promise this spec makes after the scoring rule.
