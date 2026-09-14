# Design

source: spec 0003 plus Tailwind v4 setup
character: warm, calm study desk, amber brand on stone, generous spacing, large readable prompts
tokens live in: src/styles/tokens.ts plus src/styles/themes.css (Tailwind v4 CSS first)

## Build mandate

Use tokens only, never hard code colors or text. Light and dark both first class via .dark class. Prompt stays large. Focus always visible. All strings through i18n bundles with English fallback. Full keyboard reach.
