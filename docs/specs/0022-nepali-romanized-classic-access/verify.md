# Verify: Nepali Romanized classic access · spec 0022 · updated 2026-10-09

_Steps derived from spec 0022 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## Log evidence

The app carries a verification log channel: the events below print to the
`npm run tauri dev` terminal and append to
`~/.local/share/com.abhishek.typeshala/typeshala-verify.log`. The channel stays
in the Rust bridge, so it is cheap to add a frontend emitter back later. Only the
events that the still open manual steps need are wired up now; the rest were
removed once their steps passed, so a run stays readable.

| Event           | Emitted when                        | Carries                                                                   | Covers     |
| --------------- | ----------------------------------- | ------------------------------------------------------------------------- | ---------- |
| `drill_row`     | a drill screen resolves its row     | screen, level, layout, row id, difficulty, prompt preview                 | AC-2       |
| `key_press`     | a physical key is pressed           | key, code, expected code, correct flag, layout                            | AC-3, AC-4 |
| `key_backspace` | backspace is pressed                | layout                                                                    | AC-4       |
| `roman_state`   | the romanized session state changes | units, buffer, next unit, hint, sequenceHint, keystrokes, errorHits, done | AC-3, AC-4 |

`roman_state` fires once per key press. Live words per minute and accuracy are
deliberately not logged: they tick every 100ms and would drown the events the
open steps need.

## UI / manual

- [x] Launch the app, click the अ control in the toolbar → the whole shell switches to Nepali Romanized, अ shows pressed while the flag controls do not, and the screen, level, and restart state carry over → AC-1
- [x] Open Settings → three layout choices are listed, Nepali Romanized matches the toolbar state, and the Settings entry still saves and survives a restart → AC-1, AC-5
- [x] Home level 1 romanized: type the prompted roman sequences → the Devanagari prompt colors per unit, the roman key for the next letter lights, and the remaining roman letters print under the board → AC-3
- [x] Type `a` then `a` where आ is expected → the screen shows अ then a pending `a` for आ, not one आ, and the unit coloring stays aligned to the end of the prompt → AC-3
- [x] Wrong key on a romanized drill (for example `x`) → exactly one error hit counts, the wrong key marks, the cursor holds, and the wrong key never sits in the pending buffer, so no backspace is needed to clear it → AC-4
- [ ] Pending key backspace → press a key that starts the expected sequence (roman `a` while आ is due, roman `k` while क is due, Preeti `l` for the pre-posed matra) so it holds in the buffer, then backspace → the buffer clears while the completed units stay put → AC-4
- [x] Finish a full drill end to end → the attempt saves with layout `romanized`, and the board and paging behave as they do in English and Traditional → AC-4
- [x] Switch the UI language to Nepali → all three layout control titles read correctly in Nepali → AC-1
- [x] Free screen under romanized → raw key presses echo exactly as they do today in every layout, with no save → AC-5
- [x] Restart the app after a run → stored settings (including a romanized selection) and past attempts open unchanged → AC-5
- [x] Level 2 and 3 on each screen → after milestone 3 lands, every level opens real romanized rows rather than the empty state → AC-2

Manual steps run on 2026-10-09 against the real app; log channel events cited in the
check report. Step 10 was closed by the level sweep: all twelve rows resolved with the
right ids, categories, and difficulties (`cl-home-1-rn` through `cl-all-3-rn`).

The wrong key step is closed on combined evidence: your log shows every wrong press
moving `errorHits` by exactly one with the units untouched, and the unit suite proves
the wrong key marks on the board and never stays in the pending buffer, which is why no
backspace is needed after a wrong key. That holds in all three layouts: the romanized
and Preeti engines both clear the buffer in the miss branch, and qwerty keeps no buffer
at all, its chars commit or miss in place.

The pending key backspace step stays open on purpose. It covers the other kind of hold:
a key that starts the expected sequence and waits for its second letter, where backspace
does clear the buffer before touching a completed unit. The unit suite locks that rule
for romanized and Preeti; nobody has watched it on screen yet.

## Commands

- [x] `npm test` → the romanized session suite, the drill lint and snapshot, and the shell and screen tests all pass, and the English and Traditional rows stay byte identical in the snapshot → AC-2, AC-3, AC-4, AC-6
- [x] `npm run typecheck` → clean → AC-6
- [x] `npm run lint` → clean → AC-6
- [x] `npm run format:check` → clean → AC-6

## Acceptance-criteria coverage

- AC-1 covered by steps 1, 2, 7
- AC-2 covered by command step 1 and manual step 10
- AC-3 covered by manual steps 3, 4
- AC-4 covered by manual steps 5, 6
- AC-5 covered by manual steps 2, 8, 9
- AC-6 covered by command steps 1 through 4
