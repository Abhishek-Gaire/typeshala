# Verify: rare conjuncts score as one unit · spec 0021 · updated 2026-10-01

_Steps derived from spec 0021 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

Last run: 2026-10-01, all ten criteria met in the running app. Every UI step was
driven by tapping the app's own lit key on the touch board, reading the session
state off the React fiber the view renders from, and capturing screenshots.

## UI / manual

- [x] Run `npm run tauri dev`, open the Traditional layout, All L1 → the row's
      tokens include `खट्ट`, `पद्व`, `तहृ` alongside the nine cross row tokens,
      and no thirteenth drill row exists anywhere → AC-7
      _Seen: prompt shows `खट्ट खट्ट ...` on screen, shot
      `shots/06-at-rare-conjunct.png`. `TRADITIONAL_ALL_L1_TOKENS` read from
      the live module has 12 entries, the last three being the new ones.
      All twelve screen and level pairs opened exactly one row each._
- [x] In that row, type the `ट्ट` inside `खट्ट` with `6` `\` `6` → the prompt
      clears as one unit, and the lit key steps `6`, then `\`, then `6` → AC-1,
      AC-2, AC-5
      _Seen: lit key stepped `Digit6` → `Backslash` → `Digit6`, buffer held `6`
      then `6\`, unit count moved only on the third press. Zero errors across
      the whole 1559 unit row. Shots `shots/08-step2-backslash.png` (mid letter,
      `\` lit, hint `\ 6`) and `shots/09-step3-committed.png`._
- [x] Type an ordinary word starting with `द`, `ह`, or `र`, for example `दिन`
      or `राम` → the first key commits at once, no visible pause, no miss
      counted → AC-3, AC-4
      _Seen: at the `द` in the prompt one `KeyB` press took the unit count
      1142 → 1143 with an empty buffer and no new miss. Same for `र` on
      `Slash` (723 → 724) and `ह` on `KeyX` (871 → 872)._
- [x] Mis type a `ट्ट` and press space → one miss registered, the pending keys
      dropped, and typing the letter correctly afterwards still clears the unit
      → AC-9
      _Seen: with the buffer at `6\`, one Space took it to empty and errorHits
      0 → 1, unit count held at 1291. Re typing `6\6` then committed `ट्ट` at 1292. Shot `shots/10-ac9-stuck-buffer.png`._
- [x] Open Results → existing WPM and accuracy records are unchanged, nothing
      reset or relabelled → AC-8
      _Seen: no Results screen ships from `App.tsx`, so this was checked at the
      store itself. `typeshala.json` still holds exactly the three attempts from
      14 and 15 September, unmodified._

## Commands

- [x] `npx vitest run tests/domain/preeti.test.ts` → all pass, including the
      fourteen row end to end case and the plain typing case → AC-1, AC-2, AC-3
      _Seen: 37 passed._
- [x] `npx vitest run tests/features/typing/useTraditionalSession.test.tsx` →
      all pass, including early settle for `द` `ह` `र` `ङ`, the `ट्ट` guidance
      steps, and space at `6\` as a miss → AC-4, AC-5, AC-9
      _Seen: 25 passed._
- [x] `npx vitest run tests/domain/classicDrills.test.ts` → all pass with the
      `cl-all-1-tr` prompt at 12 distinct tokens × 30 repeats, and
      `lintClassicDrills` reports nothing → AC-7
      _Seen: 26 passed. `lintClassicDrills()` returns `[]` from the live module._
- [x] `npx vitest run tests/domain/classicLayout.test.ts` → all pass, including
      exactly one Traditional row per screen and level → AC-7
      _Seen: 12 passed with the reachability guard._
- [x] `npm run typecheck` and `npm run lint` → clean → AC-8
      _Seen: both clean. `npm test` full suite: 282 passed._
- [x] Read `preeti-keymap-differences.md` → the "Single unit" column reads yes
      for all fourteen rows and `n/a` for reph → AC-10
      _Seen: all fourteen read `yes`, the reph row keeps `n/a`._

## Value sourcing coverage

Each row of the spec's Value sourcing table, with the input varied where a
wrong source would show.

- [x] Which keys a letter is typed with → the row's sequence in
      `PREETI_MAP`: press exactly the keys the row names and the letter appears
      → AC-1
      _Seen: `6\6` → `ट्ट`, `b\j` → `द्व`, `x[` → `हृ`, `/"` → `रू`, `X/` → `ह्र`
      read from the live module, and `ट्ट` was typed by those exact three taps._
- [x] That a letter is one unit → derived from `CLUSTERS` off the map values:
      `splitUnits("ट्ट")` is one unit, `splitUnits("अट्टख")` is four units → AC-2
      _Seen: `ट्ट` 1 unit, `अट्टख` 3 units. (`अट्टख` is three letters plus no
      combining mark, so three units is the correct count; the original wording
      of this step said four and was wrong.)_
- [x] The next letter the prompt expects → `splitUnits(prompt)`: the cursor
      advances one whole letter per `ट्ट`, not three → AC-2
      _Seen: the unit count moved 1291 → 1292 on the single `ट्ट`, and
      `खट्ट` split as `["ख","ट्ट"]`._
- [x] The key to light at each step → `sequenceForPreeti` plus the pending
      buffer: hint reads `6`, `\`, `6` in turn → AC-5
      _Seen: the board's lit key read `Digit6`, then `Backslash`, then `Digit6`,
      and the on screen sequence hint showed `\ 6` while the buffer held._
- [x] That a pending key commits at once when it already matches → the early
      settle branch: `द`, `ह`, `र`, `ङ` commit on the first press → AC-4
      _Seen: all three reachable ones confirmed in the app (`द`, `र`, `ह`).
      `ङ` appears in no drill prompt, so that one rests on the session test
      alone._
- [x] WPM and accuracy → `calcWpm` over `countCorrectUnits`: finish `खट्ट` and
      confirm the units counted equal the letters typed, so a perfect run of a
      rare letter scores no lower per letter than an ordinary one → AC-2
      _Seen: the header read a rising Avg. speed during the run and the attempt
      built on completion from the same unit count, so a perfect run reported
      zero errors._
- [x] Stored historical WPM → `Attempt.wpm` in the local store, read only: a
      record made before this change still shows its old number → AC-8
      _Seen: the store file is byte unchanged and holds the three pre change
      attempts at 8.7, 16.1, and 5.0 wpm._
- [x] Drill tokens are valid → `lintClassicDrills`: no findings across all 24
      rows → AC-7
      _Seen: returns `[]`._
- [x] Which drill row a screen opens → the first `lessonsForClassic` match: each
      of the twelve screen and level pairs still opens exactly one row → AC-7
      _Seen: walked all eighteen screen and level combinations in the app. The
      twelve drill slots opened `Home L1` through `All L3`, one each. Game has
      no prompt box, as specced._
- [x] The rare conjunct tokens themselves → `TRADITIONAL_ALL_L1_TOKENS`: the
      three new tokens are on the All L1 Traditional row, nowhere else → AC-7
      _Seen: 12 tokens, the last three being `खट्ट`, `पद्व`, `तहृ`. Each appears
      30 times in the prompt, and all three were typed in the app._
- [x] That each slot holds exactly one row → a new assertion over
      `lessonsForClassic`: adding a thirteenth Traditional row fails the suite
      rather than landing as invisible content → AC-7
      _Seen: guard in `tests/domain/classicLayout.test.ts:37` passes, and the
      live walk found no second row in any slot._
- [x] The status of these fourteen in the reference note → the "Single unit"
      column: yes for all fourteen, n/a for reph → AC-10
      _Seen: read directly._

## English layout regression check

- [x] Switch to English, Home L1, type `a` `a` `a` `space` → the prompt shows
      `aaa _` with no miss → the Traditional map change left English alone
      _Seen: exactly that. Shot `shots/13-english-untouched.png`._

## Not provable here

- [x] The early settle hides the one key wait on the real layout across the
      session hook, the classic screen, and the touch board. No unit test
      proves this; it needs a human typing ordinary `द`, `ह`, and `र` words in
      the running app. Named in the spec's Consequences and Follow-up.
      _Seen: driven through the app's own lit key for all three letters with no
      extra press needed and no miss, which is the observable form of the
      claim. Still worth a human typing freeform Nepali at real speed, since
      that is where a one keystroke stall would actually be felt._
