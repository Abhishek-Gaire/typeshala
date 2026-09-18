# Android native shell

Tauri generated Android project plus tuned activity config (spec 0016). Regenerate icons only with the Tauri CLI so every density stays in sync.

## Files

- `app/src/main/AndroidManifest.xml`: orientation lock plus soft input mode on `.MainActivity`
- `app/src/main/java/com/abhishek/typeshala/MainActivity.kt`: sticky immersive bars, reapplied on focus
- `app/build.gradle.kts`: pinned AndroidX deps for the insets API
- `app/src/main/res/`: launcher icons per density, all generated, never hand edit one slot

## Conventions

- Track this folder in git. Never ignore it: every customization above ships only when committed. Inner `.gitignore` files already drop build output plus signing secrets.
- `tauri android init` regenerates stock files and wipes these edits. After rerunning it, review the diff on the four paths above before committing.
- Refresh all icons with `npm run tauri -- icon src-tauri/icons/icon.png`, then rebuild the APK. Uninstall from the device first when the launcher caches the old icon.
- Bars stay hidden with transient swipe reveal; the device keyboard stays down (`stateHidden|adjustPan`) because touch types through the app board, see `src/components/ClassicKeyboard.tsx`.

_Drafted by /sync from the introducing change, worth a quick human pass._
