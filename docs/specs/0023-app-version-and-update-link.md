# 0023. Show the real app version and link out to the download page

**Date**: 2026-10-09
**Status**: In Progress

## Summary

The app should show the version it is actually running, and give the user one button that opens your download page in their browser. Today the About dialog claims version 1.0.0 while the shipped app is 1.0.1, so the number is wrong. This spec reads the real version from the Tauri shell (the wrapper program that runs your app), shows it in Settings and in the About dialog, and adds a button that opens `https://typeshala.abhishekgaire.com.np`.

This is deliberately not an automatic updater. Automatic updates need a signing key that you must keep forever, a public feed file, and changes to your release pipeline. This spec avoids all of that. The user installs updates themselves, as they do today. The only thing this adds is that they can find out which version they are on, and where to get a newer one.

## Context

The app has two places where a user might reasonably look for the version: the Settings screen and the Help then About dialog. Only one of them exists, and it is wrong. The string `"Typeshala 1.0.0. ..."` is hardcoded into both `src/i18n/en.json` and `src/i18n/ne.json`, and rendered verbatim by `ClassicShell`. The shipped version is 1.0.1, per `package.json`, `src-tauri/tauri.conf.json`, and `src-tauri/Cargo.toml`. The number was correct once and drifts at every release after, because it depends on someone remembering to edit two translation files.

The second gap is discovery. Nothing in the app points a user toward new releases. A user who suspects they are on an old build has no in app route to find out or to act on it.

The Tauri framework already knows the running version and already exposes it to the frontend, and the `opener` plugin is already installed and registered. I confirmed from the generated capability files (`src-tauri/gen/schemas/desktop-schema.json` and `android-schema.json`) that `core:default` already expands to include `core:app:default`, which grants `getVersion()`, and that `opener:default` already expands to `allow-open-url` and `allow-default-urls`, which permits `https`. So neither half of this feature needs a new permission, a new dependency, a Rust change, or a CI change.

There is a constraint worth naming. The framework's own update mechanism was considered and declined in spec 0011 (`docs/specs/0011-polish-and-packaging-three-systems/rationale.md`, Option 3), with a follow up recorded at `index.md:119` to add it "only if out of band updates become a real need". This spec does not overturn that. It addresses the discovery half of the same problem and leaves the delivery half alone. The follow up at spec 0011 should stay open, because a user who installs by hand is still doing manual updates.

## Requirements

**User stories**:

- As a user, I want to see which version I am running, so that when something looks wrong I can tell you what I have.
- As a user, I want one button that takes me to the download page, so that getting a new version does not mean searching for the website.
- As a user, I want both of these in my own language, so that the app stays fully bilingual.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):

- **AC-1**: The Settings screen has a new About group, placed after the existing five groups, showing the running app version as text alongside a button. Both are inside a `role="group"` container labelled in the active UI language, matching how the five existing groups are structured.
- **AC-2**: The version shown is the value the Tauri shell reports through `getVersion()`, read once per app session and never re-read. It is not hardcoded in any translation file, so a release cannot make it stale.
- **AC-3**: The About dialog opened from Help shows the same running version as the Settings screen, and no longer shows the hardcoded `1.0.0` string. The literal `1.0.0` is removed from both `src/i18n/en.json` and `src/i18n/ne.json`.
- **AC-4**: Every new user facing string exists in both `en.json` and `ne.json`: the About group label, the version label, the fallback text, the button label, and the notice shown when the browser cannot be opened. No new string resolves blank in either language.
- **AC-5**: The button opens `https://typeshala.abhishekgaire.com.np` in the user's system browser through the `opener` plugin. The URL is held in one exported constant in the bridge and is not repeated in any component.
- **AC-6**: If the version read fails, `versionState` becomes `"failed"` and the version slot shows the localized fallback text, the button still works, and no error notice is raised. This is the expected state in a browser during development and in tests.
- **AC-7**: If the version read has not resolved yet, `versionState` is `"pending"` and the version slot renders nothing. No placeholder and no fallback text flash before the real value arrives.
- **AC-8**: If opening the browser fails, a localized notice is shown through the existing `ui.notice` path, which `App.tsx` already renders as a `role="status"` line. No second error display path is introduced.
- **AC-9**: The button is a native `button` element, is reachable by keyboard, and is not disabled while the browser is opening. Activating it twice in quick succession is harmless.
- **AC-10**: No stored data shape changes. `Settings` in `src/domain/datastore.ts`, `SCHEMA_VERSION`, and `mergeSettings` are untouched, and no migration runs.
- **AC-11**: No new dependency, no new capability entry, no Rust change, and no CI change is needed. The frontend calls two already permitted APIs.
- **AC-12**: The app makes no network request of its own. The only new outbound action is handing a URL to the operating system, which is what the `opener` plugin already does elsewhere in the framework.

## Options considered

### Option 1: A wrapped bridge read plus a wrapped open, in the existing bridge

Add `getAppVersion()` and `openDownloadPage()` to `src/infrastructure/tauriApi.ts`, hold the version in the existing `useUiSettings` hook, render it in the existing Settings screen and About dialog.

**Pros**:

- Every Tauri call stays behind the typed wrapper, which is the project's stated layering rule.
- One constant holds the URL, so moving the site later is a one line change.
- No new state shape, so the existing tests keep their shape.
- Smallest diff that satisfies every acceptance criterion.

**Cons**:

- `getAppVersion()` is the first bridge function that is not a `#[tauri::command]` invoke, so it needs its own error handling rather than the shared `call` helper.

### Option 2: A Rust command that returns the crate version

Add an `app_version` command to `src-tauri` returning `env!("CARGO_PKG_VERSION")`, exactly like the seven existing commands, and have the frontend invoke it.

**Pros**:

- Perfectly consistent with the other seven bridge functions, all of which are invoke based.
- No special case for a non invoke call.

**Cons**:

- Adds a command, a registration in `generate_handler!`, and a Rust test for a value the frontend can already read.
- Couples the frontend version to the crate, while the value Tauri reports comes from `tauri.conf.json`, which is what `tauri-action` uses for release tags. Two sources is one more than this feature needs.

### Option 3: Add placeholder support to the translator

Extend `t()` in `src/i18n/keys.ts` to fill `{{version}}` style placeholders, keep `about.body` as one sentence, and pass the version as a variable.

**Pros**:

- The About body stays a single natural sentence in both languages.
- Reusable if more strings ever need a variable.

**Cons**:

- Touches the i18n layer for one value, changing a function every view depends on.
- The version still has to render as its own line in Settings anyway, so the placeholder is used in exactly one place.

## Decision

**Chosen option**: Option 1: A wrapped bridge read plus a wrapped open, in the existing bridge

The app already gates every Tauri call behind a typed wrapper with one error shape, and the version read should not be the first exception. Both new functions go in `src/infrastructure/tauriApi.ts`, the URL lives in one exported constant there, and the version is held in `useUiSettings` beside the other UI state so `App.tsx` passes it down the same way it passes `theme`.

**Implementation skills**: `tauri` (`full-stack-skills/tauri-skills`, `.agents/skills/tauri/`) · `tauri-app-store` (`full-stack-skills/tauri-skills`, `.agents/skills/tauri-app-store/`)

## Rationale

Your `AGENTS.md` sets two rules that decide this. The first is that all bridge calls pass through a thin typed wrapper, and the second is that one steady error shape holds across bridge and UI. Option 2 satisfies the first rule too, but it spends a Rust command, a registration, and a test on a value that already crosses the bridge for free, and it introduces a second source of truth for the version that can disagree with the release tag. The shell's own `getVersion()` is the same value the release pipeline reads, so there is nothing to reconcile.

Option 3 is worth rejecting on a different ground. The stale `1.0.0` is not really a translator problem, it is a hardcoded value problem. Adding interpolation to `t()` would let the string stay whole, but the Settings screen needs the version on its own line regardless, so the placeholder would serve one call site while changing a function that every view in the app depends on. Fixing it by removing the literal from the bundles is both smaller and permanent.

On the update link itself: the honest reason to stop short of an automatic updater is the signing key. Tauri bakes a public key into the binary and trusts only signatures from its matching private key, forever. Once any user runs a build containing that key, losing the private key strands them permanently on that version with no path back. That is a permanent operational commitment for a project maintained by one person, in exchange for convenience the download page already provides. You already declined this in spec 0011 Option 3, and nothing about the discovery problem changes that calculus. What this spec fixes is the half that was actually broken: a version number that lied.

## Feature design

**Data model sketch**:

None. Nothing is persisted. The version is fixed at build time and is read once per session, so it is not stored in `Settings`, not added to the store file, and not part of `SCHEMA_VERSION`. The runtime shape added is one field on the existing hook return type:

| Field                        | Type                               | Nullable | Source                               | Lifetime                                             |
| ---------------------------- | ---------------------------------- | -------- | ------------------------------------ | ---------------------------------------------------- |
| `UiSettingsApi.version`      | `string \| null`                   | yes      | `getVersion()` via `getAppVersion()` | Read once per app session                            |
| `UiSettingsApi.versionState` | `"pending" \| "ready" \| "failed"` | no       | the read's own lifecycle             | pending until the read settles, then ready or failed |

Two fields, not one, because the view must render pending and failed differently (AC-6 against AC-7) and a bare `null` cannot express both. `versionState` starts at `"pending"`, moves to `"ready"` with `version` set on resolve, and to `"failed"` with `version` left `null` on rejection. It never moves again within a session.

Two constants are added to the bridge:

| Name                | Type     | Value                                    |
| ------------------- | -------- | ---------------------------------------- |
| `DOWNLOAD_PAGE_URL` | `string` | `https://typeshala.abhishekgaire.com.np` |

**State transitions**:

None. The version has one stable value per session. There is no state machine, because there is no state to move between.

**API surface**:

No network endpoints. The feature adds two bridge functions and one component prop.

| Action                                                   | Kind                             | Inputs                             | Outputs                               | Auth                      | Errors                                                                   |
| -------------------------------------------------------- | -------------------------------- | ---------------------------------- | ------------------------------------- | ------------------------- | ------------------------------------------------------------------------ |
| `getAppVersion()`                                        | bridge function in `tauriApi.ts` | none                               | `Promise<string>`                     | none, local process       | Throws `BridgeError` with code `bridge-failed` if the shell read rejects |
| `openDownloadPage()`                                     | bridge function in `tauriApi.ts` | none                               | `Promise<void>`                       | none, delegates to the OS | Throws `BridgeError` with code `bridge-failed` if the opener rejects     |
| `version` prop on `SettingsView` and `ClassicShell`      | component prop                   | `string \| null`                   | rendered as text                      | n/a                       | n/a                                                                      |
| `versionState` prop on `SettingsView` and `ClassicShell` | component prop                   | `"pending" \| "ready" \| "failed"` | selects what the version slot renders | n/a                       | n/a                                                                      |

Rendering rule for the version slot, driven by `versionState`:

| `versionState` | Render                                             |
| -------------- | -------------------------------------------------- |
| `pending`      | nothing                                            |
| `ready`        | the version string                                 |
| `failed`       | the localized fallback, `about.versionUnavailable` |

**Value sourcing**:

| Action                   | Value produced or displayed       | Source                                                                                                                                                                      |
| ------------------------ | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getAppVersion()`        | the running version string        | `getVersion()` from `@tauri-apps/api/app`, which reports the app version compiled in from `src-tauri/tauri.conf.json` at build time. It does not read that file at runtime. |
| Settings About group     | the version text                  | `UiSettingsApi.version`, passed from `App.tsx` as the `version` prop                                                                                                        |
| Settings About group     | the group label                   | new key `settings.about` in `en.json` and `ne.json`                                                                                                                         |
| Settings About group     | the "Version" prefix label        | new key `about.version` in `en.json` and `ne.json`                                                                                                                          |
| Settings About group     | the fallback when the read failed | new key `about.versionUnavailable` in `en.json` and `ne.json`                                                                                                               |
| Settings About group     | the button label                  | new key `settings.getUpdates` in `en.json` and `ne.json`, worded so it does not promise a check                                                                             |
| About dialog             | the version text                  | the same `UiSettingsApi.version`, passed from `App.tsx` as the `version` prop                                                                                               |
| About dialog             | the body sentence                 | existing key `about.body`, with the hardcoded `1.0.0` removed from both bundles                                                                                             |
| `openDownloadPage()`     | the target URL                    | the `DOWNLOAD_PAGE_URL` constant in `tauriApi.ts`                                                                                                                           |
| Notice on opener failure | the failure message               | new key `settings.openFailed` in `en.json` and `ne.json`, set through the existing `ui.notice` path                                                                         |

Every value an acceptance criterion displays has a named source. `/develop` does not need to invent a placeholder, a URL, or a fallback string.

**Key invariants**:

- The version displayed is never a literal in any file under `src/i18n/`. A test asserts neither bundle contains the substring `1.0.0`.
- No view imports from `@tauri-apps/api` or any `@tauri-apps/plugin-*` package directly. Both calls go through `tauriApi.ts`.
- The version read never gates the first screen. `App.tsx` continues to gate on `ui.loaded` only.
- A failed version read never raises a notice and never blocks the update button.

**Security model**:

No authentication, no roles, no ownership. The app is local only and this feature adds no data and no network request from the app process.

The URL is a compile time constant, so no user input reaches the opener call and there is no injection surface. The `opener:default` permission set already scopes the plugin to `https`, `http`, `mailto`, and `tel`, so the call cannot be redirected even if the constant were wrong. No personal data, no credentials, no new configuration or secrets.

**Configuration required**:

None. No new environment variables, no new capability entries, no new secrets.

**Critical test scenarios** (each maps to an acceptance criterion in ## Requirements):

- Happy path: settings load, `getVersion()` resolves to `1.0.2`, the About group renders that string and activating the button calls `openUrl` with `DOWNLOAD_PAGE_URL`, verifies **AC-1**, **AC-2**, **AC-5**
- Both languages: rendering under `ne` shows non blank values for all five new keys, verifies **AC-4**
- Stale value gone: neither `en.json` nor `ne.json` contains `1.0.0`, and the About dialog shows the read version rather than a literal, verifies **AC-3**
- Pending case: the read has not resolved, `versionState` is `"pending"`, the version slot is empty and contains neither the fallback nor a placeholder, verifies **AC-7**
- Failure case: the read rejects, `versionState` is `"failed"`, the slot shows the fallback text, no notice is set, and the button still calls the opener, verifies **AC-6**
- Transition case: the read resolves then the same render shows the real version with no intermediate fallback frame, so pending and failed are distinguishable states rather than one `null`, verifies **AC-6**, **AC-7**
- Failure case: the opener rejects, `ui.notice` becomes `settings.openFailed` and `App.tsx` renders it in the existing status line, verifies **AC-8**
- Accessibility: the About button is a native `button`, reachable by tab, and has an accessible name in the active language, verifies **AC-9**
- No persistence: saving settings writes the unchanged shape and `SCHEMA_VERSION` is still `1`, verifies **AC-10**
- Bridge unit: `getAppVersion` normalizes a rejected shell read to a `BridgeError`, and `openDownloadPage` passes `DOWNLOAD_PAGE_URL` unchanged, verifies **AC-5**, **AC-11**

## Build plan

Build approach is Skateboard from the scope header: the thinnest usable whole first, then grow. Here that means the whole feature becomes visible and correct in one pass, ordered from the layer everything depends on outward, with no scaffolding step that ships on its own.

- [x] 1. Add `DOWNLOAD_PAGE_URL`, `getAppVersion()`, and `openDownloadPage()` to `src/infrastructure/tauriApi.ts`, with `getAppVersion` normalizing failures through `toBridgeError` and `openDownloadPage` delegating to `openUrl` from `@tauri-apps/plugin-opener`. Satisfies **AC-5**, **AC-11**, **AC-12**
- [x] 2. Add the five new keys to both `src/i18n/en.json` and `src/i18n/ne.json`, and remove the leading `"Typeshala 1.0.0."` from the existing `about.body` in both. After removal `about.body` must still be a well formed sentence on its own in each language: English drops a trailing period with the removed fragment, Nepali drops its `।` separator, which sits after the removed fragment. The remaining guidance about levels and free runs is unchanged. Satisfies **AC-3**, **AC-4**
- [x] 3. Add `version: string | null` plus `versionState: "pending" | "ready" | "failed"`, and an `openDownloadPage` callback to `useUiSettings`, reading the version once on mount, setting `"ready"` on resolve and `"failed"` on rejection, and never re-reading. Satisfies **AC-2**, **AC-6**, **AC-7**
- [x] 4. Add the About group to `SettingsView` as a sixth `Group`, rendering the version line and the button, and add the `version` and `onGetUpdates` props. Satisfies **AC-1**, **AC-5**, **AC-9**
- [x] 5. Add the `version` prop to `ClassicShell` and render it in the About dialog above the body text. Satisfies **AC-3**
- [x] 6. Wire both from `App.tsx`, passing `ui.version` to `SettingsView` and `ClassicShell` and wiring the button through `useUiSettings` to the bridge, setting the existing `settings.openFailed` notice key on rejection. Satisfies **AC-5**, **AC-8**
- [x] 7. Add or update tests: the bridge unit tests, a hook test for the once per session read and the failure path, a `SettingsView` test for the About group and the empty pending state, a `ClassicShell` test for the About dialog version line, and the i18n test for no blanks plus no `1.0.0` literal. Satisfies **AC-2**, **AC-3**, **AC-4**, **AC-6**, **AC-7**, **AC-10**, **AC-11**
- [x] 8. Confirm no capability, dependency, Rust, or CI file changed, and that `npm run lint`, `npm run format:check`, `npm run typecheck`, and `npm test` all pass. Satisfies **AC-10**, **AC-11**, **AC-12**

## Consequences

**Positive**:

- The version shown can never be wrong, because it is read rather than written.
- Release stops depending on someone editing two translation files.
- Users get an in app route to a new version without any new infrastructure.
- No signing key, no feed file, no release pipeline change, nothing irreversible.
- The app stays fully offline and keeps its first launch promise.

**Negative / tradeoffs**:

- The button cannot tell the user whether an update exists. It opens a page; the user still has to compare versions themselves. This is the cost of not shipping a feed, and it is the main thing this feature gives up.
- The label must avoid wording that promises a check. "Get updates" is honest, "Check for updates" would not be.
- Two extra bridge functions that are not invoke based, so they do not share the `call` helper and carry their own error handling.
- The version read is a real async call on startup, off the critical path but present.

**Neutral**:

- `SCHEMA_VERSION` stays `1` and `mergeSettings` is untouched.
- The `Settings` stored shape is unchanged, so existing install data is unaffected.
- The `About` group is the first group in `SettingsView` that is text plus a button rather than a row of choices, so its internal layout differs from the five above it.

## Follow-up

- [ ] No `docs/design/` guide is written for this feature, and that is deliberate. The change adds no new screen, no new layout, and no new component: it appends one `Group` to an existing screen using the same `Group` component and same `Button` component as the five above it, and adds one line to an existing dialog. There is no composition to document. Note it here so the absence reads as a choice rather than an oversight.
- [ ] The spec 0011 follow up "Add updater only if out of band updates become a real need" stays open. This spec does not close it. Reopen the question only if users report they cannot find or install new versions from the download page.
- [ ] Consider whether the download page should state the latest version in plain text, so a user comparing against the About dialog can do so without downloading anything.
