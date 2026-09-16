# Classic practice screens visual guide

Companion to the architecture plan and to spec `0012`. This file holds visual truth for recreating the classic practice screens. The build contract lives in `docs/specs/0012-classic-practice-screens/index.md`. Read both when you build.

## Design rule: recreate the layout, never trace the art

Applies to every screen below. You may recreate layout geometry, control placement and grouping, color logic (which color means what), text layout, keyboard geometry, and interaction cues (what is highlighted and why). You must redraw the cartoon category icons (house, mountain, fish, globe, archer, bomb) as original art that reads the same at a glance. You may recreate national flags, generic chrome (title bars, buttons, scrollbars), palettes, and geometry as is. The reference images carry exact visual truth. This doc carries structure and naming.

## Shared shell (all six screens)

Every screen in this set uses one shared shell, top to bottom.

1. Title bar: app icon plus `Typshala` title plus standard min, maximize, and close controls. Flat light gray blue bar.
2. Menu bar: text menus `Perform`, `Lessons`, `Options` left aligned, `Help` right aligned.
3. Category toolbar: row of 6 icon over label buttons: `Home`, `Top`, `Bottom`, `All`, `Game`, `Free`. Each is a vertical stack (icon above, label below) with a classic raised bevel. Exactly one is pressed at a time. This is screen navigation, not a filter. Each button opens its own screen.
4. Level and language panel (same row, right of toolbar):
   - 3 stacked options: `Level 1` (smiley icon, green), `Level 2` (yellow circle), `Level 3` (red circle). Difficulty within the active screen. Level 1 is easier, Level 2 is harder, Level 3 is more harder. Same drill format, tougher content.
   - 2 flag buttons: Nepal flag, UK flag. Global language and layout switch. You stay on the same screen and level, only the prompt source and keyboard glyphs change.
   - Name field (shows a name such as `tashi`, session only) and a readout `Avg.speed : 12 w/m` that updates live as you type.
5. Main content area: large white space above the prompt. Keep the generous empty space from the original. No mascot art in v1, only spacing.
6. Prompt display: two lines, left aligned, large Devanagari text:
   - Line 1 target text in blue: the full drill pattern (for example a repeated two syllable pattern).
   - Line 2 typed so far in black: mirrors line 1 up to the cursor, with a visible caret.
   - Repetition drill format in drill screens, not free sentences.
7. Virtual keyboard: large graphic spanning the lower half of the window:
   - Full physical layout with QWERTY row structure plus number row plus Tab, Caps Lock, Shift (both), Ctrl (both), Alt (both), Backspace, Enter, Space.
   - Beveled keycap rendering (light gray keys, dark borders, slight raised look).
   - Character keys: light gray or white keycap, glyph printed in blue. Most keys show two glyphs (smaller mark near top left plus larger primary glyph) for unshifted versus shifted output on the same physical key. Exact per key mapping must be verified against `src/domain/preeti.ts` (the `PREETI_MAP` table), never by reading glyphs off the screenshot. Devanagari conjuncts are easy to misread from a low resolution image.
   - Modifier keys (Tab, Caps Lock, Shift, Ctrl, Alt, Backspace, Enter): plain olive or khaki keycap, no glyph. They sit at row edges because that is where they live on a physical board, not as a deliberate zone highlight.
   - Next key highlight: exactly one key at a time is solid red. It tracks the cursor in the two line prompt and can land on any key (character key or space). Confirmed by two reference images: one shows red on the `म` character key matching the next letter due, the other shows red on the space bar.
   - English mode: identical geometry and color logic, glyphs are QWERTY letters instead of Devanagari.

Colors observed (approximate, verify against source images when you implement):

- Toolbar and panel background: light gray (`#D4D0C8` to `#ECE9D8` range, classic Windows Classic theme), chrome background.
- Main content background: white, content area.
- Target text line: blue, what to type.
- Typed text line: black, what has been typed.
- Character keycaps: light gray or white with blue glyph text, typable keys.
- Modifier keycaps: olive or khaki with no glyph, resting state.
- Next key highlight: red, live cue on whichever key is due next.
- Level indicators: green, yellow, red for easier, harder, more harder. Maps to success, warning, danger tokens in the new app.

## Screen set (confirmed)

Each category is its own screen. Each screen offers all three levels and both languages.

1. Home screen: home row keys only. Same drill mechanic as other drill screens, only the character set differs.
2. Top screen: top row keys only. Same shell, same prompt format, same keyboard.
3. Bottom screen: bottom row keys only. Same shell, same prompt format, same keyboard.
4. All screen: full keyboard. Mixed rows. Same shell, same prompt format, same keyboard.
5. Game screen: the Ramayana typing game from spec `0010`, surfaced through the Game toolbar button inside this shell (falling words you type before they land, with score, lives, and level). Lesson store stays untouched.
6. Free screen: unstructured typing with no target prompt. Same keyboard and live speed plus accuracy, no target line to match, no save to lesson progress in v1.

Difficulty rule (chosen by the engineer, enforced in domain code):

- Level 1 allows consecutive repeats. Pair drills such as `मम पप` are the classic example.
- Level 2 forbids an immediate repeat of the same unit. No prompt unit equals its direct neighbor.
- Level 3 keeps the Level 2 rule and uses longer mixed prompts (more units, wider character range).

Language behavior: language is not screen dependent. Switching flags preserves the active screen, level, and cursor shape and swaps the lesson source plus keyboard labels.

## Controls and behavior

- Category toolbar buttons navigate between the six screens. Drill screens (Home, Top, Bottom, All) share the drill mechanic and differ only in character set. Game and Free are genuinely different modes.* Level selector changes difficulty within the active screen, same format, tougher content per the rule above.
- Flag buttons switch active language and layout (Nepali Traditional versus English, plus Romanized where offered). Screen and level are preserved.
- Speed readout updates live as you type (visible as `Avg.speed`).
- Keyboard highlight updates key by key in live time: the red next key marker tracks the cursor in the two line prompt.

## Component mapping

- Category toolbar: new `components/CategoryToolbar.tsx`
- Level selector: new `components/LevelSelector.tsx` (success, warning, danger tokens)
- Language toggle: `components/LayoutSwitcher.tsx`
- Two line prompt: extends `components/PromptDisplay.tsx` (target and typed split) or new `components/ClassicPrompt.tsx` if the single line display must stay untouched
- Virtual keyboard with modifier tint plus next key highlight: extends `features/typing/VirtualKeyboard.tsx`, driven by `domain/classicLayout.ts` plus existing session hints. The original has no per finger color coding, only character versus modifier plus one red next key. Finger guidance stays as a text hint behind the existing setting, not as a second color layer.
- Menu bar: new `components/MenuBar.tsx` (in window bar for parity across systems)
- Name plus speed readout: session state, rendered in the toolbar panel. Name is session only in v1, not persisted.
- Game content: reuses `features/game/GameView.tsx` from spec `0010` inside this shell.
- Free content: new lightweight `features/typing/FreeTypingView.tsx` (no prompt, live stats, same keyboard).

## Source images

- Image 1: tight crop of prompt plus keyboard. Blue target line `मम पप मम पप मम पप मम`, red highlight on the `म` character key.
- Image 2: full window. Title bar plus menu plus six button toolbar plus Level 1 to 3 plus Nepal and UK flags plus name `tashi` plus `Avg.speed : 12 w/m` plus two line prompt plus keyboard with red on the space bar.
