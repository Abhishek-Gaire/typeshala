# 0022 rationale

Decision record for spec 0022 (Nepali Romanized layout access in the classic shell). The build spec lives in `index.md`; this file holds the reasoning `/develop` skips.

## Context

The tutor ships three layouts in Settings: English, Nepali Romanized, and Nepali Traditional (Preeti keys over Unicode Devanagari). Only two of them work. The Romanized engine hook was built for the old lesson screens and deleted when the classic practice screens landed (commit 4425696), along with its toolbar entry. What survived is the type value, the roman to Devanagari map in `src/domain/romanize.ts`, the bundled Romanized lesson file, the Settings entry, and a filter that already feeds Romanized prompts to the bonus game.

The learner visible result today is a trap. Pick Nepali Romanized and the shell labels itself Nepali, but the drill pool filter collapses anything that is not Traditional into the English rows, so you drill English letters, the guidance board shows English, and nothing you type produces the Devanagari the mode promises. A mode you can select but never use is worse than a mode you cannot select, because it looks broken rather than absent.

Several forces shape the fix. Parity is the whole ask: English and Traditional each have a toolbar control, drill rows for every screen and level, keyboard guidance, and a clean save path, and Romanized must join them. The engine decision itself is already settled and stays standing: spec 0006 chose a fixed roman map with one spelling per sound, no variants, simple chars only, no conjuncts, no matras. Storage cannot change under this work: existing settings and attempts must open untouched. The project builds skateboard style, thinnest usable whole first, then grew into the rest. And the codebase imposes one hard constraint: the classic shell binds every layout to one session shape (per unit typed state plus a sequence hint plus a timer) and derives its prompt comparison from Devanagari, so the restored engine must land on that shape, not on the string based hook that was deleted.

## Options considered

### Option 1: Restore the engine on the current session shape

Bring back the romanized session hook, written to the current shared session shape (units array, pending buffer, sequence hint, wrong key, timer) that the classic shell and keyboard already bind, then wire the third branch through pool, guidance, and toolbar.

**Pros**:

- Reuses the proven session contract and the existing drill generators, lint, and snapshot, so the change stays small and reviewable
- Guidance, coloring, paging, and save paths work unchanged because the shape matches what they expect
- No store change, no data migration

**Cons**:

- Not a copy paste restore: the deleted hook was string based, so the state model must be rewritten to match the current shape
- Three layouts now mean three session hooks to keep aligned in future edits

### Option 2: Verbatim restore of the deleted hook

Reinstate the old hook exactly as it was deleted and wire the classic screens to it with the smallest possible diff.

**Pros**:

- Fastest path back to a working mode
- Zero new code in the engine, only wiring

**Cons**:

- The old state was a concatenated string with no units array, no sequence hint, no wrong key, and no running timer, so per unit coloring, multikey guidance, and live speed would all need to be rebuilt in the views anyway
- Rebinding the shell to a second, weaker contract invites the same drift that lost this mode

### Option 3: One engine driven by a per layout step table

Replace the three hooks with a single engine parameterized by a step function per layout (roman step, Preeti step, char step).

**Pros**:

- Ends the three hook pattern permanently and makes a fourth layout cheap

**Cons**:

- A rewrite of proven, test covered code mid alpha with no learner visible gain
- Risk lands on the two layouts that already work

### Option 4: Transliterate in the view, no engine

Teach the classic screen to run the roman map itself while rendering, keeping typed state in the component.

**Pros**:

- No session hook to maintain

**Cons**:

- Puts typing rules in presentation, where scoring and guidance start guessing, against the project's layering rule
- Loses the shared session contract that binding, paging, and save already depend on

## Rationale

The ask is parity, and parity is defined by what the classic shell already binds: one session shape, one prompt comparison in Devanagari, one guidance derivation, one save path. Option 1 lands the romanized engine inside that contract, so every existing component keeps working and the diff is the engine plus branch selections plus data. Option 2 looks cheaper but restores a weaker contract, which means rebuilding units, hints, and timers in the views anyway while keeping two session shapes alive, the exact drift that let this mode disappear once. Option 3 is the architecturally tidy answer and the wrong one for this moment: it rewrites two working layouts to serve a third, mid alpha, for no gain a learner can see. Option 4 breaks the layering rule the repo states plainly, moving typing truth into presentation where scoring stops being exact.

The absence of a store change is deliberate and cheap here: `LayoutId` already holds `romanized`, the lesson file and map already exist, and every saved attempt already carries its layout value. The work is access, not plumbing. Generating the drill rows rather than hand writing them follows the pattern the Traditional rows already set, keeps the difficulty rule enforced in one place, and keeps the snapshot test honest.

## Note: drill row bucketing rule corrected during the build

The build plan first said a char joins a screen row only when every letter of its roman sequence sits in that row's key set. Applied to the real map that leaves the bottom screen empty (every consonant sequence ends in `a`, a home row letter, and no sequence uses bottom row letters), which breaks AC-2's four screens. The rule became: a char joins the screen row of the first pressed key of its sequence, so the screen teaches the sequences that start on its row. The 42 map chars then spread home 19, top 14, bottom 9, and the All screen carries the full set. Agreed with the engineer before the edit.
