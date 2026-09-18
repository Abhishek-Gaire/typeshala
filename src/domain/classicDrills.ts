/**
 * Bundled classic drill rows. English rows follow spec 0013; Traditional rows
 * follow spec 0015. L1 allows repeats, L2/L3 never repeat back to back.
 */
import { splitUnits } from "./preeti";
import { drillPassesDifficulty } from "./classicLayout";
import type { Lesson } from "./datastore";

/** English (QWERTY) drill rows, spec 0013. */
export const CLASSIC_DRILLS: Lesson[] = [
  {
    id: "cl-home-1-en",
    layout: "qwerty",
    title: "Home L1",
    prompt:
      "aaa jjj aaa jjj aaa jjj aaa jjj aaa jjj aaa jjj aaa jjj aaa jjj aaa jjj aaa jjj sss kkk sss kkk sss kkk sss kkk sss kkk sss kkk sss kkk sss kkk sss kkk sss kkk ddd lll ddd lll ddd lll ddd lll ddd lll ddd lll ddd lll ddd lll ddd lll ddd lll fff ;;; fff ;;; fff ;;; fff ;;; fff ;;; fff ;;; fff ;;; fff ;;; fff ;;; fff ;;; ggg hhh ggg hhh ggg hhh ggg hhh ggg hhh ggg hhh ggg hhh ggg hhh ggg hhh ggg hhh",
    order: 201,
    category: "home",
    difficulty: 1,
  },
  {
    id: "cl-home-2-en",
    layout: "qwerty",
    title: "Home L2",
    prompt:
      "asd asd asd asd asd asd asd asd asd asd jkl jkl jkl jkl jkl jkl jkl jkl jkl jkl sdf sdf sdf sdf sdf sdf sdf sdf sdf sdf hk; hk; hk; hk; hk; hk; hk; hk; hk; hk; adg adg adg adg adg adg adg adg adg adg jl; jl; jl; jl; jl; jl; jl; jl; jl; jl;",
    order: 202,
    category: "home",
    difficulty: 2,
  },
  {
    id: "cl-home-3-en",
    layout: "qwerty",
    title: "Home L3",
    prompt:
      "ajk ajk ajk ajk ajk ajk ajk ajk ajk ajk sdl sdl sdl sdl sdl sdl sdl sdl sdl sdl fj; fj; fj; fj; fj; fj; fj; fj; fj; fj; ghd ghd ghd ghd ghd ghd ghd ghd ghd ghd akj akj akj akj akj akj akj akj akj akj dsl dsl dsl dsl dsl dsl dsl dsl dsl dsl ;lf ;lf ;lf ;lf ;lf ;lf ;lf ;lf ;lf ;lf hgj hgj hgj hgj hgj hgj hgj hgj hgj hgj",
    order: 203,
    category: "home",
    difficulty: 3,
  },
  {
    id: "cl-top-1-en",
    layout: "qwerty",
    title: "Top L1",
    prompt:
      "qqq ppp qqq ppp qqq ppp qqq ppp qqq ppp qqq ppp qqq ppp qqq ppp qqq ppp www ooo www ooo www ooo www ooo www ooo www ooo www ooo www ooo www ooo eee iii eee iii eee iii eee iii eee iii eee iii eee iii eee iii eee iii rrr uuu rrr uuu rrr uuu rrr uuu rrr uuu rrr uuu rrr uuu rrr uuu rrr uuu ttt yyy ttt yyy ttt yyy ttt yyy ttt yyy ttt yyy ttt yyy ttt yyy ttt yyy",
    order: 204,
    category: "top",
    difficulty: 1,
  },
  {
    id: "cl-top-2-en",
    layout: "qwerty",
    title: "Top L2",
    prompt:
      "qwe qwe qwe qwe qwe qwe qwe qwe qwe qwe wer wer wer wer wer wer wer wer wer wer ert ert ert ert ert ert ert ert ert ert yui yui yui yui yui yui yui yui yui yui uio uio uio uio uio uio uio uio uio uio iop iop iop iop iop iop iop iop iop iop",
    order: 205,
    category: "top",
    difficulty: 2,
  },
  {
    id: "cl-top-3-en",
    layout: "qwerty",
    title: "Top L3",
    prompt:
      "qyu qyu qyu qyu qyu qyu qyu qyu qyu qyu woi woi woi woi woi woi woi woi woi woi epr epr epr epr epr epr epr epr epr epr yqw yqw yqw yqw yqw yqw yqw yqw yqw yqw uoe uoe uoe uoe uoe uoe uoe uoe uoe uoe rit rit rit rit rit rit rit rit rit rit pir pir pir pir pir pir pir pir pir pir tyq tyq tyq tyq tyq tyq tyq tyq tyq tyq",
    order: 206,
    category: "top",
    difficulty: 3,
  },
  {
    id: "cl-bottom-1-en",
    layout: "qwerty",
    title: "Bottom L1",
    prompt:
      "zzz /// zzz /// zzz /// zzz /// zzz /// zzz /// zzz /// zzz /// zzz /// zzz /// xxx ... xxx ... xxx ... xxx ... xxx ... xxx ... xxx ... xxx ... xxx ... ccc ,,, ccc ,,, ccc ,,, ccc ,,, ccc ,,, ccc ,,, ccc ,,, ccc ,,, ccc ,,, vvv mmm vvv mmm vvv mmm vvv mmm vvv mmm vvv mmm vvv mmm vvv mmm vvv mmm bbb nnn bbb nnn bbb nnn bbb nnn bbb nnn bbb nnn bbb nnn bbb nnn bbb nnn",
    order: 207,
    category: "bottom",
    difficulty: 1,
  },
  {
    id: "cl-bottom-2-en",
    layout: "qwerty",
    title: "Bottom L2",
    prompt:
      "zxc zxc zxc zxc zxc zxc zxc zxc zxc zxc xcv xcv xcv xcv xcv xcv xcv xcv xcv xcv cvb cvb cvb cvb cvb cvb cvb cvb cvb cvb nm, nm, nm, nm, nm, nm, nm, nm, nm, nm, m,. m,. m,. m,. m,. m,. m,. m,. m,. m,. ,./ ,./ ,./ ,./ ,./ ,./ ,./ ,./ ,./ ,./",
    order: 208,
    category: "bottom",
    difficulty: 2,
  },
  {
    id: "cl-bottom-3-en",
    layout: "qwerty",
    title: "Bottom L3",
    prompt:
      "znm znm znm znm znm znm znm znm znm znm x,. x,. x,. x,. x,. x,. x,. x,. x,. x,. cv/ cv/ cv/ cv/ cv/ cv/ cv/ cv/ cv/ cv/ vbn vbn vbn vbn vbn vbn vbn vbn vbn vbn bz/ bz/ bz/ bz/ bz/ bz/ bz/ bz/ bz/ bz/ mcz mcz mcz mcz mcz mcz mcz mcz mcz mcz nxm nxm nxm nxm nxm nxm nxm nxm nxm nxm /vx /vx /vx /vx /vx /vx /vx /vx /vx /vx",
    order: 209,
    category: "bottom",
    difficulty: 3,
  },
  {
    id: "cl-all-1-en",
    layout: "qwerty",
    title: "All L1",
    prompt:
      "aaa jjj aaa jjj aaa jjj aaa jjj aaa jjj aaa jjj aaa jjj aaa jjj aaa jjj sss kkk sss kkk sss kkk sss kkk sss kkk sss kkk sss kkk sss kkk sss kkk ddd lll ddd lll ddd lll ddd lll ddd lll ddd lll ddd lll ddd lll ddd lll fff ;;; fff ;;; fff ;;; fff ;;; fff ;;; fff ;;; fff ;;; fff ;;; fff ;;; ggg hhh ggg hhh ggg hhh ggg hhh ggg hhh ggg hhh ggg hhh ggg hhh ggg hhh qqq ppp qqq ppp qqq ppp qqq ppp qqq ppp qqq ppp qqq ppp qqq ppp qqq ppp www ooo www ooo www ooo www ooo www ooo www ooo www ooo www ooo www ooo eee iii eee iii eee iii eee iii eee iii eee iii eee iii eee iii eee iii rrr uuu rrr uuu rrr uuu rrr uuu rrr uuu rrr uuu rrr uuu rrr uuu ttt yyy ttt yyy ttt yyy ttt yyy ttt yyy ttt yyy ttt yyy ttt yyy zzz /// zzz /// zzz /// zzz /// zzz /// zzz /// zzz /// zzz /// zzz /// zzz /// xxx ... xxx ... xxx ... xxx ... xxx ... xxx ... xxx ... xxx ... xxx ... ccc ,,, ccc ,,, ccc ,,, ccc ,,, ccc ,,, ccc ,,, ccc ,,, ccc ,,, ccc ,,, vvv mmm vvv mmm vvv mmm vvv mmm vvv mmm vvv mmm vvv mmm vvv mmm vvv mmm bbb nnn bbb nnn bbb nnn bbb nnn bbb nnn bbb nnn bbb nnn bbb nnn bbb nnn",
    order: 210,
    category: "all",
    difficulty: 1,
  },
  {
    id: "cl-all-2-en",
    layout: "qwerty",
    title: "All L2",
    prompt:
      "asd asd asd asd asd asd asd asd asd asd jkl jkl jkl jkl jkl jkl jkl jkl jkl jkl qwe qwe qwe qwe qwe qwe qwe qwe qwe qwe yui yui yui yui yui yui yui yui yui yui zxc zxc zxc zxc zxc zxc zxc zxc zxc zxc nm, nm, nm, nm, nm, nm, nm, nm nm, nm, nm, nm,",
    order: 211,
    category: "all",
    difficulty: 2,
  },
  {
    id: "cl-all-3-en",
    layout: "qwerty",
    title: "All L3",
    prompt:
      "qaj qaj qaj qaj qaj qaj qaj qaj qaj qaj wsl wsl wsl wsl wsl wsl wsl wsl wsl wsl eok eok eok eok eok eok eok eok eok eok rpm rpm rpm rpm rpm rpm rpm rpm rpm rpm tyh tyh tyh tyh tyh tyh tyh tyh tyh tyh uxd uxd uxd uxd uxd uxd uxd uxd uxd uxd ivc ivc ivc ivc ivc ivc ivc ivc ivc ivc ozb ozb ozb ozb ozb ozb ozb ozb ozb ozb",
    order: 212,
    category: "all",
    difficulty: 3,
  },
];

/**
 * Traditional (Preeti) drill rows per spec 0015, mirrored finger pairs with
 * matra combos. Groups are ordered so group boundaries never repeat a unit.
 */
export const CLASSIC_DRILLS_TRADITIONAL: Lesson[] = [
  {
    id: "cl-home-1-tr",
    layout: "traditional",
    title: "Home L1",
    prompt:
      "बस बस बस बस बस बस बस बस बस बस बस बस बस बस बस बस बस बस बस बस बस बस बस बस बस बस बस बस बस बस कि कि कि कि कि कि कि कि कि कि कि कि कि कि कि कि कि कि कि कि कि कि कि कि कि कि कि कि कि कि मप मप मप मप मप मप मप मप मप मप मप मप मप मप मप मप मप मप मप मप मप मप मप मप मप मप मप मप मप मप वा वा वा वा वा वा वा वा वा वा वा वा वा वा वा वा वा वा वा वा वा वा वा वा वा वा वा वा वा वा नज नज नज नज नज नज नज नज नज नज नज नज नज नज नज नज नज नज नज नज नज नज नज नज नज नज नज नज नज नज",
    order: 301,
    category: "home",
    difficulty: 1,
  },
  {
    id: "cl-home-2-tr",
    layout: "traditional",
    title: "Home L2",
    prompt:
      "बसि बसि बसि बसि बसि बसि बसि बसि बसि बसि किम किम किम किम किम किम किम किम किम किम वान वान वान वान वान वान वान वान वान वान मपव मपव मपव मपव मपव मपव मपव मपव मपव मपव नजब नजब नजब नजब नजब नजब नजब नजब नजब नजब",
    order: 302,
    category: "home",
    difficulty: 2,
  },
  {
    id: "cl-home-3-tr",
    layout: "traditional",
    title: "Home L3",
    prompt:
      "बसकि बसकि बसकि बसकि बसकि बसकि बसकि बसकि बसकि बसकि मपवा मपवा मपवा मपवा मपवा मपवा मपवा मपवा मपवा मपवा नजमप नजमप नजमप नजमप नजमप नजमप नजमप नजमप नजमप नजमप बसनज बसनज बसनज बसनज बसनज बसनज बसनज बसनज बसनज बसनज बसनज किवा किवा किवा किवा किवा किवा किवा किवा किवा किवा",
    order: 303,
    category: "home",
    difficulty: 3,
  },
  {
    id: "cl-top-1-tr",
    layout: "traditional",
    title: "Top L1",
    prompt:
      "त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ",
    order: 304,
    category: "top",
    difficulty: 1,
  },
  {
    id: "cl-top-2-tr",
    layout: "traditional",
    title: "Top L2",
    prompt:
      "त्रधभ त्रधभ त्रधभ त्रधभ त्रधभ त्रधभ त्रधभ त्रधभ त्रधभ त्रधभ धयई धयई धयई धयई धयई धयई धयई धयई धयई धयई भईच भईच भईच भईच भईच भईच भईच भईच भईच भईच तथउ तथउ तथउ तथउ तथउ तथउ तथउ तथउ तथउ तथउ तथउ चगथ चगथ चगथ चगथ चगथ चगथ चगथ चगथ चगथ चगथ",
    order: 305,
    category: "top",
    difficulty: 2,
  },
  {
    id: "cl-top-3-tr",
    layout: "traditional",
    title: "Top L3",
    prompt:
      "त्रधय त्रधय त्रधय त्रधय त्रधय त्रधय त्रधय त्रधय त्रधय त्रधय भईच भईच भईच भईच भईच भईच भईच भईच भईच भईच गथउ गथउ गथउ गथउ गथउ गथउ गथउ गथउ गथउ गथउ त्रभई त्रभई त्रभई त्रभई त्रभई त्रभई त्रभई त्रभई त्रभई त्रभई धचग धचग धचग धचग धचग धचग धचग धचग धचग धचग तथउ तथउ तथउ तथउ तथउ तथउ तथउ तथउ तथउ तथउ त्रधय त्रधय त्रधय त्रधय त्रधय त्रधय त्रधय त्रधय त्रधय त्रधय भईच भईच भईच भईच भईच भईच भईच भईच भईच भईच",
    order: 306,
    category: "top",
    difficulty: 3,
  },
  {
    id: "cl-bottom-1-tr",
    layout: "traditional",
    title: "Bottom L1",
    prompt:
      "शर शर शर शर शर शर शर शर शर शर शर शर शर शर शर शर शर शर शर शर शर शर शर शर शर शर शर शर शर शर ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। खप खप खप खप खप खप खप खप खप खप खप खप खप खप खप खप खप खप खप खप खप खप खप खप खप खप खप खप खप खप दल दल दल दल दल दल दल दल दल दल दल दल दल दल दल दल दल दल दल दल दल दल दल दल दल दल दल दल दल दल",
    order: 307,
    category: "bottom",
    difficulty: 1,
  },
  {
    id: "cl-bottom-2-tr",
    layout: "traditional",
    title: "Bottom L2",
    prompt:
      "शहख शहख शहख शहख शहख शहख शहख शहख शहख शहख शर शर शर शर शर शर शर शर शर शर खदल खदल खदल खदल खदल खदल खदल खदल खदल खदल ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। खप खप खप खप खप खप खप खप खप खप",
    order: 308,
    category: "bottom",
    difficulty: 2,
  },
  {
    id: "cl-bottom-3-tr",
    layout: "traditional",
    title: "Bottom L3",
    prompt:
      "शहख शहख शहख शहख शहख शहख शहख शहख शहख शहख शर शर शर शर शर शर शर शर शर शर खदल खदल खदल खदल खदल खदल खदल खदल खदल खदल ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। खप खप खप खप खप खप खप खप खप खप दल दल दल दल दल दल दल दल दल दल शर। शर। शर। शर। शर। शर। शर। शर। शर। शर। हखप हखप हखप हखप हखप हखप हखप हखप हखप हखप",
    order: 309,
    category: "bottom",
    difficulty: 3,
  },
  {
    id: "cl-all-1-tr",
    layout: "traditional",
    title: "All L1",
    prompt:
      "बस बस बस बस बस बस बस बस बस बस बस बस बस बस बस बस बस बस बस बस बस बस बस बस बस बस बस बस बस बस कि कि कि कि कि कि कि कि कि कि कि कि कि कि कि कि कि कि कि कि कि कि कि कि कि कि कि कि कि कि मप मप मप मप मप मप मप मप मप मप मप मप मप मप मप मप मप मप मप मप मप मप मप मप मप मप मप मप मप मप वा वा वा वा वा वा वा वा वा वा वा वा वा वा वा वा वा वा वा वा वा वा वा वा वा वा वा वा वा वा नज नज नज नज नज नज नज नज नज नज नज नज नज नज नज नज नज नज नज नज नज नज नज नज नज नज नज नज नज नज त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ त्रउ धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय धय भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई भई चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग चग तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ तथ शर शर शर शर शर शर शर शर शर शर शर शर शर शर शर शर शर शर शर शर शर शर शर शर शर शर शर शर शर शर ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। ह। खप खप खप खप खप खप खप खप खप खप खप खप खप खप खप खप खप खप खप खप खप खप खप खप खप खप खप खप खप खप दल दल दल दल दल दल दल दल दल दल दल दल दल दल दल दल दल दल दल दल दल दल दल दल दल दल दल दल दल दल",
    order: 310,
    category: "all",
    difficulty: 1,
  },
  {
    id: "cl-all-2-tr",
    layout: "traditional",
    title: "All L2",
    prompt:
      "बसि बसि बसि बसि बसि बसि बसि बसि बसि बसि किम किम किम किम किम किम किम किम किम किम त्रधभ त्रधभ त्रधभ त्रधभ त्रधभ त्रधभ त्रधभ त्रधभ त्रधभ त्रधभ धयई धयई धयई धयई धयई धयई धयई धयई धयई धयई खदल खदल खदल खदल खदल खदल खदल खदल खदल खदल शहख शहख शहख शहख शहख शहख शहख शहख शहख शहख",
    order: 311,
    category: "all",
    difficulty: 2,
  },
  {
    id: "cl-all-3-tr",
    layout: "traditional",
    title: "All L3",
    prompt:
      "बसकि बसकि बसकि बसकि बसकि बसकि बसकि बसकि बसकि बसकि त्रधय त्रधय त्रधय त्रधय त्रधय त्रधय त्रधय त्रधय त्रधय त्रधय शहख शहख शहख शहख शहख शहख शहख शहख शहख शहख मपवा मपवा मपवा मपवा मपवा मपवा मपवा मपवा मपवा मपवा भईच भईच भईच भईच भईच भईच भईच भईच भईच भईच खदल खदल खदल खदल खदल खदल खदल खदल खदल खदल नजमप नजमप नजमप नजमप नजमप नजमप नजमप नजमप नजमप नजमप गथउ गथउ गथउ गथउ गथउ गथउ गथउ गथउ गथउ गथउ दल दल दल दल दल दल दल दल दल दल",
    order: 312,
    category: "all",
    difficulty: 3,
  },
];

/** All bundled drill rows: English (spec 0013) plus Traditional (spec 0015). */
export const ALL_CLASSIC_DRILLS: Lesson[] = [...CLASSIC_DRILLS, ...CLASSIC_DRILLS_TRADITIONAL];

/** Lint every bundled drill row against the difficulty rule. */
export function lintClassicDrills(rows: Lesson[] = ALL_CLASSIC_DRILLS): string[] {
  const bad: string[] = [];
  for (const r of rows) {
    const diff = r.difficulty ?? 1;
    const units = splitUnits(r.prompt).filter((u) => u !== " ");
    if (!drillPassesDifficulty(units, diff)) bad.push(r.id);
  }
  return bad;
}
