# 0023 rationale · app version and update link

Reasoning and options behind `index.md`. `/develop` skips this file; humans and `/architect` read it.

## Context

The app has two places where a user might reasonably look for the version: the Settings screen and the Help then About dialog. Only one of them exists, and it is wrong. The string `"Typeshala 1.0.0. ..."` is hardcoded into both `src/i18n/en.json` and `src/i18n/ne.json`, and rendered verbatim by `ClassicShell`. The shipped version is 1.0.1, per `package.json`, `src-tauri/tauri.conf.json`, and `src-tauri/Cargo.toml`. The number was correct once and drifts at every release after, because it depends on someone remembering to edit two translation files.

The second gap is discovery. Nothing in the app points a user toward new releases. A user who suspects they are on an old build has no in app route to find out or to act on it.

The Tauri framework already knows the running version and already exposes it to the frontend, and the `opener` plugin is already installed and registered. I confirmed from the generated capability files (`src-tauri/gen/schemas/desktop-schema.json` and `android-schema.json`) that `core:default` already expands to include `core:app:default`, which grants `getVersion()`, and that `opener:default` already expands to `allow-open-url` and `allow-default-urls`, which permits `https`. So neither half of this feature needs a new permission, a new dependency, a Rust change, or a CI change.

There is a constraint worth naming. The framework's own update mechanism was considered and declined in spec 0011 (`docs/specs/0011-polish-and-packaging-three-systems/rationale.md`, Option 3), with a follow up recorded at `index.md:119` to add it "only if out of band updates become a real need". This spec does not overturn that. It addresses the discovery half of the same problem and leaves the delivery half alone. The follow up at spec 0011 should stay open, because a user who installs by hand is still doing manual updates.

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

## Rationale

Your `AGENTS.md` sets two rules that decide this. The first is that all bridge calls pass through a thin typed wrapper, and the second is that one steady error shape holds across bridge and UI. Option 2 satisfies the first rule too, but it spends a Rust command, a registration, and a test on a value that already crosses the bridge for free, and it introduces a second source of truth for the version that can disagree with the release tag. The shell's own `getVersion()` is the same value the release pipeline reads, so there is nothing to reconcile.

Option 3 is worth rejecting on a different ground. The stale `1.0.0` is not really a translator problem, it is a hardcoded value problem. Adding interpolation to `t()` would let the string stay whole, but the Settings screen needs the version on its own line regardless, so the placeholder would serve one call site while changing a function that every view in the app depends on. Fixing it by removing the literal from the bundles is both smaller and permanent.

On the update link itself: the honest reason to stop short of an automatic updater is the signing key. Tauri bakes a public key into the binary and trusts only signatures from its matching private key, forever. Once any user runs a build containing that key, losing the private key strands them permanently on that version with no path back. That is a permanent operational commitment for a project maintained by one person, in exchange for convenience the download page already provides. You already declined this in spec 0011 Option 3, and nothing about the discovery problem changes that calculus. What this spec fixes is the half that was actually broken: a version number that lied.
