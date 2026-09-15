# Rationale: 0010 Bonus Ramayana game

## Context

Lessons build skill step by step while progress shows gain. Learners want a light break that still practices typing. The game must stay separate from lesson truth so scores never touch bests or unlocks. Words should come from bundled lesson vocab so practice transfers. Art must be your own plus openly licensed so packaging stays clean. Timing must feel fair on all three systems with keyboard only play. If this stays vague, the build may leak game scores into lesson progress or add a game engine that packaging must carry.

## Options considered

### Option 1: Local React loop with bundled words and no new deps

React state plus `requestAnimationFrame` (browser tick helper for smooth motion) for fall timing, words drawn as styled divs on tokens, lists derived from bundled lessons, transient game state only.

**Pros**:
* Smallest bundle with proven UI parts and no new license to vet
* Lesson truth stays clean by design, no save path to guard

**Cons**:
* Effects stay simple, no particle rich scenes in this slice
* Timing needs care to stay fair on slow machines

### Option 2: Canvas engine library

Add a game package for sprites plus particles plus physics.

**Pros**:
* Rich visuals fast with helper code

**Cons**:
* New dep plus art pipeline for a bonus slice
* Theming plus bilingual text need extra glue

### Option 3: Rust game loop in Tauri core

Run timing plus spawning in Rust with events to React.

**Pros**:
* Tight timing control in native code

**Cons**:
* Bridge chatter each tick adds failure modes for no learner gain
* Logic splits across layers against layer rules

## Rationale

The scope asks for a separate game from your own code with openly licensed art and no effect on lessons. Option 1 fits those forces directly and keeps packaging light. Option 2 adds weight for a bonus. Option 3 splits logic across the bridge against your layer rules. You asked me to pick the recommended path, so I picked Option 1.
