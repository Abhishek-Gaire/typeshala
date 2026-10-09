# 0022. Nepali Romanized layout access in the classic shell

**Date**: 2026-10-09
**Status**: In Progress

## Summary

Make the Nepali Romanized layout (you type roman letters and Devanagari text in standard Unicode form appears) reachable in the app exactly like English and Traditional Preeti. Today the mode exists in Settings but its engine was dropped in the classic rework, so choosing it opens English drills. This spec restores the engine on the current session shape, adds the third toolbar control, and generates its classic drill rows, with no change to stored data.

## Requirements

**User stories**:

- As a Nepali learner, I want to switch to Nepali Romanized from the practice toolbar and type Devanagari drills with roman keys, so that the mode I picked in Settings is the mode I practice.
- As a Nepali learner, I want the same drill screens, levels, keyboard guidance, and saved results as the other two layouts, so that learning feels continuous when I switch.
- As a returning learner, I want my stored settings and past attempts to survive this change untouched.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):

- **AC-1**: The classic toolbar exposes a third layout control for Nepali Romanized beside the English and Traditional controls, with a localized title in both UI languages, and picking it switches the whole shell (screen, level, restart) to romanized exactly like the other two. The Settings entry keeps its three choices and stays consistent with the toolbar.
- **AC-2**: All twelve romanized drill rows exist (four screens by three levels, including an All level 3 review row), generated from the roman map by board row, and they pass the same difficulty lint and drill snapshot as the English and Traditional rows. The bundled set holds 24 rows today (12 English plus 12 Traditional) and reaches 36 with romanized, so the snapshot regression can assert the 24 existing rows stay byte identical while the 12 new rows appear.
- **AC-3**: Typing a romanized drill shows the Devanagari prompt with per unit coloring, lights the roman key now due (buffer aware, so a pending short vowel keeps guiding the deciding key), shows the remaining roman letters as the finger hint, and reports live words per minute and accuracy. Extendable short vowels flush on the deciding key, so `a` then `a` yields अ then a pending `a` for आ instead of one आ that breaks prompt alignment (this behavior already exists in the domain: the extendable check and the advance step in `src/domain/romanize.ts`, so implementers test against the real functions rather than redefining them).
- **AC-4**: A wrong roman sequence counts one error hit and highlights the wrong key, backspace clears the pending roman buffer before removing a completed char, and finishing a drill saves the attempt with layout `romanized`.
- **AC-5**: Nothing about storage changes: the store schema, `Settings`, and existing attempts open untouched after the update, and the Free screen keeps echoing raw key presses as it does today in every layout.
- **AC-6**: Unit tests cover the roman step rules (flush, pending, one error per wrong sequence, backspace order), the session hook mirrors the Traditional session tests, and lint, format, typecheck, and the full suite stay green.

## Decision

**Chosen option**: Option 1: Restore the engine on the current session shape

The romanized session returns as a first class engine written to the current shared session shape, the classic screens gain a third branch identical in spirit to the Traditional one, the toolbar gains a third control with localized titles, and the twelve drill rows are generated from the roman map with the existing lint and snapshot coverage. Spec 0006 remains the standing record of the map and engine rules and is not reopened.

**Implementation skills**: none materially shaped this design, the work reuses repo conventions only.

## Rationale

Reasoning and options: see `rationale.md`.

## Feature design

**Data model sketch**:

- Lesson (bundled row, shape reused from spec 0002, no migration): id (required), layout = `romanized` (required, existing `LayoutId` value), title (required), prompt (required, Devanagari text, the guidance supplies the roman sequences to press), order (required), category (required, one of home, top, bottom, all), difficulty (required, 1 to 3)
- DrillSpec (bundled build data, not stored): groups (required, generated token groups of Devanagari chars), repeat (required, count mirroring the traditional rows), plus the Lesson fields above
- Attempt (reused verbatim): layout = `romanized` (required), lessonId (required), scores and error positions from the session
- Settings (reused verbatim): layout (required, existing three values, no new value)
- RomanMap (reused, read only): one roman sequence per Devanagari char, no variants, from `src/domain/romanize.ts`

**State transitions**:

- Session: idle to active on the first roman key; active to done at the last prompt char; done to idle on restart or back to the shell. Save runs once on entry to done, then the session resets.
- Buffer: empty grows pending while a short vowel could still extend (`a`, `i`, `u` before `aa`, `ii`, `uu`, `ai`, `au`); a pending buffer commits on the deciding key or on space; a wrong key drops the buffer and counts one hit.

**API surface** (internal, no Tauri command changes):

| Surface                | Kind                  | Key inputs                            | Key outputs                                                                                                                           | Key errors                                            |
| ---------------------- | --------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `useRomanizedSession`  | hook                  | prompt (req), fingerGuidance (req)    | session values (units, buffer, hint, finger, sequenceHint, wpm, accuracy, done) plus `typeChar`, `backspace`, `reset`, `buildAttempt` | none, wrong sequences are counted not thrown          |
| `advanceRoman`         | pure domain, existing | buffer (req), key (req)               | commits (list), buffer (pending), error flag                                                                                          | unknown sequence sets the error flag                  |
| romanized drill groups | pure domain, new      | screen bucket (req), level (req)      | groups of Devanagari chars for `buildPrompt`                                                                                          | char with no roman sequence is rejected at build time |
| `codeForNextUnit`      | pure domain, extended | next char (req), layout = `romanized` | physical key code of the first roman letter                                                                                           | empty code when no sequence exists                    |
| classic shell control  | view                  | current layout (req)                  | layout change through the existing settings write                                                                                     | none                                                  |

**Value sourcing**:

| Action                             | Value produced or displayed          | Source                                                                                                            |
| ---------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Switch layout from the toolbar     | control titles in English and Nepali | i18n keys `layout.english`, `layout.romanized`, `layout.traditional` in `src/i18n/en.json` and `src/i18n/ne.json` |
| Switch layout from the toolbar     | new layout value                     | `Settings.layout` through `useUiSettings`, persisted on the existing settings write path                          |
| Open a classic screen in romanized | the drill row                        | `ALL_CLASSIC_DRILLS` filtered to layout `romanized`, generated from `ROMAN_MAP` rows at module load               |
| Type a drill                       | prompt units                         | `splitUnits` of the row prompt, same helper the other layouts use                                                 |
| Type a drill                       | typed overlay chars                  | session units, the Devanagari chars committed by `advanceRoman`                                                   |
| Type a drill                       | lit key code                         | `sequenceFor(next char)` first letter, mapped through `codeForChar`                                               |
| Type a drill                       | finger hint                          | remaining letters of `sequenceFor(next char)` after the pending buffer                                            |
| Type a drill                       | live words per minute and accuracy   | `calcWpm` and `calcAccuracy` in domain from units, keystrokes, error hits, elapsed time                           |
| Finish a drill                     | saved attempt layout value           | the constant `romanized` in `buildAttempt`                                                                        |
| Free screen                        | echoed characters                    | raw key presses, unchanged in every layout                                                                        |
| Settings screen                    | three layout choices                 | existing `SettingsView` entries, no change                                                                        |

**Key invariants**:

- Drill prompts use only characters the `ROMAN_MAP` covers: single chars, no conjuncts, no matras, per spec 0006
- Scoring stays in domain: units count committed Devanagari chars, keystrokes and error hits count roman presses
- A pending buffer never counts as typed, and one wrong committed sequence is one error hit
- Backspace clears the pending buffer first, then removes the last completed unit
- The virtual keyboard keeps qwerty geometry for every layout; romanized shows the roman letters you press, exactly like the English board
- No store schema change: attempts stay append only, settings stay last write wins, and the schema version does not move

**Security model**: local single user app, no roles, no remote calls, no sensitive data beyond typing history.

**Configuration required**: none, no new env vars, flags, or credentials.

**Critical test scenarios** (each maps to an acceptance criterion):

- Happy path: switch to romanized from the new toolbar control, type the home level 1 drill end to end with guidance visible, finish, and confirm the saved attempt carries layout `romanized`, verifies **AC-1**, **AC-3**, **AC-4**
- Flush edge: type `a` then `a` for आ and confirm the screen shows अ then a pending `a` for आ rather than one आ, and alignment holds to the end of the prompt, verifies **AC-3**
- Error edge: type a wrong roman sequence, confirm one error hit and the wrong key highlight, then backspace and confirm the buffer clears before a char is removed, verifies **AC-4**
- Regression: open stored settings with `romanized` selected and past attempts, confirm both read unchanged, and confirm the drill snapshot for the English and Traditional rows is byte identical, verifies **AC-2**, **AC-5**
- Input parity: complete one drill by physical keyboard only, then the same drill through board taps on the touch path, verifies **AC-3**
- Bilingual: switch the UI language to Nepali and confirm the new control title reads correctly, verifies **AC-1**

## Build plan

1. [x] Restore the romanized session engine in `src/features/typing/useRomanizedSession.ts`, written to the current shared session shape (units, buffer, sequence hint, wrong key, timer), with domain tests for flush, pending, error, and backspace order, satisfies **AC-3**, **AC-4**, **AC-6**
2. [x] Wire the thinnest usable whole: add the romanized branch to the drill pool and session selection in `src/features/classic/ClassicScreen.tsx`, add the romanized branch to `codeForNextUnit` in `src/domain/classicLayout.ts`, and add the third toolbar control with localized titles in `src/components/ClassicShell.tsx`, shipping with level 1 rows as an interim checkpoint so the mode is usable end to end before the full set lands, with the full twelve rows closing **AC-2** in step 3, satisfies **AC-1**, **AC-3**
3. [ ] Generate all twelve romanized drill rows in `src/domain/classicDrills.ts` from the roman map, with each char joining the screen row of the first pressed key of its roman sequence (a screen teaches the sequences that start on its row, so every screen holds rows), plus the difficulty lint and snapshot update, satisfies **AC-2**
4. [ ] Bring guidance and save to full parity: buffer aware lit key from the session hint, spaced roman finger hint, wrong key highlight, and the save path carrying layout `romanized`, satisfies **AC-3**, **AC-4**
5. [ ] Close the quality gate: titles present in both languages, Free and Settings behavior unchanged, stored data opens untouched, and lint, format, typecheck, and the full suite green, satisfies **AC-5**, **AC-6**

## Consequences

**Positive**:

- The third mode becomes real practice rather than a settings ghost, with the same screens, levels, guidance, and save as the other two
- The roman map gains a second consumer (the drill generator) with no new stored truth and no schema move
- The restored hook lands on the shared session contract, so future layouts have one shape to copy

**Negative / tradeoffs**:

- Bucketing by first pressed key keeps every char reachable, but a row screen also trains the follow on keys from other rows, so a romanized row screen is not finger pure the way the English rows are
- Three session hooks now need aligned attention; a future edit to the shared shape must touch all three
- Free still echoes raw keys in every layout, and the bonus game still cannot be typed in romanized, so parity is real in the practice path and absent in those two corners, accepted here and parked in Follow-up

**Neutral**:

- A learner who had `romanized` selected in Settings today silently drills English letters; after this they drill romanized. Behavior changes, data does not, and reverting is a single commit

## Follow-up

- [ ] Bonus game: teach the falling word game the roman buffer, or filter its prompt pool to the active layout, so romanized works there too (enrolled as scope feature 25)
- [ ] Variant spellings: spec 0006 still owes a call on whether learners get alternate roman spellings accepted (parked in the scope Deferred list)
