# 0017. Dynamic classic drill generation

**Date**: 2026-09-19
**Status**: Accepted

## Summary

The classic drill prompts in `src/domain/classicDrills.ts` are long hand written strings. This spec replaces them with a small generator. English rows are built from the physical key set of each screen (Home, Top, Bottom, All) plus a rule per level. Traditional rows stay as explicit token groups with a repeat count. Row ids and order do not change, so saved progress keeps working.

A group is emitted `repeat` times. A group holds one or more space separated tokens. Level 1 groups hold two tokens (the two tripled pair members). Level 2, Level 3, and Traditional groups hold one token.

## Context

Spec 0012 shipped the classic shell and bundled every drill as a literal `prompt` string. Specs 0013 and 0015 then locked the content pattern, and both already note that the content is "generatable from a stated rule". The code never took that step: each row repeats its groups by hand, so the file holds thousands of duplicate tokens and is easy to get wrong.

The drift is real and already shipped, in both layouts:

- English `cl-all-2-en` carries a stray `nm` token.
- English Level 1 under repeats: `cl-top-1-en` runs every group 9 times, `cl-bottom-1-en` runs the first pair 10 times and the rest 9, and `cl-all-1-en` runs the Home and Top groups 9 times (`rrr uuu ttt yyy` only 8) with Bottom mixed at 9 and 10.
- Traditional off spec counts: groups repeat 11, 31, 33, 34, 35 or 36 times where the specs say 10 or 30, across `cl-home-3-tr`, `cl-top-1-tr`, `cl-top-2-tr`, and `cl-all-1-tr`.
- The English Home L1 pairing differs from the finger mirror used everywhere else: it pairs `a` with `j`, `s` with `k`, `d` with `l`, `f` with `;`, while Traditional Home and all Top and Bottom rows pair true mirrors.

Attempts store only `lessonId`, so the prompt text is not persisted. Regenerating it cannot corrupt saved progress; old best scores simply belong to the old content.

## Requirements

**User stories**:

- As a learner, I want every drill row to follow its stated pattern exactly, so no row silently repeats the wrong number of times.
- As a learner, I want the Home English drills to teach true finger mirror pairs like Traditional and the other rows do.
- As a maintainer, I want drill prompts generated from the screen key set and level, so adding or fixing content means editing a small rule table, not thousands of characters.
- As a maintainer, I want a test that fails when generated content changes by accident.

**Acceptance criteria**:

- **AC-1**: Every English Level 1 row is generated from the row key set as true finger mirror pairs (same finger, left key with its right hand partner), each pair member tripled, each pair group repeated 10 times. Home is `aaa ;;;`, `sss lll`, `ddd kkk`, `fff jjj`, `ggg hhh`. Top is `qqq ppp`, `www ooo`, `eee iii`, `rrr uuu`, `ttt yyy`. Bottom is `zzz ///`, `xxx ...`, `ccc ,,,`, `vvv mmm`, `bbb nnn`. All Level 1 concatenates the Home, Top, and Bottom pairs.
- **AC-2**: Every English Level 2 row is generated as same hand groups of three consecutive keys, one group per sliding window per hand (three windows per hand), each group a single three character token (for example `asd`), each repeated 10 times. No group repeats the same unit back to back. All Level 2 takes the first window per hand from each of Home, Top, and Bottom (6 groups).
- **AC-3**: Every English Level 3 row is generated as mixed hand groups of three using the pattern `left[i]`, `right[mirror i]`, `left[i+2]` for five groups, each group a single three character token (for example `a;d`), each repeated 10 times, with no back to back repeat. All Level 3 takes the first two mixed groups from each of Home, Top, and Bottom (6 groups).
- **AC-4**: Every Traditional row keeps its current token content, expressed as compact groups with one repeat count per row. Counts are corrected to the stated rule: 30 for Level 1 pairs, 10 for Level 2 and Level 3. All off spec counts (11, 31, 33, 34, 35, 36) are removed. All Traditional Level 1 holds 14 pairs (Home 5, Top 5, Bottom 4).
- **AC-5**: The exported surface is unchanged. `CLASSIC_DRILLS`, `CLASSIC_DRILLS_TRADITIONAL`, and `ALL_CLASSIC_DRILLS` remain `Lesson[]`, and `Lesson.prompt` is computed at module load. Every row keeps its `id`, `layout`, `title`, `order`, `category`, and `difficulty`. `lintClassicDrills` keeps its signature and returns the ids of rows that fail.
- **AC-6**: `lintClassicDrills` passes on all 24 rows (Level 2 and Level 3 rows hold zero back to back repeats). The snapshot test over `ALL_CLASSIC_DRILLS` is the drift guard: it locks the generated prompts to expected strings, so an accidental count or content change fails CI. Note that `lintClassicDrills` only checks back to back repeats, never counts.
- **AC-7**: Invalid rule data (empty group, empty token, repeat below 1) fails fast at module load and is covered by a unit test.
- **AC-8**: Spec 0013 is marked superseded by this spec, and spec 0015 carries a note that its counts were corrected and its prompt storage moved to token groups.
- **AC-9**: Every English generated token contains only characters from its screen's key set. For the All screen the key set is the union of the Home, Top, and Bottom key sets.

## Options considered

### Option 1: Full generation from key sets plus Traditional token groups (chosen)

English rows are generated from the physical key sets and a level rule. The key sets are the same geometry the keyboard already uses. Traditional rows are explicit token groups with a repeat count.

**Pros**:

- Removes the duplicate strings and the drift risk in one move.
- English Home L1 is corrected to true finger mirrors, matching the rest.
- Traditional units are multi glyph and matra order is settled, so a table avoids fragile Preeti re-rendering.

**Cons**:

- English Level 2 and Level 3 content changes, so those drills and their best scores mean different things.
- Two content authors in one file (algorithm for English, table for Traditional), so the mental model is not uniform.

### Option 2: Keep static strings, only fix the drift

Hand correct the off spec counts and the stray token, leave the literals in place.

**Pros**:

- Smallest change, no new domain code.
- Content stays exactly as the specs list it.

**Cons**:

- The file stays long and the same drift can return.
- Nothing prevents the next hand edit from breaking a count.

### Option 3: Generate both layouts from physical keys through Preeti

Derive Traditional prompts from the same key pairs and render through `PREETI_MAP`.

**Pros**:

- One uniform rule for both layouts.
- Single source of truth for key pairing.

**Cons**:

- Traditional units are multi glyph and need ordering rules for pre-posed and post-posed matra, which is exactly the fragile part.
- Higher risk for no learner facing gain.

## Decision

**Chosen option**: Option 1: Full generation from key sets plus Traditional token groups

English prompts are generated from the row key set and level. Traditional prompts are compact token groups with one repeat count. Both feed the existing `Lesson[]` exports through a single `buildPrompt` function.

**Implementation skills**: `typescript-advanced-types` (`wshobson/agents`, `.agents/skills/typescript-advanced-types/`) · `vercel-react-best-practices` (`vercel-labs/agent-skills`, `.agents/skills/vercel-react-best-practices/`)

## Rationale

The file's real problem is duplication, not the content. A rule table plus a builder removes the duplication and makes the stated pattern the only source, which is what specs 0013 and 0015 already promised. English Home L1 is the one place where the shipped pairing drifted from the finger logic, and deriving L1 repairs it at no extra cost. Traditional stays a table because its rendered units and matra order are already correct and re-deriving them through Preeti adds risk with no learner visible benefit. Option 2 fixes today's typos but leaves the mechanism that produced them. Option 3 buys uniformity at the cost of the most fragile logic in the Traditional path.

## Feature design

**Data model sketch**:

- `DrillSpec` (new, `src/domain/drillPattern.ts`): `id: string`, `layout: LayoutId`, `title: string`, `order: number`, `category: ClassicCategory`, `difficulty: number`, `groups: string[][]` (required, ordered token groups), `repeat: number` (required, how many times each group is emitted).
- `CLASSIC_KEYS` (new): `Record<"home" | "top" | "bottom", { left: string[]; right: string[] }>`. Each side holds 5 physical keys taken from the existing `ROWS` geometry in `src/domain/classicLayout.ts`. Home left `a s d f g`, right `h j k l ;`. Top left `q w e r t`, right `y u i o p`. Bottom left `z x c v b`, right `n m , . /`.
- `Lesson` (existing, unchanged): `prompt` is now computed by `buildPrompt` at module load. No field is added or removed.
- Generators (new, pure): `mirrorPairs(keys)`, `sameHandTriples(hand)`, `mixedTriples(keys)`, `englishGroups(category, difficulty)`, `buildPrompt(groups, repeat)`.
- Traditional groups are data in `classicDrills.ts`, not generated.

**Generation rules**:

- `mirrorPairs`: for each left index `i`, pair `left[i]` with `right[4 - i]`. Level 1 triples each member, so a group is two tokens `[x.repeat(3), y.repeat(3)]`.
- `sameHandTriples`: for a hand of 5 keys, the windows `[0,1,2]`, `[1,2,3]`, `[2,3,4]`, each emitted as one joined token (`hand.slice(i, i + 3).join("")`, for example `asd`).
- `mixedTriples`: for each `i`, one joined token from `left[i]`, `right[4 - i]`, `left[(i + 2) % 5]` (for example `a;d`).
- Row assembly by category and level:
  - Level 1: the category's mirror pairs. All concatenates Home, Top, Bottom.
  - Level 2: the category's same hand triples (left then right). All takes the first window per hand from each of the three rows.
  - Level 3: the category's mixed triples. All takes the first two mixed groups from each of the three rows.
  - `repeat` is 10 for every English row.
  - All is a mixed review screen, not the full union of every group. Sampling one window per hand per row (Level 2) and two mixed groups per row (Level 3) keeps All a sane length and still touches every row and both hands. The individual Home, Top, and Bottom rows carry the full group sets.
- `buildPrompt(groups, repeat)`: for each group in order, emit `g.join(" ")` `repeat` times, joined by single spaces. A one token group emits that token; a two token Level 1 group emits the two tokens with a space between.

Traditional token groups (listed in the given order, `repeat` in parentheses):

- Home L1 `[बस][कि][मप][वा][नज]` (30). Home L2 `[बसि][किम][वान][मपव][नजब]` (10). Home L3 `[बसकि][मपवा][नजमप][बसनज][किवा]` (10).
- Top L1 `[त्रउ][धय][भई][चग][तथ]` (30). Top L2 `[त्रधभ][धयई][भईच][तथउ][चगथ]` (10). Top L3 `[त्रधय][भईच][गथउ][त्रभई][धचग][तथउ][त्रधय][भईच]` (10).
- Bottom L1 `[शर][ह।][खप][दल]` (30). Bottom L2 `[शहख][शर][खदल][ह।][खप]` (10). Bottom L3 `[शहख][शर][खदल][ह।][खप][दल][शर।][हखप]` (10).
- All L1 is the Home, Top, and Bottom L1 groups in order (30). All L2 `[बसि][किम][त्रधभ][धयई][खदल][शहख]` (10). All L3 `[बसकि][त्रधय][शहख][मपवा][भईच][खदल][नजमप][गथउ][दल]` (10).

Top L3 lists `त्रधय` and `भईच` a second time at the end by design, matching the 8 group order in spec 0015. Those two tokens therefore total 20 emissions, not 10.

**State transitions**: none. The drill state machine from spec 0012 is untouched.

**API surface**:

| Surface              | Kind                             | Key inputs                          | Key outputs     | Auth       | Key errors             |
| -------------------- | -------------------------------- | ----------------------------------- | --------------- | ---------- | ---------------------- |
| `ALL_CLASSIC_DRILLS` | pure domain constant (unchanged) | none                                | `Lesson[]`      | local only | none                   |
| `lessonsForClassic`  | pure domain (unchanged)          | `lessons`, `category`, `difficulty` | `Lesson[]`      | local only | none                   |
| `mirrorPairs`        | pure domain (new)                | `CLASSIC_KEYS` entry                | `string[][]`    | local only | none                   |
| `sameHandTriples`    | pure domain (new)                | one hand `string[]`                 | `string[][]`    | local only | none                   |
| `mixedTriples`       | pure domain (new)                | `CLASSIC_KEYS` entry                | `string[][]`    | local only | none                   |
| `englishGroups`      | pure domain (new)                | `category`, `difficulty`            | `string[][]`    | local only | none                   |
| `buildPrompt`        | pure domain (new)                | `groups`, `repeat`                  | `string`        | local only | throws on invalid rule |
| `lintClassicDrills`  | pure domain (unchanged)          | `rows` (opt)                        | failing row ids | local only | none                   |

**Value sourcing**:

| Action                   | Value produced / displayed                                 | Source                                                                                                                                                                                                                                            |
| ------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Open a drill screen      | Prompt text for screen plus level                          | `buildPrompt(spec.groups, spec.repeat)` computed at module load into `Lesson.prompt`, read in the frontend from `ALL_CLASSIC_DRILLS` through `lessonsForClassic` (the Rust `load_lessons` only serves `src/data/lessons/*.json` and is untouched) |
| English group tokens     | `string[][]` per row                                       | `englishGroups(category, difficulty)` from `CLASSIC_KEYS`                                                                                                                                                                                         |
| Traditional group tokens | `string[][]` per row                                       | explicit table in `classicDrills.ts`                                                                                                                                                                                                              |
| Row identity             | `id`, `layout`, `title`, `order`, `category`, `difficulty` | explicit meta table, unchanged from current rows                                                                                                                                                                                                  |
| Lint check               | Pass or fail per row                                       | `lintClassicDrills` over `ALL_CLASSIC_DRILLS`                                                                                                                                                                                                     |
| Guard against drift      | Expected prompt strings                                    | snapshot test over `ALL_CLASSIC_DRILLS`                                                                                                                                                                                                           |
| Typing session           | Lit key plus live speed                                    | unchanged derivations from spec 0012, `codeForNextUnit`                                                                                                                                                                                           |

**Key invariants**:

- Row ids, layouts, titles, orders, categories, and difficulties never change. Prompt text is the only derived field.
- Level 1 rows may repeat a unit back to back. Level 2 and Level 3 rows never do, enforced by `lintClassicDrills`.
- Every English token contains only characters from its screen key set (the All screen key set is the union of Home, Top, and Bottom).
- Traditional groups use rendered Preeti tokens only, never a standalone matra key.
- Generation is deterministic. The same rule always yields the same prompt.
- Invalid rule data throws at module load, so a bad table fails tests rather than shipping.

**Security model**: local single user app, no roles, no remote calls. Unchanged from spec 0012.

**Configuration required**: none.

**Critical test scenarios**:

- Generation: Home English Level 1 equals `aaa ;;;` groups repeated 10 times, Home English Level 2 equals the three same hand windows per hand, Home English Level 3 equals the five mixed groups, verifies **AC-1**, **AC-2**, **AC-3**.
- Key purity: every English generated token character is a member of its screen key set, verifies **AC-9**.
- Difficulty rule: `lintClassicDrills` returns empty for all 24 rows (Level 2 and Level 3 hold zero back to back repeats), verifies **AC-6**.
- Drift guard: the snapshot test over `ALL_CLASSIC_DRILLS` matches the locked expected prompts, verifies **AC-6**.
- Traditional counts: every Traditional Level 1 group repeats 30 times and every Level 2 and Level 3 group repeats 10 times, with no off spec counts, verifies **AC-4**.
- Identity: exported row ids, orders, and meta match the pre change list, verifies **AC-5**.
- Failure: an empty group, empty token, or `repeat` below 1 throws, verifies **AC-7**.
- Docs: spec 0013 shows the superseded status and spec 0015 shows the correction note, verifies **AC-8**.

## Build plan

Skateboard applies: land the thinnest whole first (the generator plus the English Home rows), prove it, then grow to the other screens and the Traditional table. No data migration, since attempts store only `lessonId`.

1. Add `src/domain/drillPattern.ts` with `CLASSIC_KEYS`, `mirrorPairs`, `sameHandTriples`, `mixedTriples`, `englishGroups`, and `buildPrompt`, plus fail fast validation. Unit test each generator and each invalid rule case, satisfies **AC-1**, **AC-2**, **AC-3**, **AC-7**, **AC-9**.
2. Rewrite the English rows in `src/domain/classicDrills.ts` to derive `groups` from `englishGroups`, keeping the meta table and exports unchanged, satisfies **AC-1**, **AC-2**, **AC-3**, **AC-5**.
3. Rewrite the Traditional rows to the compact token group table with corrected counts (30 for Level 1, 10 otherwise), satisfies **AC-4**, **AC-5**.
4. Add the snapshot test over `ALL_CLASSIC_DRILLS` and update `src/domain/classicLayout.test.ts`, then run the full suite, satisfies **AC-6**, **AC-9**.
5. Mark spec 0013 superseded and add the correction note to spec 0015, satisfies **AC-8**. (Done at spec capture: 0013 status is superseded and 0015 carries the note.)

## Consequences

**Positive**:

- One rule table replaces thousands of duplicate characters, so content fixes are small and reviewable.
- The shipped drift is corrected and `lintClassicDrills` plus the snapshot test keep it fixed.
- English Home L1 now teaches true finger mirrors, matching Traditional Home and all Top and Bottom rows.

**Negative / tradeoffs**:

- English Level 2 and Level 3 content changes, so past best scores for those rows are no longer comparable to the new drills (ids and history are kept).
- The file now has two content mechanisms: an algorithm for English and a table for Traditional.
- All English Level 1 grows to 300 tokens: 15 groups (one per pair), each group two tokens, each emitted 10 times, so 150 emissions and 300 tokens. A longer single drill.
- The snapshot test must be updated on purpose whenever content changes, which is the point but is also friction.

**Neutral**:

- Spec 0013 becomes a historical record; spec 0015 keeps its content with a storage note.
- No schema change and no stored data migration.

## Follow-up

- [ ] Consider a mid row checkpoint or split if the 300 token All Level 1 row proves too long in real use (extends the open item in spec 0013).
- [ ] If the two mechanism split (algorithm for English, table for Traditional) becomes a maintenance pain, revisit deriving Traditional from keys through Preeti (Option 3).
