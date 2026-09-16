# Rationale: 0002. Data model local store

## Context

Typeshala is a fully offline desktop tutor for one learner. Lessons, attempts, settings, and progress must survive restarts with no accounts and no network, and every later slice (tutor loop, lesson progression, trends, settings screens) builds on whatever shapes are fixed now. A shape chosen badly here means a breaking migration later, so the decision is worth pinning down before the first feature that saves data.

## Context

Typeshala is a fully offline desktop tutor for one learner. Lessons, attempts, settings, and progress must survive restarts with no accounts and no network. The stack spec chose the store plugin (simple JSON key value saved on device) for v1 with SQLite as a later migration. This spec fixes the exact saved shapes so the tutor, lessons, trends, and settings slices share one shape with no breaking redo.

## Options considered

### Option 1: Store plugin JSON with bundled lesson files

One store file for user data plus read only JSON lesson files shipped with the app. Smallest machinery, fully offline.

**Pros**:

- Least code and no query language to learn
- Trivial backup as files

**Cons**:

- Trends are computed in TypeScript by scanning arrays, which slows only at very large history

### Option 2: SQLite from day one

Structured tables for attempts plus settings plus lessons with indexed queries.

**Pros**:

- Strong queries for trends and per lesson bests at any volume

**Cons**:

- More Rust plus SQL plus plugin wiring before the first usable tutor

### Option 3: Frontend browser storage only

Settings and attempts in web storage with no Rust persistence.

**Pros**:

- No backend code at all

**Cons**:

- Splits the source of truth away from the Rust layer the architecture chose, and complicates packaging plus backup

## Rationale

The product promise is a tiny offline tutor for one learner, so history volume stays small and JSON scanning is plenty. The stack spec already chose the store plugin for v1 with SQLite as a later migration, and this spec makes that real. Bundled lessons stay read only so content updates ship with the app while user data stays separate and safe.
