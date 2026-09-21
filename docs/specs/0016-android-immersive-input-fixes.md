# 0016. Android immersive mode and virtual keyboard fixes

**Date**: 2026-09-18
**Status**: Accepted

## Summary

The Android build targets landscape use but two usability issues block daily use: typing in the practice area summons the device keyboard, which covers the app board, and the system status bar (network, battery, notifications) is permanently visible. This spec adds immersive fullscreen mode that hides the status bar until the user swipes down, keeps the device keyboard hidden during practice, and makes the app board itself handle touch so every tap types directly. It also locks orientation to landscape (no lock exists in the repo today).

## Context

The Tauri Android activity (`MainActivity.kt:7-10`) calls `enableEdgeToEdge()`, which draws behind system bars without hiding them, so the status bar stays visible and consumes screen space. The activity manifest (`AndroidManifest.xml:13-25`) declares no `windowSoftInputMode` and no `screenOrientation`, so orientation is not actually locked (`configChanges="...screenSize..."` only suppresses activity recreation, it does not lock orientation). On the web side the practice boxes are focusable divs, and a touch driven focus summons the device keyboard, which covers the app board; meanwhile the board itself (`ClassicKeyboard`) is display only with no tap path. The fix has two halves: native config that hides bars and keeps the device keyboard down, and a tap path on the app board so touch types directly with no IME involved.

## Requirements

**User stories**:

- As a learner, I want the device keyboard to stay hidden so it never covers the practice board.
- As a learner, I want every tap on the app board to type its key so I can practice typing on Android with touch alone.
- As a learner, I want the status bar hidden during practice so the full screen is available for the prompt and input area.
- As a learner, I want to reveal the status bar by swiping down from the top edge when I need to check battery or notifications.

**Acceptance criteria**:

- **AC-1**: The device keyboard never appears during practice (touch on the practice box is focus guarded, activity uses `stateHidden|adjustPan`); each tap on the app board inserts the corresponding character with the same correctness marking as the physical path.
- **AC-2**: Status bar and navigation bar are hidden at app start in landscape orientation.
- **AC-3**: Swiping down from the top edge reveals the status bar; it auto-hides after a short delay or when the user taps the content.
- **AC-4**: Orientation is locked to landscape via `android:screenOrientation="sensorLandscape"` (new lock; none exists in the repo today).
- **AC-5**: No regression on desktop or other mobile targets.

## Options considered

### Option 1: Immersive sticky mode via WindowInsetsController (recommended)

Use `WindowCompat.setDecorFitsSystemWindows(window, false)` with `WindowInsetsControllerCompat` to hide system bars in transient sticky immersive mode: hide `statusBars()` plus `navigationBars()`, set `systemBarsBehavior = BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE`, and re-apply on `onWindowFocusChanged`. Add `android:windowSoftInputMode="stateHidden|adjustPan"` and `android:screenOrientation="sensorLandscape"` to the activity manifest: the device keyboard is no longer the input path, so it stays hidden on entry and never resizes the fullscreen board. On the web side, `ClassicKeyboard` gains an `onTapKey` path (char, space, and Backspace render as buttons outside the tab order) wired into the drill and free views with the same session calls as physical keydown, and the practice boxes guard touch focus via `pointerType === "touch"` preventDefault. No direct WebView hacking: Tauri owns the WebView (created in/after `TauriActivity.super.onCreate()`), so `setJavaScriptEnabled` / `setSupportMultipleWindows` / `WebChromeClient.onShowCustomView` (a fullscreen-video callback) do not fix input and must not run before `super.onCreate()`.

**Pros**:

- Modern API (Android 11+), backward compatible via compat library
- Sticky immersive auto-hides bars on touch, matches user expectation
- Single source of truth in `MainActivity.kt`

**Cons**:

- Requires an explicit `androidx.core:core:1.12.0+` dependency (today `app/build.gradle.kts` has no explicit `androidx.core` entry; it arrives only transitively via `appcompat`/`activity-ktx`, version unpinned)

### Option 2: Legacy `SYSTEM_UI_FLAG_IMMERSIVE_STICKY`

Use deprecated `View.SYSTEM_UI_FLAG_*` flags on the decor view.

**Pros**:

- Works on older Android versions without compat library

**Cons**:

- Deprecated since API 30 (still present but deprecated through API 35; do not rely on it going forward)
- Fragile across orientation changes

### Option 3: Fullscreen theme only

Set `android:theme="@style/Theme.AppCompat.NoActionBar.Fullscreen"` in manifest.

**Pros**:

- XML only, no Kotlin code

**Cons**:

- Does not support swipe-to-reveal (sticky immersive)
- Status bar stays hidden permanently, no way to check battery

## Decision

**Chosen option**: Option 1: Immersive sticky mode via WindowInsetsController

The app targets Android 7+ (API 24) but the compat library handles API differences. Sticky immersive gives the exact UX requested: bars hidden by default, swipe down to reveal, auto-hide on content tap.

**Implementation skills**: `tauri` (`.agents/skills/tauri/` — installed router; use it to route to Android/mobile guidance. Note: `tauri-app-develop` / `tauri-mobile` are sub-skill names referenced inside that router but are not installed as standalone paths under `.agents/skills/`.)

## Feature design

**Data model sketch**: None (UI behavior only)

**State transitions**: None

**API surface**: None (Android native config only)

**Value sourcing**: Not applicable

**Key invariants**:

- Landscape orientation locked via `android:screenOrientation="sensorLandscape"` on the `<activity>` (new; `configChanges="...screenSize..."` alone does not lock orientation)
- Device keyboard stays down via `stateHidden|adjustPan` plus the touch focus guard on practice boxes; the shell name `<input>` is the only IME path left, by intent
- Touch types via the app board `onTapKey` path with physical code parity (`key.code` drives correctness marking, `key.base` the typed char); drill prompts use base chars only so no shift latch is needed
- System bars hidden at launch via transient sticky immersive (`BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE`), re-applied on `onWindowFocusChanged`

**Security model**: No changes

**Configuration required**: None

**Critical test scenarios**:

- Happy path: App launches in landscape, status bar hidden, tap board keys → "hello" appears with no device keyboard, verifies **AC-1**, **AC-2**
- Failure case: Rotate device (should not rotate, locked landscape), verifies **AC-4**
- Edge case: Swipe down from top → status bar appears → wait 3s → status bar hides, verifies **AC-3**
- Edge case: Tap the shell name field → device keyboard appears (only intended IME path); back in practice → stays hidden, verifies **AC-1**

## Build plan

1. Update `src-tauri/gen/android/app/src/main/AndroidManifest.xml`: add `android:windowSoftInputMode="stateHidden|adjustPan"` and `android:screenOrientation="sensorLandscape"` to the `<activity>`, satisfies **AC-1**, **AC-4**
2. Update `src-tauri/gen/android/app/src/main/java/com/abhishek/typeshala/MainActivity.kt`: after `super.onCreate()`, call `WindowCompat.setDecorFitsSystemWindows(window, false)`, hide `statusBars()` plus `navigationBars()` via `WindowInsetsControllerCompat` with `systemBarsBehavior = BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE`, and re-apply the hide in `onWindowFocusChanged(hasFocus: Boolean)` when focused, satisfies **AC-2**, **AC-3**
3. Update `src-tauri/gen/android/app/src/main/res/values/themes.xml` ensure theme extends `Theme.MaterialComponents.DayNight.NoActionBar` (already correct, verify only), satisfies **AC-2**
4. Update `src-tauri/gen/android/app/build.gradle.kts`: add explicit `implementation("androidx.core:core:1.12.0")` (or newer 1.x) so `WindowInsetsControllerCompat` behavior is pinned rather than relying on the transitive copy via `appcompat`/`activity-ktx`; do not add `WebView`/`WebChromeClient` configuration to `MainActivity`, satisfies build support with no keyboard-irrelevant WebView hacking
5. Web tap path: `src/components/ClassicKeyboard.tsx` gains optional `onTapKey` (char, space, Backspace as `tabIndex={-1}` buttons); `src/features/classic/ClassicScreen.tsx` wires taps into the drill and free sessions with physical code parity and guards touch focus on the practice boxes, satisfies **AC-1**
6. Build debug APK and test on device, satisfies **AC-1**, **AC-2**, **AC-3**, **AC-4**

## Consequences

**Positive**:

- Fullscreen immersive experience matching mobile typing apps
- Device keyboard stays hidden; the app board handles touch directly
- Status bar accessible via swipe when needed

**Negative / tradeoffs**:

- Slight increase in `MainActivity` complexity
- Must test on Android 7 through 14 for immersive behavior consistency

**Neutral**:

- No impact on desktop, iOS, or web targets

## Follow-up

- [ ] Test on API 24, 28, 30, 34 devices/emulators
- [ ] Verify Tauri updates don't overwrite `MainActivity` customizations (consider copying to a preserved location)
- [ ] Falling words game (`GameView`) still listens to physical keydown only and renders no board; decide whether it gets the tap path or stays desktop only

## References

**Project sources** (verifiable, in this repo):

- `src-tauri/gen/android/app/src/main/AndroidManifest.xml`
- `src-tauri/gen/android/app/src/main/java/com/abhishek/typeshala/MainActivity.kt`
- `src-tauri/gen/android/app/src/main/res/values/themes.xml`
- `src-tauri/gen/android/app/build.gradle.kts` (dependency block has no explicit `androidx.core`; `minSdk = 24`, `targetSdk = 36`)

**Practices & standards**:

- Android immersive mode guide (developer.android.com)
- Tauri Android WebView configuration patterns
