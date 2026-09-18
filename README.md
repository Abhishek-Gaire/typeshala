# Typeshala

A bilingual (English / Nepali) typing tutor desktop app built with Tauri v2, React, and Vite. Practice English typing, Nepali romanized typing, and the traditional Preeti layout, with structured lessons, progress stats, themes, and a bonus Ramayana game.

## Features

- English typing tutor with structured lessons and progression
- Nepali romanized and traditional Preeti layouts
- Classic practice screens with drills
- Progress trends and stats
- Bilingual UI (English / Nepali) with themes and settings
- Local-first: progress stored on-device via the Tauri store plugin

## Requirements

- Node 20+
- Rust stable toolchain
- npm

## Getting started

```bash
npm install
npm run tauri dev
```

## Build

```bash
npm run build
npm run tauri build
```

## Test

```bash
npm test
npm run typecheck
```

## Lint and format

```bash
npm run lint
npm run format:check
```

## Project layout

- `src/domain/` — typing rules, WPM/accuracy math (no framework imports)
- `src/application/` — thin use cases over domain logic and storage ports
- `src/infrastructure/` — store and Tauri bridge wrappers
- `src/features/` — feature-grouped React views
- `src/components/` — shared UI parts
- `src/i18n/` — English and Nepali strings with typed keys
- `src/styles/` — design tokens and themes
- `docs/specs/` — build specs per slice
- `docs/design/` — visual guides per screen

See `AGENTS.md` for the full contributor conventions and `CONTRIBUTING.md` for the contribution workflow.

## Acknowledgements

The Preeti reference charts in `public/preeti1.png`, `public/preeti2.png`, and
`public/preeti3.png` are screenshots taken from third-party websites. This
project does not own them. They are included for reference only, to document
the Preeti keymap; all rights remain with their original authors. The
`reference/preeti-keymap.ts` transcription is provided on the same basis, for
reference only.

## License

MIT — see [LICENSE](LICENSE).
