# Scope: Typeshala

Desktop typing tutor for English and Nepali that runs fully on device for self learners. It teaches touch typing through short lessons with live feedback and saved progress.

**Build approach:** Skateboard (thinnest usable tutor first, then grow it).
**Workflow:** Alpha (after develop, check verify on real app). The project default level of rigor. `/architect` is the recommended first stop for a feature with a real decision, but skippable when you already know the build. Any feature can carry its own tag (for example · Beta) to do more or less.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use `/develop` and skip `/architect`. You decide when a feature is `done`._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Stack and architecture | Foundation | in-progress |
| 2 | Coding standards and tooling | Foundation | planned |
| 3 | Data model local store | Foundation | planned |
| 4 | Design system and bilingual UI foundation | Foundation | planned |
| 5 | Smallest usable English tutor | Release 1 | planned |
| 6 | Structured lessons and progression | Release 2 | planned |
| 7 | Nepali Romanized layout | Release 3 | planned |
| 8 | Nepali Traditional Preeti layout | Release 3 | planned |
| 9 | Progress trends and stats screen | Release 4 | planned |
| 10 | Settings language and themes | Release 4 | planned |
| 11 | Bonus Ramayana game | Release 5 | planned |
| 12 | Polish and packaging three systems | Release 6 | planned |

## Foundations

### 1. Stack and architecture · in-progress · Beta
Decide Tauri plus React shape and scaffold a runnable app so later slices build on real structure. Includes your light standards leanings folded in.
**Done when:** the stack lives in a spec and the empty scaffold boots locally and passes build.
- [x] Decide the stack (spec): `/architect stack and architecture`
- [x] Scaffold from the decision: `/develop stack and architecture`
Spec [0001](../specs/0001-stack-and-architecture.md) · code in `src/`, `src-tauri/`, `vite.config.ts`

### 2. Coding standards and tooling
Capture conventions from the real scaffold then install lint, format, and hooks so later code stays tidy.
**Done when:** root `AGENTS.md` reflects the real stack, and lint plus format run clean.
- [ ] Capture conventions plus tooling choices: `/audit`

### 3. Data model local store · needs a decision · Beta
Define lessons, session results, settings, and progress saved on device through JSON store so later slices share one shape.
**Done when:** entities and save shape support lessons, results, settings, and trends with no breaking redo later.
- [ ] Design it (spec): `/architect data model local store`

### 4. Design system and bilingual UI foundation · needs a decision
Set type, color, spacing, base components, light dark themes, large prompt text, full keyboard use, and English plus Nepali UI strings so flows feel cohesive.
**Done when:** `design.md` covers tokens and components, and base screens handle focus and keyboard in both languages.
- [ ] Design it (spec): `/architect design system and bilingual UI foundation`

## Release 1: smallest usable whole

### 5. Smallest usable English tutor · needs a decision · Beta
Type one English lesson against a prompt with live WPM and accuracy, virtual keyboard plus finger guidance, and result saved locally. This is the thin usable whole you could use tomorrow.
**Done when:** you can pick a lesson, type it, see live score, see next key lit, and find your result after restart.
- [ ] Design it (spec): `/architect smallest usable English tutor`

## Release 2: grow with structure

### 6. Structured lessons and progression · needs a decision
Grow the tutor with ordered lessons per row, words, sentences, best scores, and unlock rules so learning builds step by step.
**Done when:** learners move through lessons in order, see best scores, and unlock next steps by clear rules.
- [ ] Design it (spec): `/architect structured lessons and progression`

## Release 3: Nepali layouts

### 7. Nepali Romanized layout
Add Romanized Unicode typing on the same engine and keyboard so Nepali learners can start with familiar keys.
**Done when:** you can switch to Romanized, type Nepali prompts, and save results like English.
- [ ] Build it: `/develop Nepali Romanized layout`

### 8. Nepali Traditional Preeti layout · needs a decision · Beta
Add Preeti key mapping over open Unicode Devanagari with conjunct and matra handling so traditional typists learn true sequences.
**Done when:** you can switch to Traditional, type conjuncts correctly, and guidance still points at physical keys.
- [ ] Design it (spec): `/architect Nepali Traditional Preeti layout`

## Release 4: progress and settings

### 9. Progress trends and stats screen
Show WPM trend, accuracy trend, and lessons done from saved results so learning gain stays visible.
**Done when:** you can open progress and read trends over time plus per lesson bests.
- [ ] Build it: `/develop progress trends and stats screen`

### 10. Settings language and themes
Let you pick layout, UI language, theme, sound, and prompt size with all choices saved on device.
**Done when:** you can change each setting, restart, and find it kept, in English or Nepali UI.
- [ ] Build it: `/develop settings language and themes`

## Release 5: fun plus parity

### 11. Bonus Ramayana game · needs a decision
Add a separate Ramayana themed typing game with falling words to type in time, built from own code and openly licensed art.
**Done when:** you can start the game, type falling words to clear them, and see score, with no effect on lessons.
- [ ] Design it (spec): `/architect bonus Ramayana game`

## Release 6: ship it

### 12. Polish and packaging three systems
Tidy theming, copy in both languages, icons, and native installers for Windows, macOS, and Linux so others can install and learn.
**Done when:** clean installers run offline from first launch with lessons, progress, and settings intact.
- [ ] Build it: `/develop polish and packaging three systems`

## Deferred
Out of scope for the current build pass, kept so the plan stays honest.
- **Cloud sync and accounts**: stays local only, no network calls, no sign in
- **Mobile port**: desktop installers only in this pass
- **Online leaderboards**: progress stays on device only

## Legend

**The decision box.** Every feature carries exactly one, the sub task whose label ends with `(spec)`. Its wording varies (`Design it (spec)` normally, `Decide the stack (spec)` on Stack and architecture), so skills locate it by that `(spec)` suffix, never by an exact label. Every other box is an execution box and `/architect` never ticks one.

**Feature lifecycle**: the scope updates as a feature moves; each row is what it shows and who sets it:

| State | Set by | The feature shows |
|---|---|---|
| `planned` · needs a decision | `/scope` | one box: `Design it (spec): /architect <feature>` |
| `in-progress` (designed) | **`/architect` at spec capture** | `Design it` ticked; spec linked; `Build it: /develop <feature>` + **2 to 5 milestones**; the tier closing boxes (`Verify it` Alpha and up, `Test it` Beta and up, `Review it` + `Document it` GA); any surfaced follow up enrolled |
| `in-progress` (building) | `/develop` | milestone sub boxes tick one by one; code pointer filled |
| `in-progress` (verified) | `/check verify` | `Build it` + milestones ticked; `Verify it` ticked |
| `done` | **you, when you decide it is** (any skill sets it when you say so); `/sync` reconciles | boxes you ran ticked, skipped ones marked skipped; the tier last stage (`Prototype` after `/develop`; `Alpha` after `/check verify`; `Beta` and `GA` after `/test`) is the suggested point to call it done; `/sync` captures conventions |

- **Next step** = the first unticked box (always a command or a tracked milestone).
- **needs a decision** = run `/architect` first; otherwise straight to `/develop` (or `/audit` for standards and tooling). The tag drops once the spec is captured.
- **Atomic build tasks live in the spec `## Build plan`, not here**: the scope carries only the milestone rollup.
- **Status** `planned` to `in-progress` to `done`, plus `existing` (before workflow) and `dropped` (de scoped, kept for history).
- **Approach tag** beside a heading (for example · Facade) overrides the project default for that feature; no tag = inherits it.
- **Workflow tier tag** beside a heading (for example · GA, · Prototype) sets that one feature rigor above or below the project default; no tag inherits the default. It decides the feature check boxes and each skill next suggestion.
- **Workflow** (header line) is the project default, what runs after `/develop`: **Prototype** = nothing (trust develop own build time self check); **Alpha** = `/check verify`; **Beta** = `/check verify` then `/test`; **GA** = adds a fresh model `/check review` then `/document`. A feature built on an unratified decision (an `Assumed` spec) stays flagged, but that never blocks `done`.
- **Pointer line** (`spec <n> · code in <path>`): the spec link added by `/architect`, the code path by `/develop`.
