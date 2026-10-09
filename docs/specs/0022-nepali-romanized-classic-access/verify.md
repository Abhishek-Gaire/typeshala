# Verify: Nepali Romanized classic access · spec 0022 · updated 2026-10-09

_Steps derived from spec 0022 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual

- [ ] Launch the app, click the अ control in the toolbar → the whole shell switches to Nepali Romanized, अ shows pressed while the flag controls do not, and the screen, level, and restart state carry over → AC-1
- [ ] Open Settings → three layout choices are listed, Nepali Romanized matches the toolbar state, and the Settings entry still saves and survives a restart → AC-1, AC-5
- [ ] Home level 1 romanized: type the prompted roman sequences → the Devanagari prompt colors per unit, the roman key for the next letter lights, and the remaining roman letters print under the board → AC-3
- [ ] Type `a` then `a` where आ is expected → the screen shows अ then a pending `a` for आ, not one आ, and the unit coloring stays aligned to the end of the prompt → AC-3
- [ ] Type a sequence no map row starts (for example `x`) → one error hit counts, the wrong key marks, and backspace clears the pending buffer before removing a completed char → AC-4
- [ ] Finish a full drill end to end → the attempt saves with layout `romanized`, and the board and paging behave as they do in English and Traditional → AC-4
- [ ] Switch the UI language to Nepali → all three layout control titles read correctly in Nepali → AC-1
- [ ] Free screen under romanized → raw key presses echo exactly as they do today in every layout, with no save → AC-5
- [ ] Restart the app after a run → stored settings (including a romanized selection) and past attempts open unchanged → AC-5
- [ ] Level 2 and 3 on each screen → after milestone 3 lands, every level opens real romanized rows rather than the empty state → AC-2

## Commands

- [ ] `npm test` → the romanized session suite, the drill lint and snapshot, and the shell and screen tests all pass, and the English and Traditional rows stay byte identical in the snapshot → AC-2, AC-3, AC-4, AC-6
- [ ] `npm run typecheck` → clean → AC-6
- [ ] `npm run lint` → clean → AC-6
- [ ] `npm run format:check` → clean → AC-6

## Acceptance-criteria coverage

- AC-1 covered by steps 1, 2, 7
- AC-2 covered by command step 1 and manual step 10
- AC-3 covered by manual steps 3, 4
- AC-4 covered by manual steps 5, 6
- AC-5 covered by manual steps 2, 8, 9
- AC-6 covered by command steps 1 through 4
