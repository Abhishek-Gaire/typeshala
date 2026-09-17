# 0012. Classic practice screens

**Date**: 2026-09-16
**Status**: Accepted

## Summary

This spec recreates the classic practice shell as six screens (Home, Top, Bottom, All, Game, Free) that share one toolbar, one level switch, one language switch, one two line prompt, and one full virtual keyboard. Each drill screen drills a different key set with the same mechanic. Difficulty grows by removing repeats, not by changing the format.

## Requirements

**User stories**:

- As a learner, I want Home, Top, Bottom, and All as separate drill screens so that I can practice one row at a time before mixing the full board.
- As a learner, I want three levels per screen (easier, harder, more harder) so that the same drill format keeps challenging me.
- As a learner, I want the language switch to keep my screen and level so that I can move between Nepali and English without losing my place.
- As a learner, I want the keyboard to show me exactly which key comes next so that I can keep my eyes on the prompt and learn key positions.

**Acceptance criteria**:

- **AC-1**: Each of Home, Top, Bottom, All is its own screen with its own drill set. All four share the shell (menu, toolbar, level, language, name plus speed, two line prompt, keyboard) and differ only in which characters get drilled.
- **AC-2**: Game toolbar button opens the Ramayana game from spec 0010 inside the shell (falling words, score, lives, level). Lesson progress is untouched by game runs.
- **AC-3**: Free toolbar button opens unstructured typing (no target prompt) with live speed plus accuracy and the same keyboard. Nothing is saved to lesson progress in v1.
- **AC-4**: Level 1 allows consecutive repeats of the same unit (pair drills such as `मम पप`). Level 2 forbids an immediate repeat of the same unit. Level 3 keeps the Level 2 rule and uses longer mixed prompts. A domain validator enforces the rule and lesson lint tests fail on violation.
  - Retired for English rows: the English drill rows that this criterion once covered now follow spec [0013](../0013-english-drill-pattern.md) (pair and group pattern). This criterion stays in force for Nepali rows until their own decision lands.
- **AC-5**: Language switch (Nepal versus UK flag) preserves screen, level, and session state and swaps only the lesson source plus keyboard labels. Traditional shows Preeti Devanagari glyphs, English shows QWERTY letters, same geometry and color logic.
- **AC-6**: Virtual keyboard matches the reference geometry (full five row board with number row plus Tab, Caps Lock, Shift, Ctrl, Alt, Backspace, Enter, Space). Character keys render light with blue glyphs (dual shifted variant where the layout defines one). Modifier keys render olive with no glyph. Exactly one key at a time renders red, tracking the cursor in the prompt, landing on any key including space.
- **AC-7**: Header shows an in window menu bar (`Perform`, `Lessons`, `Options`, `Help`), six redrawn category icons (never traced from the original art), a session only name field, and a live `Avg.speed` readout wired to the same WPM math as spec 0004.
- **AC-8**: All new strings exist in English plus Nepali with English fallback, all colors come from tokens (never hardcoded), every action is reachable by keyboard with always visible focus, and all data stays local with no network call.

## Decision

**Chosen option**: Option 2: Single shell plus per screen content selectors

One shell component owns the menu, toolbar, level, language, name plus speed, prompt, and keyboard. Each screen is a content selector (which drill set, or game, or free input) plugged into that shell.

**Implementation skills**: `tailwindcss` (`hairyf/skills`, `.agents/skills/tailwindcss/`) · `vercel-react-best-practices` (`vercel-labs/agent-skills`, `.agents/skills/vercel-react-best-practices/`)

## Rationale

Reasoning and options: see `rationale.md` beside this file.

## Feature design

**Data model sketch**:

- `Lesson`: keep shape from spec 0002, add `category?: string` (req on new rows, opt on old rows) with values `home`, `top`, `bottom`, `all` for drill screens. Add `difficulty?: number` (req on new rows, opt on old rows) with values `1`, `2`, `3`. Old rows without these fields keep working through a fallback mapper (`home-row` maps to `home`, `top-row` to `top`, `bottom-row` to `bottom`, everything else to `all`; missing difficulty reads as `1`).
- `ClassicKey` (read only layout table, new file `src/domain/classicLayout.ts`): `code: string` (req, physical key identity), `row: number` (req), `unshifted?: string` (opt, glyph label), `shifted?: string` (opt, glyph label), `kind: ClassicKeyKind` (req) where `ClassicKeyKind = char | modifier | space`. Glyph labels derive from the existing `PREETI_MAP` inverse for Traditional and from QWERTY letters for English, never from reading the screenshot.
- `Attempt`, `BestScore`, `Progress`, `Settings`: reuse shapes verbatim from spec 0002. No schema change, no migration. Name field is session state only, never stored.
- Derived view (not saved): `screenId`, `level`, `layout`, bests plus locked or open status reuse selectors from spec 0005.

**State transitions**:

- Screen navigation: any of the six screens to any other via the toolbar. Drill state resets on switch. Level and language are preserved across screen switches.
- Typing session: `idle` to `active` on first key, `active` to `done` at last prompt unit, `done` to `idle` on restart or back. Save runs once on entry to `done` for drill screens only. Free screen never saves. Game screen follows spec 0010 states.
- Language switch: `layout` flips, screen plus level plus name are kept, prompt source plus keyboard labels swap.

**API surface**:

| Endpoint               | Method      | Key inputs                                           | Key outputs                       | Auth        | Key errors                            |
| ---------------------- | ----------- | ---------------------------------------------------- | --------------------------------- | ----------- | ------------------------------------- |
| `load_lessons`         | command     | `layout` (opt), `category` (opt), `difficulty` (opt) | `Lesson[]`                        | none, local | missing bundle file                   |
| `save_result`          | command     | `Attempt` without id (req)                           | `Attempt` with id                 | none, local | validation failed, store write failed |
| `get_progress`         | command     | `lessonId` (opt)                                     | `Attempt[]` plus derived bests    | none, local | store read failed                     |
| `mapLevelToCategory`   | pure domain | `level: string` (opt)                                | `home`, `top`, `bottom`, or `all` | local only  | none, unknown maps to `all`           |
| `hasConsecutiveRepeat` | pure domain | `units: string[]` (req)                              | `boolean`                         | local only  | none                                  |
| `classicRowsFor`       | pure domain | `layout: LayoutId` (req)                             | `ClassicKey[][]` rows             | local only  | none, empty on unknown layout         |

**Value sourcing**:

| Action            | Value produced / displayed                   | Source                                                                                                                                                              |
| ----------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Open drill screen | Drill set for screen plus level              | `load_lessons` output filtered by layout plus category plus difficulty, bundled `Lesson` rows                                                                       |
| Level switch      | Tougher prompt, same format                  | `Lesson.difficulty` plus `hasConsecutiveRepeat` rule (L1 repeats allowed, L2 no immediate repeat, L3 L2 rule plus longer mixed prompts)                             |
| Language switch   | New prompt plus keyboard labels, same screen | `Settings.layout` plus picker selection, saved via settings write; glyph labels from `classicRowsFor`                                                               |
| Typing keystroke  | Per unit color plus caret position           | derived from prompt unit vs typed unit in view state (Traditional units via `splitUnits`, English via chars)                                                        |
| Typing view       | Live WPM plus accuracy                       | derived from correct units or chars plus `durationMs` in domain math per spec 0004 formulas                                                                         |
| Typing view       | Lit red key plus finger text hint            | derived from next unit via `sequenceForPreeti` (Traditional) or `nextKey` (English) for first physical key, honors `Settings.fingerGuidance` for the text hint only |
| Header            | Session name plus Avg speed                  | name from session state (input, default empty), speed from live WPM derivation                                                                                      |
| Game screen       | Score plus lives plus level                  | `src/domain/game.ts` from spec 0010, lesson store untouched                                                                                                         |
| Free screen       | Live WPM plus accuracy, no save              | same scoring derivations, no `save_result` call                                                                                                                     |
| Finish drill      | Saved `Attempt`                              | input params plus derived scores, stored via `save_result`                                                                                                          |
| Error states      | Friendly text with retry                     | view strings in active language from `src/i18n/`                                                                                                                    |

**Key invariants**:

- Scoring math stays in `domain` with no framework imports per spec 0004 formulas. Traditional counts units (documented divergence from spec 0007), English and Romanized count chars. Views never compute WPM or accuracy inline.
- Difficulty rule is enforced as data plus a pure validator: L1 may repeat, L2 and L3 never repeat the same unit back to back. Lesson lint tests assert this for every bundled drill row.
- Glyph labels come from layout tables (`PREETI_MAP` inverse, QWERTY letters), never from screenshot reading. Dual glyph display shows shifted variant only where the layout defines one.
- Exactly one keyboard key carries the red next state at a time. It is derived from the cursor, never stored.
- Category icons are redrawn originals. Flags plus generic chrome may match the reference directly.
- Attempts are append only (drill screens). Settings are last write wins. Free and game runs never write lesson attempts.

**Security model**:

Local single user app, no roles, no remote calls. All reads and writes stay on device store. No sensitive data beyond typing history and a session only display name.

**Configuration required**:

None. No new env vars or secrets.

**Critical test scenarios**:

- Happy path: open each of Home, Top, Bottom, All, type a full drill, see two line prompt plus red key tracking plus live speed, save and see result, verifies **AC-1**, **AC-6**, **AC-7**
- Difficulty rule: L1 drill with repeats passes lint, L2 or L3 drill with an immediate repeat fails lint, verifies **AC-4**
- Language path: switch flags mid screen, screen plus level kept, prompt plus keyboard labels swap, verifies **AC-5**
- Game plus free path: game run leaves lesson attempts untouched, free typing shows live stats with no save call, verifies **AC-2**, **AC-3**
- Keyboard path: full drill by keyboard only with visible focus, restart plus retry plus back all reachable, verifies **AC-8**
- Recovery: empty catalog plus save fail plus corrupt store show friendly text with retry in the active language, verifies **AC-8**

## Build plan

1. Add classic tokens (chrome, target, typed, modifier, next, level 1 to 3) plus typed i18n keys for categories, levels, session name, and Avg speed in both languages, satisfies **AC-7**, **AC-8**
2. Add domain `classicLayout.ts` (rows plus kinds plus glyph labels per layout) plus `mapLevelToCategory` plus `hasConsecutiveRepeat` with unit tests including the `मम पप` drill, satisfies **AC-4**, **AC-5**, **AC-6**
3. Build two line prompt display plus full virtual keyboard (geometry plus olive versus light versus red states) with lit key tests (red on `म` mid word, red on space after word), satisfies **AC-1**, **AC-6**
4. Build toolbar plus level selector plus language switch plus menu bar plus session header with redrawn icons, satisfies **AC-1**, **AC-7**
5. Compose the six screens in the shell (drill screens by category filter, game reusing spec 0010 view, free as no save view) with level plus language preserved across switches, satisfies **AC-1**, **AC-2**, **AC-3**, **AC-5**
6. Wire finish plus save for drill screens plus error plus empty plus loading states in the active language with keyboard focus pass, satisfies **AC-8**

## Consequences

**Positive**:

- Learners get the familiar six screen flow with the same shell everywhere, so each screen is cheap to add once the shell lands.
- Drill content, difficulty, and keyboard truth live in testable domain code, so later screens reuse them with no scoring redo.

**Negative / tradeoffs**:

- Full five row keyboard plus dual glyph labels is real rendering work up front, and Preeti labels need careful review against the map table.
- Six redrawn icons plus classic tokens add design review surface before any lesson content grows.

**Neutral**:

- New views live under `src/features/` per layer rules, shared parts stay in `src/components/`, visual truth stays in `docs/design/`.

## Follow-up

- [ ] Enroll a scope row for this feature so status mirrors the build (`Proposed` to `In Progress` to `Accepted`).
- [ ] Author real L2 plus L3 drill rows per screen (no repeat rule plus longer mixed prompts) once the shell lands.
- [ ] Decide whether Free runs should ever save (word count history) or stay fully ephemeral.
- [ ] Retire the root `typeshala-ui-recreation-spec.md` into `docs/design/` history once Screen 1 content is confirmed moved.
