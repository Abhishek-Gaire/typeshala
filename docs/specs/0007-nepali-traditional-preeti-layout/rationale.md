# Rationale: 0007. Nepali Traditional Preeti layout

## Context

Romanized input proves Nepali learners can type with familiar keys. Traditional typists now need the real Preeti feel where one screen unit may need several physical presses plus a halant (joiner mark that links letters). The engine plus store plus progression already exist and must stay as the single truth. Lesson content must grow from simple chars to true clusters in clear stages. Guidance must point at physical keys while the prompt shows clean Unicode. If this stays vague, the build may invent fuzzy matching or split save paths that later screens must undo.

## Options considered

### Option 1: Fixed Preeti map on same engine with cluster aware sequencer

Fixed bundled table from Preeti sequences to Devanagari units, same Lesson shape with layout traditional, same scoring plus progression plus save paths, lessons move simple to cluster in stages.

**Pros**:

- Smallest build that still teaches real sequences with no store change
- Scoring plus guidance stay exact with no guessing

**Cons**:

- Lesson authors must craft cluster prompts with care in this slice
- One sequence per unit can frustrate variant typers until later tuning

### Option 2: Per char map extended from Romanized

Reuse single char map idea and treat each Unicode char alone, splitting clusters into lone chars.

**Pros**:

- Very small code change with familiar logic

**Cons**:

- Breaks true conjunct timing and teaches wrong backspace habits
- Scoring counts cluster parts alone so later slices must redo math

### Option 3: Separate Traditional engine with own save path

New typing state plus new save shape tuned for Preeti timing.

**Pros**:

- Full control over cluster display and timing

**Cons**:

- Duplicates store plus progression work and splits truth across two paths
- Later trends plus settings must read two truths

## Rationale

The scope asks for Preeti over open Unicode with conjunct plus matra handling on the same tutor. Option 1 fits those forces directly. Fixed map keeps scoring exact, same Lesson shape keeps progression free, staged lessons keep backspace teachable. Option 2 teaches wrong units. Option 3 splits saved truth for no learner visible gain.
