# 0003. Design system and bilingual UI foundation

**Date**: 2026-09-14
**Status**: Accepted

## Summary

This spec sets the shared visual base for Typeshala. It locks type plus color plus spacing plus base components plus both themes plus English and Nepali strings. With this in place, the tutor screens can grow in a steady way.

## Requirements

**User stories**:
1. As a learner, I want large readable prompts plus clear focus so I can type by keyboard with ease.
2. As a learner, I want English or Nepali UI so I can learn in my language.
3. As a builder, I want base components plus tokens so new screens look steady.

**Acceptance criteria**:
* **AC-1**: Base screens use shared tokens for color and type and spacing, and prompt text stays large and readable.
* **AC-2**: Light theme and dark theme both work, choice is saved on device and kept after restart.
* **AC-3**: UI strings exist in English and Nepali, switch changes all base screens, choice is saved on device.
* **AC-4**: All base actions are reachable and usable by keyboard, focus is always visible.
* **AC-5**: Loading and empty and error states show clear text in the active language.

## Options considered

### Option 1: Tailwind theme plus CSS vars

Shared tokens live as Tailwind theme values plus CSS vars for theme swap. Base components read only those tokens.

**Pros**:
* Fits current Tailwind setup
* Simple theme swap with saved choice

**Cons**:
* Needs care to keep token names steady over time

### Option 2: Plain CSS vars only

Tokens live only as CSS vars, no Tailwind theme link.

**Pros**:
* Very small setup

**Cons**:
* Loses Tailwind tooling help, more manual work per screen

### Option 3: Full component library

Adopt an outside component set for all base UI.

**Pros**:
* Fast start with many parts

**Cons**:
* Heavy weight for a small offline app, styling control gets harder

## Decision

**Chosen option**: Option 1: Tailwind theme plus CSS vars

Shared base uses Tailwind theme tokens plus CSS vars for light dark swap, with typed bilingual string bundles.

**Implementation skills**: `tailwindcss` (`hairyf/skills`, `.agents/skills/tailwindcss/`), `vercel-react-best-practices` (`vercel-labs/agent-skills`, `.agents/skills/vercel-react-best-practices/`), `zustand-state-management` (`mindrally/skills`, `.agents/skills/zustand-state-management/`)

## Rationale

Scope calls for cohesive flows plus large prompt text plus full keyboard use plus both languages. Current code already uses Tailwind and plans a local store, so reuse keeps the build simple and easy to run at day 180 and day 730. Outside library weight would hurt offline ease and long care.

## Feature design

**Data model sketch**:
* `ThemeTokens`: color cords, type scale, spacing scale, radius, focus ring. Required. Lives in `src/styles/tokens.ts` plus CSS vars in `src/styles/themes.css`.
* `StringsBundle`: key plus `en` text plus `ne` text. Required. Lives in `src/i18n/en.json` and `src/i18n/ne.json` with typed keys in `src/i18n/keys.ts`.
* `UiSettings`: `theme` (`light` or `dark`), `locale` (`en` or `ne`), `promptSize` (`standard` or `large`). Stored through existing settings port from spec `0002`, so no new store shape.

**State transitions**:
No state machine. Theme and locale are simple saved choices with safe defaults (`light`, `en`, `large` prompt).

**API surface**:
| Endpoint | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `useUiSettings` | hook | none | theme, locale, promptSize, setters | local only | settings load fallback to defaults |
| `t(key)` | function | key:string (req) | localized text | local only | missing key falls back to `en` |

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| Theme apply | active colors and focus ring | `UiSettings.theme` plus `ThemeTokens` |
| Locale apply | all base screen text | `UiSettings.locale` plus `StringsBundle` |
| Prompt display | large prompt text size | `UiSettings.promptSize` plus type scale |
| States display | loading or empty or error text | `StringsBundle` for active locale |

**Key invariants**:
* Views never hard code colors or text. All color and text come from tokens or bundles.
* Missing Nepali string always falls back to English, never blank.
* Focus is always visible when moving by keyboard.

**Security model**:
Local only. No user data leaves the device. No new auth. No compliance scope.

**Configuration required**:
None. No new env vars.

**Critical test scenarios**:
* Happy path: open base shell, switch theme and language, restart, choices kept, verifies **AC-2**, **AC-3**
* Failure case: corrupt or missing settings fall back to safe defaults with clear notice, verifies **AC-2**, **AC-5**
* Keyboard path: full base flow by keyboard only with visible focus, verifies **AC-4**

## Build plan

1. Add tokens plus themes plus typed i18n bundles with fallback, satisfies **AC-1**, **AC-3**, **AC-5**
2. Build base components (button, input, prompt display, key hint, result card, layout shell) on tokens only, satisfies **AC-1**, **AC-4**
3. Wire theme plus locale plus prompt size through settings store with safe defaults and saved choice, satisfies **AC-2**, **AC-3**
4. Add loading plus empty plus error states in both languages plus keyboard focus pass, satisfies **AC-4**, **AC-5**

## Consequences

**Positive**:
* Later tutor and Nepali work reuse one steady base
* Readability and keyboard ease improve from day one

**Negative / tradeoffs**:
* Small up front cost to set tokens and bundles before feature 5
* Token renames later need care across screens

**Neutral**:
* No store migration. Uses settings shape from spec `0002`.

## Follow-up

* [ ] Add component usage notes in root `AGENTS.md` once base lands
* [ ] Enroll feature 5 spec (smallest usable English tutor) as next design
