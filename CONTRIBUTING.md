# Contributing to Typeshala

Thanks for your interest in contributing. This guide keeps contributions consistent with how the project is built.

## Getting started

```bash
npm install
npm run tauri dev
```

Requirements: Node 20+, Rust stable toolchain.

## Project conventions

- **Architecture layers**: `domain` holds typing rules, `application` holds use cases, `infrastructure` holds store plus Tauri bridge, `presentation` holds React views. Outer layers depend on inner ones, never the reverse.
- **Domain has zero framework imports.** All Tauri bridge calls pass through a thin typed wrapper.
- **Strict types everywhere.** No loose `any`. Fix type errors before commit.
- **Group by feature** under `src/features/`. Shared UI and helpers live outside features.
- **Conventional commits**, e.g. `feat: add lesson view`, `fix: correct WPM math`.
- Bilingual UI: strings live in `src/i18n/en.json` plus `ne.json` with typed keys in `src/i18n/keys.ts`. English fallback always.
- Design tokens live in `src/styles/tokens.ts`, themes in `src/styles/themes.css`.

## Before you commit

Run all three and fix failures before committing:

```bash
npm run lint
npm run format:check
npm test
npm run typecheck
```

CI runs the same checks on push.

## Specs and docs

- Build specs live in `docs/specs/` as `NNNN-title.md`, or `NNNN-title/index.md` with `rationale.md` beside it for decided slices.
- Visual guides live in `docs/design/` with plain slugs. New screens need both a spec and a design doc, or an explicit note explaining why one is skipped.

## Pull requests

1. Branch from `main` with the `feat/` prefix (e.g. `feat/classic-drills`).
2. Keep the scope to one milestone per PR where possible.
3. Describe what changed and how you verified it (tests run, manual checks).
4. Make sure lint, format, typecheck, and tests all pass.

## Reporting issues

Include steps to reproduce, expected vs. actual behavior, and your OS plus app version.
