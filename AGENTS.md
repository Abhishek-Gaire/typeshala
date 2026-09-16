# Typeshala

## Stack

- **Language / Runtime**: TypeScript, Node 20 min, Rust stable
- **Framework**: Tauri v2 latest, 2.11 line plus React plus Vite
- **Key dependencies**: `@tauri-apps/api`, `@tauri-apps/plugin-opener`, `@tauri-apps/plugin-store`, Zustand soon, Tailwind CSS
- **Package manager**: npm

## Build approach

Skateboard, thinnest usable whole first, then grow it.

## Commands

```bash
# Install
npm install

# Dev server
npm run tauri dev

# Build
npm run build
npm run tauri build

# Test
npm test
npm run typecheck

# Lint plus format
npm run lint
npm run format:check
```

## Docs

Build specs live in `docs/specs/`. Format: `docs/specs/NNNN-title.md` for short specs, or `docs/specs/NNNN-title/index.md` with `rationale.md` beside it for decided slices. Visual guides live in `docs/design/` with plain slugs (for example `docs/design/classic-practice-screens.md`). New screens need both or an explicit note why one is skipped.

## Rules

- Layers: `domain` holds typing rules, `application` holds use cases, `infrastructure` holds store plus Tauri bridge, `presentation` holds React views. Outer depends on inner, never reverse.
- Domain has zero framework imports. All bridge calls pass through a thin typed wrapper.
- Use cases stay thin. They call domain logic plus storage ports, never hold rules themselves.
- Entities guard their own truth, like WPM plus accuracy math. Plain objects, no ORM marks.
- Cross edge data uses plain objects. No store shapes leak into views.
- Strict types everywhere. No loose `any`. Fix type errors before commit.
- Group by feature under `src/features/`. Shared UI plus helpers live outside features.
- Document public APIs with short comments. One steady error shape across bridge plus UI.
- Validate settings at start with safe defaults. Keep UI usable by keyboard with large prompt text.
- Conventional commits. Messages like `feat: add lesson view`.
- Tooling chosen: `eslint` plus `prettier`, `vitest` for unit plus integration. Install lands in `/develop tooling`.
- Before commit run lint plus format plus typecheck. Push runs CI with the same three.

## UI base (spec 0003)

- Tokens live in `src/styles/tokens.ts`, themes in `src/styles/themes.css`. Use short var classes like `text-(--color-ink)`.
- Strings live in `src/i18n/en.json` plus `ne.json`, typed keys in `src/i18n/keys.ts`, English fallback always.
- Shared parts live in `src/components/`, settings hook in `src/hooks/useUiSettings.ts`. Art direction lives in `design.md` plus `docs/design/`.

## Git

- integration: on
- branch prefix: `feat/`
- commit: per-milestone
- push: you push by hand, workflow only adds plus commits

## Agent skills

- [tauri](.agents/skills/tauri/): `full-stack-skills/tauri-skills`, native shell plus bridge habits
- [tauri-app-creator](.agents/skills/tauri-app-creator/): `full-stack-skills/tauri-skills`, scaffold plus run checks
- [tauri-app-store](.agents/skills/tauri-app-store/): `full-stack-skills/tauri-skills`, local JSON save habits
- [vercel-react-best-practices](.agents/skills/vercel-react-best-practices/): `vercel-labs/agent-skills`, fast React patterns
- [typescript-advanced-types](.agents/skills/typescript-advanced-types/): `wshobson/agents`, firm typing patterns
- [zustand-state-management](.agents/skills/zustand-state-management/): `mindrally/skills`, small store habits
- [tailwindcss](.agents/skills/tailwindcss/): `hairyf/skills`, utility styling habits
- MCP servers: none wanted

## Context files

<!-- Nested AGENTS.md files are listed here as they are created -->

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
