# Verify: App version and update link · spec 0023 · updated 2026-10-09

_Steps derived from spec 0023 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual

Run the packaged app (`npm run tauri dev`) for the Tauri backed steps. Use a browser (`npm run dev`) for the two failure states, since there is no shell there.

- [x] Launch the app, open Settings from the menu bar → an About group appears after the five existing groups, showing a version and a "Get updates" button → AC-1
- [x] Read the version in that group → it matches `src-tauri/tauri.conf.json` (currently 1.0.1), not a hardcoded number → AC-2
- [x] Open Help → About → the same version shows in the dialog, and no `1.0.0` appears anywhere → AC-3
- [x] Switch the UI language to Nepali, revisit Settings and the About dialog → all five new strings are translated and none is blank → AC-4
- [x] Press "Get updates" → the system browser opens `https://typeshala.abhishekgaire.com.np` → AC-5
- [ ] NOT EXERCISED (needs a Tauri-less run): in the browser build (`npm run dev`), Settings should read "Unknown" with the button still present → AC-6 (covered by unit tests instead)
- [x] With the app running, watch the first paint of Settings → the version slot is empty at first, never a flash of "Unknown" before the value arrives → AC-7 (probe shows no pending frame after settle)
- [x] Tab from the top of Settings to the About button, press Enter twice quickly → focus lands on the button, and two presses do not error or freeze the button → AC-9
- [ ] NOT EXERCISED (no failing-opener run): press "Get updates" with no browser available → a notice line should appear at the top, not a crash → AC-8 (covered by unit tests instead)

## Commands

- [x] `npm run lint` → clean, no errors → AC-11
- [x] `npm run format:check` → "All matched files use Prettier code style!" → AC-11
- [x] `npm run typecheck` → clean, no output → AC-11
- [x] `npm test` → all suites pass → AC-2, AC-3, AC-4, AC-6, AC-7, AC-10, AC-11
- [x] `git diff --stat HEAD~1 -- src-tauri/ .github/ package.json package-lock.json` → no files changed → AC-11
- [x] `grep -rn "1\.0\.0" src/` → no matches → AC-3
- [x] `grep -n "SCHEMA_VERSION = " src/domain/datastore.ts` → still `1` → AC-10
- [x] `grep -rn "@tauri-apps/api/app\|@tauri-apps/plugin-opener" src/ --include=*.tsx` → no matches; only `tauriApi.ts` imports them → AC-11, AC-12

## Value sourcing

One step per row of the spec's Value sourcing table, so each displayed value is checked against its named source.

- [x] Version text in Settings and in About → comes from `getVersion()`, equal to the `tauri.conf.json` version → AC-2
- [x] Settings group label, version prefix, fallback, button label → resolve from `en.json` / `ne.json` and change with the language toggle → AC-4
- [x] About body sentence → renders with no version fragment and stays a well formed sentence in both languages → AC-3
- [x] Button target URL → equals the `DOWNLOAD_PAGE_URL` constant in `tauriApi.ts`, opened exactly once per press → AC-5
- [x] Opener failure notice → reaches the existing `role="status"` line in `App.tsx` through `ui.notice` → AC-8 (unit test `useUiSettings-version.test.ts`)

## Acceptance-criteria coverage

- AC-1 covered by "open Settings ... an About group appears" · AC-2 by "matches `tauri.conf.json`" and the Value sourcing version row · AC-3 by "About dialog" plus the two grep steps · AC-4 by "switch to Nepali" · AC-5 by "press Get updates" · AC-6 by "browser build reads Unknown" · AC-7 by "no flash on first paint" · AC-8 by "no browser available" · AC-9 by "Tab ... press Enter twice" · AC-10 by the `SCHEMA_VERSION` step · AC-11 by the four command steps and the two diff/grep steps · AC-12 by the no-direct-import grep and the browser build (no network request from the app)
