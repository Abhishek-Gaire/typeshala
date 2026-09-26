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
  `Alt+0171`, `` ` `` `|`, `Alt+0165`, `Alt+0165+o` (the reph dead key then
  `o`, so र्य; the glyph reads as a plain च at chart size), रु `?`,
  रू `Alt+0191`, श्र `>`, ह्र `x|`, ङ्क `X`, द्द `2`, द्य `Alt+0223`, then
  matras and marks
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
  legacy glyphs (ङ, ष, झ, ञ्, ऱ, द्द, द्घ, ट्ट, हृ, quotes, dashes, ॐ, …).
  Its first row repeats `द्घ` on `Alt+0132`, and `हृ` appears on both
  `Alt+0155` (preeti2) and `Alt+0197` (here).

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
- Deliberately left out as single units: 13 rare conjuncts plus reph. All 13
  are typeable today by halant and matra composition, but they score as two
  or three units instead of one, which is a scoring decision, not a missing
  key. See the header of `preeti.ts` and the reachability table below.

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
| `ङ्ख` | —                  | `x\|`                             |

The app composes अं and अ: from their parts; the chart types them as one
unit. Both can be true at once since the app buffers. The `x|` row is a
misread in the transcription: `x` is `ह` and `|` is `्र` on both the chart's
own rows and in all three mirror fonts, so the row composes to `ह्र`.

### In the app only

- `i → ई`, `I → क्ष`, `N → ण`, `D → म्`, `: → स्`, `qm → क्र`.
- `, → ङ`, `f] → ो`, `f} → ौ` (spec 0018 homes needing no special keys).
- All pre-posed i-matra combos (`ls → कि` … `lem → झि`). The chart only
  defines the bare matra `l = ि`.
- `? → रु`, `~ → ञ्`, `> → श्र`.

### In the chart only

- Conjuncts and half forms the app has no atomic row for: ट्ट, ट्ठ, ठ्ठ, द्व, द्घ,
  र्य, हृ, रू, ङ्क, घ्, झ्, फ्, plus the reph dead key.
- Legacy Alt glyphs: ॐ, ॠ, ॡ, `–`, `—`, `…`, quote marks, and the rest of
  Table 2.
- Punctuation outputs on `-` `_` `<` → `(` `)` `?` (`,` now types `ङ` in the app).

### In the mirror only

ङ्ग, ङ्घ, ङ्ढ, and ड्ड appear in the Shuvayatra mirror but in none of the
three charts. The mirror is the only source in the repo that attests them, and
all four are reachable in the app by composition (see the table below).

### Ambiguous in the chart

- `X` maps to ऱ, ङ्क, and ह् across the charts. The app picks `ह्`; the
  transcription keeps all three, so a lookup by `X` is not single-valued.

### Reachability of the rare conjuncts

Every one of these is typeable and scoreable in the app today. None of them is
unreachable: the ones without their own key compose from halant (`\`) and a
matra, the same way the map already ships `स्व` (`:j`), `स्त्र` (`;q`), and `द्र`
(`b|`). What they lack is a single unit, so a prompt full of `ट्ठ` or `द्व`
counts two or three units against a learner who typed it correctly. That is a
scoring decision, not a keymap gap. It is open as its own spec,
[0021](docs/specs/0021-rare-conjuncts-as-one-unit.md).

Chart column is `reference/preeti-keymap.ts` unless noted. The mirror column is
the dead key in `SHUVAYATRA_PREETI_CHAR_MAP`
(`reference/shuvayatra-preeti.ts`), where an `Alt+NNNN` number is that byte, so
`Alt+0203` is `U+00CB`. The app column is locked in by the coverage test in
`tests/domain/preeti.test.ts`.

| Unit      | Chart claim                                                                                | Mirror           | Reachable in app        | Single unit |
| --------- | ------------------------------------------------------------------------------------------ | ---------------- | ----------------------- | ----------- |
| ङ्ख       | `x\|` (`:99`, misread, the row prints ह्र)                                                 | `U+00CE`         | `,\v`                   | no, 3       |
| ङ्क       | `X` (`:100`)                                                                               | `U+00CD`         | `,\s`                   | no, 3       |
| ङ्ग       | none, the old `Alt+0132` row was a misattribution                                          | `U+00CB`         | `,\u`                   | no, 3       |
| ङ्घ       | none                                                                                       | `U+2039`         | `,\3`                   | no, 3       |
| ङ्ढ       | none                                                                                       | `U+00B0`         | `,\9`                   | no, 3       |
| ड्ड       | none                                                                                       | `U+2022`         | `8\8`                   | no, 3       |
| ट्ट       | `Alt+0248`, `Alt+0204` (`:92`, `:94`)                                                      | `U+00A7`         | `6\6`                   | no, 3       |
| ट्ठ       | `Alt+0229` (`:96`), `Alt+0171`, `Alt+0176` (`:167`, `:168`)                                | `U+00DD`         | `6\7`                   | no, 3       |
| ठ्ठ       | `Alt+0136` (`:95`)                                                                         | `U+00B6`         | `7\7`                   | no, 3       |
| द्घ       | `Alt+0132` (`:105`)                                                                        | `U+00A2`         | `b\3`                   | no, 3       |
| द्व       | `Alt+0216` (`:93`)                                                                         | `U+00E5`         | `b\j`                   | no, 3       |
| हृ        | `Alt+0155` (`:97`), `Alt+0197` (`:173`)                                                    | `U+00C5`         | `x[`                    | no, 2       |
| रू        | `Alt+0191` (`:98`)                                                                         | `U+00BF`         | `/"`                    | no, 2       |
| reph `र्` | a bare virama on `\|` (`:148`) and `Alt+0165` (`:165`); `Alt+0165+o` reads as र्य (`:108`) | `U+00A5` → `र्‍` | not typeable (dead key) | n/a         |

Two cautions for whoever reads that table next. First, mirror dead keys are not
interchangeable with the chart's `Alt+NNNN` numbers. Within Latin 1 a
codepoint's byte equals the Alt number, confirmed by `U+00A3` giving `घ्` in all
three font maps (`:70`, `:234`, `:332`) against `Alt+0163` in the chart, but
past that the fonts disagree about the same codepoint: `U+00B0` is `ङ्ढ` in
Preeti (`:163`) and Kantipur (`:435`) but `ङ्क` in PCS Nepali (`:281`), and
`U+00CE` is `ङ्ख` in Preeti (`:94`) and `फ्` in Kantipur (`:357`). One Alt number
is also claimed for different characters across sources: `Alt+0203` is `फ्` in
`preeti1.png` where the mirror has `ङ्ग`, and `Alt+0167` is `द्द` in
`preeti1.png`, `ऱ` at `reference/preeti-keymap.ts:166`, and `ट्ट` in the mirror.
A mirror entry proves a unit is reachable in principle, never which key types
it.

Second, `ट्ठ`'s three chart codes are not three independent sources. Two are
best effort Alt glyph names the transcription itself flags, and `Alt+0171`'s
glyph is `्र` in the mirror (`:73`), so it is most likely a misread rather than
a contradiction.

## Transcription caveats

- Alt-glyph names are best effort from small chart text. The half-form rows
  in `preeti1.png` and the matra rows in `preeti2.png` render the Preeti
  glyph rather than Devanagari, so a few names may be off.
- Two rows were corrected during transcription: `0` is ण् (not ठ्) and `~`
  is ञ्. Re-check these against the image before trusting them.
- The transcription is reference data only. `src/domain/preeti.ts` remains
  the source of truth for typing; extend that file when a lesson needs a unit.
