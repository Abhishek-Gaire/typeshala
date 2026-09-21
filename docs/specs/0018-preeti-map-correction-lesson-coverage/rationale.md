# 0018 rationale

## Context

The Traditional map in `src/domain/preeti.ts` disagrees with the authoritative open source converter on exactly two keys. E yields the `ो` mark where genuine Preeti yields half `भ`, and W yields full `ङ` where genuine Preeti yields half `ध`. The mismatch was verified against the Shuvayatra converter tables for all three bundled fonts plus the printed chart transcription, and the disputed values have sat in the app since the first Preeti commit, so this is an original error, not drift. Learners who know real Preeti type two wrong letters, and two genuine letters cannot be typed at all.

Separately, a coverage audit of `ne-traditional.json` against the chart transcription found 15 supported units that no prompt ever exercises, including common conjuncts and the whole Shift halant row. One shipped lesson, `nt-punctuation`, expects ASCII punctuation the map cannot produce, so it cannot be completed under any map we ship. If nothing is decided, learners keep training wrong reflexes on E and W, the gaps persist, and the course keeps a lesson nobody can finish.

## Options considered

### Map values

**Option 1: Adopt Shuvayatra values for E and W.** Set E to half `भ` and W to half `ध`, matching the converter in all three fonts plus the chart reading for E.

Pros: single source of truth for genuine Preeti; fixes real world fidelity. Cons: returning learners retrain two reflexes.

**Option 2: Keep the current deviation and document it.** Leave E and W as is, record the difference as an intentional beginner simplification.

Pros: zero retraining; smallest change. Cons: the app keeps teaching two wrong letters against every external reference, and half `भ` plus half `ध` stay untypeable.

**Option 3: Fix W only, keep E for the `ो` mark.** Halfway move that fixes the clearer misread.

Pros: less retraining. Cons: keeps one wrong letter with no principled line between the two keys; still contradicts the authority.

### Home for full `ङ`

**Option 1: Comma key.** Assign full `ङ` to `,`, currently unused by the map.

Pros: single press, no Shift needed, all six working `ङ` occurrences keep working with zero lesson edits. Cons: comma can never later mean comma in Traditional prompts without revisiting.

**Option 2: Drop `ङ` content.** Remove the alphabet row segment and the `ङङङ` drills.

Pros: smaller map. Cons: the alphabet loses completeness to save one table row.

Alt code `ª`, the genuine home, is not viable since browsers cannot produce it from a standard board, so it was discarded without a full round.

### Lesson shape for the 15 units

**Option 1: Append three new lessons at the end of traditional order.** New ids with orders 25 to 27; existing prompts and orders untouched.

Pros: positional progression needs no change; existing attempts and bests stay valid. Cons: the tail grows by three lessons.

**Option 2: Extend existing prompts.** Weave the units into current lessons.

Pros: no new lessons. Cons: edits shipped prompts, shifting difficulty under saved bests; harder to review.

**Option 3: Extend classic drill groups to Shift keys.** Cover the units through generated drills.

Pros: drills stay the single practice surface. Cons: churns drill snapshots and hint logic for a unit set lessons can carry.

### The punctuation lesson

**Option 1: Remove `nt-punctuation`.** Delete the entry; positional progression closes the gap on its own.

Pros: restores the every lesson completable invariant in one deletion. Cons: punctuation practice disappears until a later slice designs it properly.

**Option 2: Rewrite it from typeable units.** Keep a punctuation lesson built only from units the map supports.

Pros: keeps a punctuation slot. Cons: nearly nothing ASCII punctuates under this map, so the rewritten lesson would be one mark plus filler.

**Option 3: Leave it.** Record as a later step.

Pros: smallest 0018. Cons: keeps a knowingly broken lesson beside new coverage work whose premise is completability.

## Rationale

Shuvayatra is unanimous across all three fonts and the chart agrees on E, while the chart W row is ambiguous and likely misread, so the map follows Shuvayatra for both keys rather than splitting the difference. The cost of switching is low. Comma wins the `ङ` home because it preserves every working occurrence with no lesson edits, and the one comma in prompts sits inside the lesson being removed. Appending lessons wins because positional progression makes it edit free for existing users, and removal wins for the punctuation lesson because no rewrite can serve its original intent under this map.

## Evidence

E and W across sources (all three Shuvayatra fonts agree):

| Key | Chart transcription                           | Shuvayatra converter | App today |
| --- | --------------------------------------------- | -------------------- | --------- |
| E   | half `भ`                                      | half `भ`             | `ो` mark  |
| W   | half `ङ` (likely misread, glyph is ambiguous) | half `ध`             | full `ङ`  |

Coverage audit: 147 chart entries checked against all Traditional prompts. 41 unique characters never appear. Of those, 24 are Alt only legacy glyphs (deliberately unsupported), 15 are supported but undrilled (Category A), and 2 are untypeable only because of the E and W placements (Category C). The existing lesson test allowlists spacing, the already mapped `।`, and the unmapped units (`ौ` plus ASCII punctuation), confirming the test authors knew the gaps.
