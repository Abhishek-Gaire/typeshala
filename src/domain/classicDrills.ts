/** Bundled classic drill rows (spec 0012 AC-4). L1 allows repeats, L2/L3 never repeat back to back. */
import { splitUnits } from "./preeti";
import { drillPassesDifficulty } from "./classicLayout";
import type { Lesson } from "./datastore";

export const CLASSIC_DRILLS: Lesson[] = [
  {
    id: "cl-home-1",
    layout: "traditional",
    title: "Home L1",
    prompt: "ममम पपप ममम पपप ममम पपप ममम",
    order: 101,
    category: "home",
    difficulty: 1,
  },
  {
    id: "cl-home-2",
    layout: "traditional",
    title: "Home L2",
    prompt: "म प न त म प न त प म त न",
    order: 102,
    category: "home",
    difficulty: 2,
  },
  {
    id: "cl-home-3",
    layout: "traditional",
    title: "Home L3",
    prompt: "म प न त क स म न प त क स प म त न क प स म",
    order: 103,
    category: "home",
    difficulty: 3,
  },
  {
    id: "cl-top-1",
    layout: "traditional",
    title: "Top L1",
    prompt: "गगग चचच गगग चचच गगग चचच गगग",
    order: 104,
    category: "top",
    difficulty: 1,
  },
  {
    id: "cl-top-2",
    layout: "traditional",
    title: "Top L2",
    prompt: "ग च त थ ग त च थ त ग थ च",
    order: 105,
    category: "top",
    difficulty: 2,
  },
  {
    id: "cl-top-3",
    layout: "traditional",
    title: "Top L3",
    prompt: "ग च त थ ध भ य उ थ ग ध च भ य त ग उ थ ध ग भ च",
    order: 106,
    category: "top",
    difficulty: 3,
  },
  {
    id: "cl-bottom-1",
    layout: "traditional",
    title: "Bottom L1",
    prompt: "शशश हहह शशश हहह शशश हहह शशश",
    order: 107,
    category: "bottom",
    difficulty: 1,
  },
  {
    id: "cl-bottom-2",
    layout: "traditional",
    title: "Bottom L2",
    prompt: "श ह अ ख श अ ह ख अ श ख ह",
    order: 108,
    category: "bottom",
    difficulty: 2,
  },
  {
    id: "cl-bottom-3",
    layout: "traditional",
    title: "Bottom L3",
    prompt: "श ह अ ख द ल अ श ख ह ल द ह श अ द ख ल श द ह ख",
    order: 109,
    category: "bottom",
    difficulty: 3,
  },
  {
    id: "cl-all-1",
    layout: "traditional",
    title: "All L1",
    prompt: "ममम पपप ककक खखख ममम पपप ककक",
    order: 110,
    category: "all",
    difficulty: 1,
  },
  {
    id: "cl-all-2",
    layout: "traditional",
    title: "All L2",
    prompt: "म प क ख न त ब ल म क प ख त न ल ब",
    order: 111,
    category: "all",
    difficulty: 2,
  },
  {
    id: "cl-all-3",
    layout: "traditional",
    title: "All L3",
    prompt: "म प क ख न त ब ल च छ व श म क प ख न ल त ब च प व छ श",
    order: 112,
    category: "all",
    difficulty: 3,
  },
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

/** Lint every bundled drill row against the difficulty rule. */
export function lintClassicDrills(rows: Lesson[] = CLASSIC_DRILLS): string[] {
  const bad: string[] = [];
  for (const r of rows) {
    const diff = r.difficulty ?? 1;
    const units = splitUnits(r.prompt).filter((u) => u !== " ");
    if (!drillPassesDifficulty(units, diff)) bad.push(r.id);
  }
  return bad;
}
