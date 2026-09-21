# Preeti keymap: app vs reference charts

This note records how the Preeti keymap the app types with compares to the
three reference charts bundled in `public/`. It exists because the charts and
the runtime map disagree on several keys, and those disagreements are easy to
forget when editing either side.

## Files in play

| File                                  | Role                                                                                                  |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `src/domain/preeti.ts` (`PREETI_MAP`) | Runtime map the app actually types with. Key sequence -> Devanagari unit, one output per sequence.    |
| `reference/preeti-keymap.ts`          | Reference transcription of the charts. Character -> key sequence, charts as printed, duplicates kept. |
| `public/preeti1.png`                  | Chart page 1.                                                                                         |
| `public/preeti2.png`                  | Chart page 2.                                                                                         |
| `public/preeti3.png`                  | Chart page 3, two tables.                                                                             |

The transcription file also exposes `keysForCharacter` and
`charactersForKeys` lookups over all three arrays.

> **Ownership.** The three PNG charts are screenshots taken from third-party
> websites. This project does not own them and includes them for reference
> only; all rights remain with their original authors. The
> `reference/preeti-keymap.ts` transcription is provided on the same basis.

## What each image shows

### `preeti1.png` — "Preeti font का केही अक्षरहरु तल दिएको छ ।"

Three `Character = Keys` columns.

- **Left column, full consonants (क–ल):** क `s`, ख `v`, ग `u`, घ `3`,
  ङ `Alt+0170`, च `r`, छ `5`, ज `h`, झ `e+m`, ञ `` ` ``, ट `6`, ठ `7`, ड `8`,
  ढ `9`, ण `0+f`, त `t`, थ `y`, द `b`, ध `w`, न `g`, प `k`, फ `k+m`, ब `a`,
  भ `e`, म `d`, य `o`, र `/`, ल `n`.
- **Middle column, व through half forms:** व `j`, श `z`, ष `i+f` (Alt+0200),
  स `;`, ह `x`, क्ष `I+f`, त्र `q`, ज्ञ `1`, then the dead/half forms ष `S`,
  ख् `V`, ग् `U`, घ् `Alt+0163`, झ् `(Alt+0170)+\`, च् `R`, ज् `H`, झ `Alt+0137`,
  ञ् `~`, ण् `0`, त् `T`, थ् `Y`, ङ् `W`, न् `G`, प् `K`, फ् `Alt+0207`, ब् `A`,
  भ् `E`, म् `&`.
- **Right column, vowels and legacy glyphs:** ट्ट `Alt+0248`, ण `N`, च् `J`,
  श् `Z`, ई `i`, स `;`, क्ष `I`, `Alt+0161`, अ `c`, आ `cf`, इ `O`, ई `O{`,
  उ `p`, ऊ `pm`, ऋ `C`, ए `P`, ऐ `P]`, ओ `cf]`, औ `cf}`, अं `c+`, अ: `cM`,
  ॐ `Alt+0231`, ॠ `Alt+0205`, ॡ `Alt+0206`, then `Alt+0203`, `Alt+0139`,
  `Alt+0167`, `Alt+0182`, `Alt+0176`.

### `preeti2.png` — continuation

Two `Character = Keys` columns of rarer units.

- **Left, conjuncts and signs:** ङ `Alt+0149`, ऱ `Alt+0140`, त्त `Q`, क्त `Qm`,
  ट्ठ `Alt+0229`, द्ध `4`, द्द `Alt+0162`, दृ `b[`, हृ `Alt+0155`, द्घ
  `Alt+0132`, द्य `B`, ट्ट `Alt+0204`, ठ्ठ `Alt+0136`, द्व `Alt+0216`,
  `Alt+0171`, `` ` `` `|`, `Alt+0165`, द्घ `Alt+0165+o`, रु `?`, रू `Alt+0191`,
  श्र `>`, ङ्ख `x|`, ङ्क `X`, द्द `2`, द्य `Alt+0223`, then matras and marks
  (`f`, `l`, `L`, `]`, `}`, `=`, `+`, `F`, `M`, `[`, `{`, `\`, `,`, `Alt+0230`).
  The matra rows render the Preeti glyph, so their exact Devanagari names are
  hard to read at chart size.
- **Right, punctuation and digits:** ” `Alt+0198`, `(` `-`, `)` `_`,
  … `Alt+0210`, `-` `Alt+0150`, `–` `Alt+0151`, `‘` `Alt+0133`, `’` `Alt+0218`,
  `/` `Alt+0247`, `?` `<`, `।` `.`, `%` `Alt+0220`, `!` `Alt+0219`,
  `+` `Alt+0177`, and Devanagari digits १ `!`, २ `@`, ३ `#`, ४ `$`, ५ `%`,
  ६ `^`, ७ `&`, ८ `*`, ९ `(`, ० `)`.

### `preeti3.png` — two tables

- **Table 1, "Nepali Typing using Preeti Font":** the clean four-pair
  `Character | Keys` grid. It covers vowels, consonants, conjuncts, matras,
  signs, and punctuation, and is the source the transcription leans on:
  क `s` … ह `x`; क्ष `I+f`, त्र `q`, ज्ञ `1`; अ `c`, आ `c+f`, इ `O`, ई `O+{`,
  उ `p`, ऊ `p+m`, ऋ `C`, ए `P`, ऐ `P+]`, ओ `c+f+]`, औ `c+f+}`, अं `c++`,
  अ: `c+M`; त्त `Q`, क्त `Q+m`, द्ध `4`, द्य `B`, द्द `2`, दृ `b+[`, रु `?`,
  श्र `>`, ऱ `X`; matras ी `L`, ु `'`, ू `"`, ृ `[`, े `]`, ै `}`, ं `+`,
  ः `M`, ँ `F`; punctuation and digits.
- **Table 2, "Preeti Font मा use हुने Alt Keys":** the `Alt+NNNN` list for
  legacy glyphs (ङ, ष, झ, ञ्, ऱ, द्द, घ, ट्ट, हृ, quotes, dashes, ॐ, …).

## What the app uses

`src/domain/preeti.ts` stays small and typed. Notes on its shape:

- **One output per physical sequence.** Each map value is unique, and
  `sequenceForPreeti` returns the single sequence for a unit. Charts that list
  the same unit on two keys (ष on `i+f` and `S`, द्द on `2` and `b+[`, ट्ट on
  two Alt codes) cannot both live here.
- **Flat table plus a small buffer engine.** `advancePreeti` holds a pending
  buffer while it is a prefix of a known sequence, commits on a full match,
  and flushes the longest exact prefix on a miss.
- **Conjunct leaders.** `q` (त्र), `Q` (त्त), `1` (ज्ञ), `B` (द्य), `C` (ऋ),
  and the `m` upgrades `km` (फ), `em` (झ), `pm` (ऊ), `qm` (क्र), `Qm` (क्त).
- **Composed long vowels as data, not logic:** `cf` (आ), `cf]` (ओ), `cf}`
  (औ), `P]` (ऐ).
- **Pre-posed i-matra combos:** `l` is typed before its consonant but stored
  after, so every `l`+consonant pair is listed explicitly (`ls` → कि …).
- **Devanagari digits** on the shifted number row (`!` → १ … `)` → ०).
- Deliberately omitted: dead-key / extended Latin-1 combinations reachable
  only through legacy keyboard drivers. See the header of `preeti.ts`.

## Differences

### Hard conflicts — same key, different output

| Key | App (`preeti.ts`) | Chart (`preeti-keymap.ts`) |
| --- | ----------------- | -------------------------- |
| `W` | `ध्`              | `ङ्`                       |
| `,` | `ङ`               | `,`                        |

`E` now agrees with the chart (`भ्` on both sides, spec 0018). `W` remains
a true conflict: the app uses half `ध` per the unanimous Shuvayatra converter
mirror (`reference/shuvayatra-preeti.ts`: `W` → `ध्` in all three fonts),
while `preeti1.png` prints `ङ्` on `W`. The chart `W` row is ambiguous at
chart size and likely misread, so the runtime follows Shuvayatra here.
Full `ङ` lives on `,`, a second same-key conflict: the chart prints a comma
there, and the app follows Shuvayatra's full `ङ` instead. The `ो` on `f]` and
`ौ` on `f}` are two-press composed marks matching genuine Preeti post-rules
(`ा`+`े` → `ो`, `ा`+`ै` → `ौ`).

### Same unit, app uses one key where the chart uses a sequence

| Unit  | App                | Chart                             |
| ----- | ------------------ | --------------------------------- |
| `ई`   | `i`                | `O+{` (also `i` in `preeti1.png`) |
| `क्ष` | `I`                | `I+f` (also `I` in `preeti1.png`) |
| `ष`   | `S`                | `i+f`; chart also lists `S`       |
| `ण`   | `N`                | `0+f`                             |
| `अं`  | composed `c` + `ं` | `c++` (atomic)                    |
| `अ:`  | composed `c` + `ः` | `c+M` (atomic)                    |
| `दृ`  | —                  | `b+[`                             |
| `ङ्ख` | —                  | `x                                | `   |

The app composes अं and अ: from their parts; the chart types them as one
unit. Both can be true at once since the app buffers.

### In the app only

- `i → ई`, `I → क्ष`, `N → ण`, `D → म्`, `: → स्`, `qm → क्र`.
- `, → ङ`, `f] → ो`, `f} → ौ` (spec 0018 homes needing no special keys).
- All pre-posed i-matra combos (`ls → कि` … `lem → झि`). The chart only
  defines the bare matra `l = ि`.
- `? → रु`, `~ → ञ्`, `> → श्र`.

### In the chart only

- Conjuncts and half forms: ट्ट, ट्ठ, ठ्ठ, द्व, हृ, रू, ङ्क, ङ्ग, घ्, झ्, फ्,
  र्.
- Legacy Alt glyphs: ॐ, ॠ, ॡ, `–`, `—`, `…`, quote marks, and the rest of
  Table 2.
- Punctuation outputs on `-` `_` `<` → `(` `)` `?` (`,` now types `ङ` in the app).

### Ambiguous in the chart

- `X` maps to ऱ, ङ्क, and ह् across the charts. The app picks `ह्`; the
  transcription keeps all three, so a lookup by `X` is not single-valued.

## Transcription caveats

- Alt-glyph names are best effort from small chart text. The half-form rows
  in `preeti1.png` and the matra rows in `preeti2.png` render the Preeti
  glyph rather than Devanagari, so a few names may be off.
- Two rows were corrected during transcription: `0` is ण् (not ठ्) and `~`
  is ञ्. Re-check these against the image before trusting them.
- The transcription is reference data only. `src/domain/preeti.ts` remains
  the source of truth for typing; extend that file when a lesson needs a unit.
