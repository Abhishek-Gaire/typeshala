# Flatpak and Flathub: step-by-step guide

**Status:** not started. Nothing in this guide has been applied to the repo.
**Written:** October 6, 2026, against Typeshala v1.0.1 and Tauri v2.
**Goal:** get `flatpak install flathub com.abhishek.typeshala` working for users.

---

## Read this first: Tauri has no flatpak build target

The usual advice for Tauri apps is to add `flatpak` to `bundle.targets` in `tauri.conf.json`. **That does not work.** There is no flatpak bundler in Tauri v2.

I checked the official config schema (`https://schema.tauri.app/config/2`). `BundleTarget` allows exactly seven values:

```
deb, rpm, appimage, msi, nsis, app, dmg
```

`flatpak` is not among them, and the schema contains no `flatpak` key anywhere under `bundle`. Adding it produces a config validation error, not a flatpak.

This is deliberate upstream. From the Tauri maintainers on [issue #3619](https://github.com/tauri-apps/tauri/issues/3619): _"Direct flatpak support in `tauri build` isn't much of a prio right now, even though (or because) we want to push flathub as the primary distribution format on Linux."_ Flathub builds from a **manifest**, not from an uploaded bundle, so a bundler target would not help anyway.

**So Flathub is not "blocked by a missing target."** It is blocked by three files that have to be written by hand:

| File                      | Purpose                                                        | Where it lives              |
| ------------------------- | -------------------------------------------------------------- | --------------------------- |
| `flatpak.metainfo.xml`    | AppStream store metadata: name, summary, screenshots, releases | `docs/` in this repo        |
| `flatpak-builder.yaml`    | The build manifest Flathub's builders run                      | `docs/` in this repo        |
| `linux/deb` bundle config | Ships the metainfo inside the .deb too                         | `src-tauri/tauri.conf.json` |

Two other prerequisites remain open and are **not** solved by this guide: code signing (§7) and the app ID question (§8).

---

## What is already true

Verified against the v1.0.1 release assets on October 6, 2026:

- A signed-format `.deb` exists at `Typeshala_1.0.1_amd64.deb`, 2.9 MB, and builds on `ubuntu-22.04` in CI.
- That deb contains exactly five files, and the paths below are taken from it, not guessed:

```
usr/bin/typeshala                                  the binary
usr/share/applications/Typeshala.desktop          desktop entry, Icon=typeshala
usr/share/icons/hicolor/32x32/apps/typeshala.png
usr/share/icons/hicolor/128x128/apps/typeshala.png
usr/share/icons/hicolor/256x256@2/apps/typeshala.png
```

- The binary is a stripped x86-64 PIE ELF needing only GTK 3 and WebKit2GTK 4.1 — both present in the GNOME runtime, so no extra libraries need building.
- `maintainer` in the deb control file is already `Abhishek Gaire`, picked up from `Cargo.toml` `authors`.

Two consequences worth knowing:

- **The deb has no `usr/lib/` directory**, so the "copy additional resources" step in Tauri's docs does not apply here.
- **Icons are already good enough.** Flathub's [quality guidelines](https://docs.flathub.org/docs/for-app-authors/metainfo-guidelines/quality-guidelines) ask for an SVG _or_ a square PNG of at least 256×256. `src-tauri/icons/128x128@2x.png` is exactly 256×256 with an alpha channel, and the deb already ships it. **No SVG conversion is required**, and no new artwork is needed.

---

## Two routes to a flatpak

Pick one. **Route A is much easier and is what I recommend first.**

### Route A — build the flatpak from the existing .deb

The manifest downloads a published `.deb` and unpacks it into `/app`. No Rust or Node toolchain inside the sandbox, no vendored crate sources, fast builds.

- Pros: small manifest, quick to get right, easy to verify locally.
- Cons: Flathub's reviewers increasingly expect apps built from source. They may ask you to switch to Route B. The deb you point at must be built for a compatible distro.

### Route B — build from source inside the sandbox

The manifest clones the repo, vendors every crate and npm package, and runs `npm run tauri build -- -b deb` inside the sandbox.

- Pros: what Flathub prefers long-term; the build happens in the same environment it runs in, so no library skew.
- Cons: substantially more setup — `flatpak-cargo-generator.py` and `flatpak-node-generator` must produce vendored source lists, and every one must stay in sync with the lockfiles on each release.

**Do Route A. Move to Route B only if a Flathub reviewer asks.** Get something installed first, then harden.

---

## Route A, step by step

### Step 1 — Install the tools

Arch, which this guide was written on:

```bash
sudo pacman -S --needed flatpak flatpak-builder
```

Debian/Ubuntu: `sudo apt install flatpak flatpak-builder`
Fedora: `sudo dnf install flatpak flatpak-builder`

Then install the runtime and SDK. The GNOME runtime already contains GTK 3 and WebKit2GTK 4.1 at the right versions:

```bash
flatpak install flathub org.gnome.Platform//47 org.gnome.Sdk//47
```

Use `//47` to match the manifest below. On a distro where 47 is not your default, that is fine — the version is pinned in the manifest.

### Step 2 — Download the .deb

```bash
mkdir -p ~/typeshala-flatpak && cd ~/typeshala-flatpak
curl -LO https://github.com/Abhishek-Gaire/typeshala/releases/download/v1.0.1/Typeshala_1.0.1_amd64.deb
sha256sum Typeshala_1.0.1_amd64.deb
```

The v1.0.1 deb hashes to:

```
3cbff80ab8f1fab56974b0e353f7857dc962ee5b98793d1b7445d7f0814a2cf2
```

Recompute this each release. Flathub requires a pinned `sha256` for every remote source.

### Step 3 — Write the metainfo file

Create `docs/flatpak.metainfo.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<component type="desktop-application">
  <id>com.abhishek.typeshala</id>
  <launchable type="desktop-id">com.abhishek.typeshala.desktop</launchable>
  <name>Typeshala</name>
  <developer id="com.abhishek">
    <name>Abhishek Gaire</name>
  </developer>
  <content_rating type="oars-1.1" />
  <keywords>
    <keyword>typing</keyword>
    <keyword>typing tutor</keyword>
    <keyword>Nepali</keyword>
    <keyword>Preeti</keyword>
    <keyword>Devanagari</keyword>
    <keyword>education</keyword>
  </keywords>
  <branding>
    <color type="primary" scheme_preference="light">#3d5a9e</color>
    <color type="primary" scheme_preference="dark">#1b2a4a</color>
  </branding>
  <recommends>
    <display_length compare="ge">360</display_length>
  </recommends>
  <summary>Type Nepali and English</summary>
  <metadata_license>MIT</metadata_license>
  <project_license>MIT</project_license>
  <url type="homepage">https://typeshala.abhishekgaire.com.np</url>
  <url type="bugtracker">https://gitlab.com/abhishek_gaire/typeshala/-/issues</url>
  <url type="vcs-browser">https://gitlab.com/abhishek_gaire/typeshala</url>
  <supports>
    <control>pointing</control>
    <control>keyboard</control>
  </supports>
  <description>
    <p>
      Typeshala is a free, open-source typing tutor that teaches English and Nepali typing.
      It teaches three layouts from the same set of structured lessons: English QWERTY,
      Romanized Nepali, and Traditional Preeti, the legacy Nepali key layout that turns
      familiar QWERTY key positions into Devanagari text.
    </p>
    <p>Practice with live speed and accuracy scoring, progress trends, and themes.</p>
    <ul>
      <li>English QWERTY, Romanized Nepali and Traditional Preeti layouts</li>
      <li>Structured lessons with live words-per-minute and accuracy scoring</li>
      <li>On-screen keyboard with the next required key lit</li>
      <li>Progress trends and personal bests, stored on your device</li>
      <li>Light and dark themes, English and Nepali interface</li>
      <li>Works entirely offline, with no account and no network calls</li>
    </ul>
  </description>
  <screenshots>
    <screenshot type="default">
      <image>https://typeshala.abhishekgaire.com.np/typeshala/nepali-typing-tutor-preeti-screenshot.webp</image>
      <caption>The classic practice screen with a Devanagari prompt and the Preeti-labelled on-screen keyboard</caption>
    </screenshot>
  </screenshots>
  <releases>
    <release version="1.0.1" date="2026-10-01">
      <description>
        <ul>
          <li>Rare Nepali letters such as ट्ट, द्व and हृ now score as one letter each</li>
          <li>Guidance steps through every key of a three key letter</li>
          <li>Fixed a speed score error when typing rare conjuncts perfectly</li>
        </ul>
      </description>
    </release>
  </releases>
  <update_contact>abhishek_gaire</update_contact>
</component>
```

**Replace `<update_contact>` before submitting.** Flathub requires a real contact address and the value above is not one — no email is recorded anywhere in this repo, so it is a deliberate placeholder rather than a guess. Use the address you want release questions routed to.

Notes on the choices:

- **`<launchable>` and the desktop file must agree.** The manifest rewrites the deb's `Typeshala.desktop` to `com.abhishek.typeshala.desktop`, so both names here must be the ID, not the product name. This is the single most common review failure.
- **`content_rating` must come before `keywords`** — AppStream's schema is order-sensitive.
- **Brand colours are navy, not red, on purpose.** Flathub paints the banner behind the icon, and the icon is a red square. Red brand colours give poor contrast against it. Navy is also the one other colour already in the icon, so it ties together.
- **`summary` is 23 characters**, inside Flathub's 10–25 ideal band. It avoids the app's name, jargon, a leading article and a trailing full stop, as the guidelines ask.
- **`name` is the bare product name.** No tagline, no "(टाइपशाला)" suffix — that belongs in `<keywords>`, which already carries it.
- **The description is 6 bullet points**, inside the "no more than 10" rule, and does more than restate the summary.

### Screenshots need re-taking

The screenshot on the site is **2559×1522**, and Flathub's [quality guidelines](https://docs.flathub.org/docs/for-app-authors/metainfo-guidelines/quality-guidelines) cap window screenshots at **1000×700, or 2000×1400 on HiDPI**. The current shot is over both. Two further rules also bite:

- **Take it windowed, not maximized.** `tauri.conf.json` launches the window maximized, which removes the shadow and rounded corners — and Flathub explicitly says not to maximize, and that screenshots must include the native decoration. Unmaximize before capturing.
- **Capture on Linux.** Do not reuse a shot taken on another platform, and do not crop, annotate or add promotional graphics.

So the screenshot listed above is the right _content_ but the wrong _artifact_. Re-take it at roughly 1000×700 on Linux with the window decoration visible, export as PNG, and host it somewhere stable. Aim for three: the practice screen, the lessons list, and the progress screen.

Validate before going further:

```bash
appstreamcli validate docs/flatpak.metainfo.xml
```

### Step 4 — Write the manifest

Create `docs/flatpak-builder.yaml`:

```yaml
id: com.abhishek.typeshala
runtime: org.gnome.Platform
runtime-version: "47"
sdk: org.gnome.Sdk
command: typeshala

finish-args:
  - --socket=wayland
  - --socket=fallback-x11
  - --device=dri
  - --share=ipc

modules:
  - name: typeshala
    buildsystem: simple
    sources:
      - type: file
        path: flatpak.metainfo.xml

      - type: file
        url: https://github.com/Abhishek-Gaire/typeshala/releases/download/v1.0.1/Typeshala_1.0.1_amd64.deb
        sha256: 3cbff80ab8f1fab56974b0e353f7857dc962ee5b98793d1b7445d7f0814a2cf2
        only-arches: [x86_64]

      # For local testing, swap the block above for:
      # - type: file
      #   path: Typeshala_1.0.1_amd64.deb

    build-commands:
      - set -e

      # Unpack the deb
      - mkdir deb-extract
      - ar -x Typeshala_1.0.1_amd64.deb --output deb-extract
      - tar -C deb-extract -xf deb-extract/data.tar.gz

      # Binary
      - install -Dm755 deb-extract/usr/bin/typeshala /app/bin/typeshala

      # Desktop entry, with the icon name forced to the app ID
      - sed -i 's/^Icon=.*/Icon=com.abhishek.typeshala/' deb-extract/usr/share/applications/Typeshala.desktop
      - install -Dm644 deb-extract/usr/share/applications/Typeshala.desktop /app/share/applications/com.abhishek.typeshala.desktop

      # Icons
      - install -Dm644 deb-extract/usr/share/icons/hicolor/32x32/apps/typeshala.png /app/share/icons/hicolor/32x32/apps/com.abhishek.typeshala.png
      - install -Dm644 deb-extract/usr/share/icons/hicolor/128x128/apps/typeshala.png /app/share/icons/hicolor/128x128/apps/com.abhishek.typeshala.png
      - install -Dm644 deb-extract/usr/share/icons/hicolor/256x256@2/apps/typeshala.png /app/share/icons/hicolor/256x256/apps/com.abhishek.typeshala.png

      # AppStream metadata — without this, GNOME Software shows no description
      - install -Dm644 flatpak.metainfo.xml /app/share/metainfo/com.abhishek.typeshala.metainfo.xml
```

Why these `finish-args` and no more:

- `--socket=wayland` and `--socket=fallback-x11` are required to show a window at all.
- `--device=dri` is for GL rendering. Tauri renders through WebKitGTK, so keep it.
- `--share=ipc` is needed by GTK.
- **No `--talk-name=org.kde.StatusNotifierWatcher`** — Typeshala has no tray icon, so adding it would be a needless permission and Flathub would query it. Leave it out.
- **No network permission.** The app makes no network calls by design, and stating so is a selling point. Do not add `--share=network`.

Note `256x256@2` in the deb maps to `256x256` in `/app` — the `@2` suffix is a freedesktop convention for hidpi, not a real directory.

### Step 5 — Build and install locally

```bash
cd ~/typeshala-flatpak
cp ~/OpenSource/Typeshala/docs/flatpak-builder.yaml .
cp ~/OpenSource/Typeshala/docs/flatpak.metainfo.xml .

flatpak-builder --force-clean --user --disable-cache \
  --repo flatpak-repo flatpak-build flatpak-builder.yaml

flatpak run com.abhishek.typeshala
```

To update a local build:

```bash
flatpak -y --user update com.abhishek.typeshala
```

**Test before submitting, specifically:**

1. The window opens and the prompt renders.
2. Typing works, and the on-screen keyboard lights the next key.
3. Switch to the Preeti layout and type a conjunct.
4. Complete a lesson and confirm the result saves, then restart and confirm it persists. This exercises the store plugin inside the sandbox, where `$HOME` is redirected — the most likely place for a surprise.
5. Close and relaunch from GNOME Software, so the desktop entry and icon resolve.
6. Confirm no network access is required, and that nothing prompts for it.

### Step 6 — Ship the metainfo in the .deb too

Optional but recommended, and it makes GNOME Software show a description for anyone who installs the .deb. In `src-tauri/tauri.conf.json`:

```json
"bundle": {
  "linux": {
    "deb": {
      "files": {
        "/usr/share/metainfo/com.abhishek.typeshala.metainfo.xml": "../../docs/flatpak.metainfo.xml"
      }
    }
  }
}
```

The path is relative to `src-tauri/tauri.conf.json`, so `../../docs/` reaches the repo's `docs/`. Then rebuild the deb and confirm the file lands with `dpkg-deb -c`.

### Step 7 — Submit to Flathub

Sign in at [flathub.org](https://flathub.org) first, otherwise the pull request fails on permissions.

```bash
git clone --branch=new-pr git@github.com:Abhishek-Gaire/flathub.git
cd flathub
git checkout -b typeshala
cp ~/OpenSource/Typeshala/docs/flatpak-builder.yaml com.abhishek.typeshala.yaml
cp ~/OpenSource/Typeshala/docs/flatpak.metainfo.xml com.abhishek.typeshala.metainfo.xml
git add com.abhishek.typeshala.*
git commit -m "Add Typeshala"
git push origin typeshala
```

Then open a pull request against the **`new-pr`** branch, not `main`. Flathub maintainers triage new submissions there.

Expect to be asked for:

- Better screenshots. The current one is 2559×1522 and Flathub caps window shots at 2000×1400, so it needs re-taking smaller, windowed, on Linux. Three is a good number: practice screen, lessons list, progress screen.
- Confirmation that the license is MIT and the source is public. Both are true.
- Possibly a move to Route B. See §"Two routes" above.

On approval you get write access to `flathub/com.abhishek.typeshala` and maintain it yourself — updating it means a new manifest with the new `version`, `date`, deb URL and `sha256`.

---

## Release checklist for a flatpak update

Every release needs these four edits, or Flathub users stay on the old build:

1. `docs/flatpak-builder.yaml` — `url`, `sha256`, and the deb filename in `build-commands`
2. `docs/flatpak.metainfo.xml` — a new `<release version= date=>` entry
3. `src-tauri/tauri.conf.json` — the version bump, plus the `linux.deb.files` path if it moved
4. `package.json` and `src-tauri/Cargo.toml` — the version bump, in lockstep

Then rebuild, retest step 5, and open a pull request against `flathub` `master` on your own app repo.

---

## Common failures

| Symptom                                                         | Cause                                                                                                                                            |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Icon=com.abhishek.typeshala` not applied                       | The `sed` ran before the file was extracted, or the desktop file is named `Typeshala.desktop` not `typeshala.desktop`                            |
| GNOME Software shows the app with no description or screenshots | `metainfo` not installed, or installed under the wrong name. It must be `/app/share/metainfo/<id>.metainfo.xml`                                  |
| App will not start, exit code 1                                 | Almost always a missing library. Run `flatpak run --command=ldd com.abhishek.typeshala /app/bin/typeshala` and compare against the GNOME runtime |
| Blank or black window on Wayland                                | WebKit compositing. Add `--env=WEBKIT_DISABLE_COMPOSITING_MODE=1` to `finish-args`                                                               |
| Progress lost between runs                                      | Store plugin writing outside `$HOME`. Confirm the app uses the XDG data dir, not a hardcoded path                                                |
| `appstreamcli validate` errors on element order                 | `content_rating` must precede `keywords`                                                                                                         |
| Build fails on `sha256` mismatch                                | The release asset was re-uploaded. Recompute and update the manifest                                                                             |
| Flathub asks you to build from source                           | Expected. Move to Route B                                                                                                                        |

---

## Not covered here

- **Code signing.** The flatpak is sandboxed and needs no signing, but the `.deb` it wraps is unsigned. This is fine for Flathub and does not block it. The macOS and Windows signing work in the audit doc is separate and still open.
- **Route B in full.** The cargo and node source generators are not walked through here. Follow [the Tauri guide](https://v2.tauri.app/distribute/flatpak/) if you get asked to switch.
- **The 81 MB AppImage.** Unrelated to flatpak, still worth investigating — Flathub users will never download it.
