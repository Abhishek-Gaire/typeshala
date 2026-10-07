# Security Policy

## Reporting a vulnerability

**Email [abhishekgaire@protonmail.com](mailto:abhishekgaire@protonmail.com). Do not open a public GitLab issue for a vulnerability.** A public issue is visible to everyone immediately and cannot be taken back once written.

Please include:

- The app version, and whether it came from a release asset or a local build
- Your operating system
- Steps to reproduce
- What you expected to happen, and what actually happened
- Any proof-of-concept code or screenshots, if you have them

## What to expect

- An acknowledgement within 3 working days
- An assessment within 10 working days, including whether the report is accepted and what the fix will look like
- A credit in the release notes if you want one, if the report turns out to be a real vulnerability

If a report is declined, you will get the reason. If you disagree with it, reply and say why. Typeshala has no formal bug bounty, so please do not report purely theoretical findings or dependency-version noise as vulnerabilities — those are still welcome as ordinary issues.

## Why this matters for an offline app

Typeshala runs fully offline and makes no network calls. There is no account, no sync, and no server. That removes most of the usual attack surface, but not all of it, and the parts that remain are worth knowing about:

- **Local progress data.** Learner progress is written on-device through `tauri-plugin-store`, into the platform's app-data directory. Nothing sensitive by design, but it is user data and it should stay readable only by the user.
- **Lesson data files.** Lesson definitions are loaded from JSON under `src/data/lessons/`. These are bundled with the app and not user-editable at runtime, but any future feature that loads a file path from outside the bundle would change this.
- **Nothing is code-signed yet.** Both macOS builds are currently unsigned, so Gatekeeper quarantine applies and users are told to run `xattr -cr`. This is tracked as an open item and is the most likely way for a user to end up running a tampered installer. Until signing ships, check the published checksum before running a downloaded DMG.
- **Future import or deep-link features.** Anything that later accepts a path, an archive, or a URL is exactly the kind of change worth a second pair of eyes. If you are building one, please open an issue first, before shipping it.

## Supported versions

Only the current `release` line receives security fixes. Older versions are not patched, and there is no backport policy. Always take the newest release from [the releases page](https://github.com/Abhishek-Gaire/typeshala/releases).

## Disclosure

Please give the maintainer reasonable time to release a fix before disclosing publicly. If a fix is not out within 90 days of an accepted report, you are free to publish. Nothing in this file is a legal agreement, and no response is legally binding — it is a statement of intent so contributors know what to expect.
