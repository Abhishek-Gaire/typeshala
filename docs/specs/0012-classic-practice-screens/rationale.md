# 0012 rationale: Classic practice screens

## Context

You asked for the classic practice flow to return as six full screens (Home, Top, Bottom, All, Game, Free) where every screen offers all three levels and both languages and shares the keyboard from the reference images. The current app has one generic picker plus one typing view plus a simplified three row keyboard, so the classic shell (menu, toolbar, level, flags, name plus speed, two line prompt, full board) has no home yet. The visual companion held Screen 1 only and lived at the repo root, outside the numbered spec flow, so builders had to guess where visual truth ends and the build contract begins. Without a decision now, each screen would get built ad hoc and the keyboard, difficulty, and language behavior would drift per screen.

## Options considered

### Option 1: Six separate pages

Build each screen as its own page with its own toolbar copy, prompt copy, and keyboard copy.

**Pros**:

- Each screen reads standalone, easy to reason about in isolation.

**Cons**:

- Six copies of identical shell logic to keep in sync (toolbar state, level, language, lit key derivation, header readouts).

### Option 2: Single shell plus per screen content selectors

Build one shell that owns menu, toolbar, level, language, name plus speed, prompt, and keyboard. Each screen plugs in only its content (drill set filter, or the game view, or the free input).

**Pros**:

- One place fixes every screen. Screen switches and language switches become state changes, not page rebuilds.

**Cons**:

- The shell component grows early (it must host drill, game, and free content from the start).

### Option 3: Recreate the pixels with hardcoded colors and strings

Match the screenshots by hardcoding the Classic gray, blue, olive, and red plus inline English labels.

**Pros**:

- Fastest visual match in light mode.

**Cons**:

- Breaks the token only and bilingual rules from spec 0003, both themes, and every later screen that reuses the palette.

## Rationale

You confirmed the six buttons are navigation to full screens, language is global and preserves the screen, Game is the spec 0010 Ramayana game, Free is unstructured input with no save, and the menu plus name plus speed header ships in this slice. That points to a shared shell (Option 2): the only thing that changes per screen is the content selector, everything else is identical chrome. The difficulty meaning you delegated (harder means no consecutive char) becomes a pure domain validator rather than a per screen hack, so L1 pair drills stay legal while L2 and L3 prompts are machine checked. Option 1 would duplicate the shell six times for no behavioral gain. Option 3 would hit the visual target once and then tax every later screen, since the project already committed to tokens, both themes, and typed bilingual strings. The docs split (visual guides under `docs/design/`, contracts under `docs/specs/`) follows the same logic: one visual source of truth, one build source of truth, with `AGENTS.md` pointing at both so new sessions inherit the split.

## References

Project sources:

- `AGENTS.md`, layer rules plus token only plus bilingual plus feature grouping conventions
- `typeshala-architecture-plan.md`, Sections 4 (components), 5.2 (keyboard plus finger guidance), 5.7 (bonus game), 11 (layout parity with original art)
- `typeshala-ui-recreation-spec.md`, Screen 1 (migrated into `docs/design/classic-practice-screens.md`)
- spec 0002 (lesson and attempt shapes), spec 0003 (tokens plus themes plus i18n), spec 0004 (scoring formulas), spec 0005 (progression selectors), spec 0007 (Preeti units and sequence hints), spec 0010 (Ramayana game module)

Practices and standards:

- Single source of truth for visual versus build docs
- Pure domain logic with no framework imports, views kept thin
- Derived values computed at read time, never stored separately
