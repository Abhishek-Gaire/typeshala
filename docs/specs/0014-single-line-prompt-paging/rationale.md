# Rationale: 0014. Single line prompt paging

## Context

You run classic drills today with the full prompt visible at once. Long English rows hold dozens of groups and wrap to many lines on screen. Your screenshot shows that wall of blue text. It tires your eyes and pulls focus across many lines at once. Large prompt text makes this heavier, since fewer groups fit per visual row. You also teach triplets like `aaa` in code as one finger pulse, so any paging must respect that teaching unit. The consequence of not deciding is that drills stay hard to scan and the coming slide plus counter work has no agreed base.

## Options considered

### Option 1: Group aware paging with slide

Build pages from whole groups, 8 per page, show one page at a time, slide on change, instant jump for reduced motion.

**Pros**:

1. You keep finger patterns whole, so `aaa` stays readable.
2. You get a calm single line view with clear progress.
3. You reuse current scoring plus keyboard plus save code with no data change.

**Cons**:

1. You add a small paging helper plus animation state to maintain.
2. You must tune page width for large prompt text on narrow windows.

### Option 2: Char count paging with clipping

Cut the prompt every N chars with no regard for group edges, show one row with hidden overflow.

**Pros**:

1. You write less code, simple substring plus overflow hidden.
2. You get exact visual width control.

**Cons**:

1. You split groups like `aaa` into `aa` plus `a`, which breaks your stated rule and confuses finger learning.
2. You still need edge handling for backspace plus caret (the marker that shows where you type next), so savings are small.

### Option 3: Auto scroll window centered on caret

Keep full text in the DOM (your page structure in memory) and scroll the container so the caret stays centered.

**Pros**:

1. You keep all text searchable in the DOM.
2. You get smooth motion with native scroll behavior.

**Cons**:

1. You keep the long wall in memory and in accessibility order, which harms focus and screen reader clarity.
2. You must measure fonts plus widths at runtime, which adds layout risk across Nepali units (Preeti glyph clusters, the joined letter shapes) and English chars.

## Rationale

Your screenshot shows the old wall of blue that overwhelms focus. Your picks settle the load bearing choices. Fixed count keeps timing steady across screens. Whole groups keep the teaching unit intact, which matters because Level 1 teaches triplets as one finger pulse. Fully hidden keeps attention on the active line, which matches your ask for calm. Slide gives a clear forward signal without the measurement risk of auto scroll. I recommend 8 groups because it fits about 31 chars with spaces inside your 65vw prompt area at large sizes and keeps All L1 to a readable set of pages.
