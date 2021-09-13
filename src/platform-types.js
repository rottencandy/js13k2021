import { enumArray } from './engine/state';
import {
  S_LEVEL_SELECTED,
  S_LEVEL_SOLVED,
  S_LEVEL_EDITOR,
  emitSignal
} from './engine/observer';
import { Id } from './util';
import { playLevelStartSound, playLevelEndSound, playInvalidMoveSound } from './sound';
import { isLevelSolved, completedLevelsCount } from './local-storage';
import { FaceColorMap } from './globals';
import { getFace, setFace } from './player';

// platform types
const len = 11;
export const [START, STATIC, GAP, END, SINGLE_STEP, LEVEL_ENTRANCE, GATE, KEY, SWAP, LEVEL_GATE, EDITOR] = enumArray(len);
export const nextPlatform = (i) => ++i >= len-1 ? 0 : i;

export const PLATFORM_CODE = {
  a: START,
  b: STATIC,
  c: GAP,
  d: END,
  e: LEVEL_ENTRANCE,
  f: LEVEL_GATE,
  g: EDITOR,
  h: SINGLE_STEP,
  i: GATE,
  j: KEY,
  k: SWAP,
};

export const findCode = (val) => Object.keys(PLATFORM_CODE).find(k => PLATFORM_CODE[k] === val);

let gatesLocked = 1;

/** @typedef {() => [R: number, G: number, B: number, A: number]} GetColor */
/** @typedef {(x: number, y: number, faceTouched: boolean) => void} OnStep */
/** @typedef {() => boolean} CanBeStepped */
/** @typedef {0 | 1 | 2} FaceType */

/**
 * @type {Object.<number, (x: number, y: number) => [GetColor, OnStep, Init, CanBeStepped]>}
 * Platform type data
 */
export const PLATFORM_DATA = {
  [START]: () => [
    // TODO: make this the same as static
    () => [.1, .3, .5, 1.],
    Id,
    () => 1,
    0,
  ],
  [STATIC]: () => [
    () => [.4, .6, .5, 1.],
    Id,
    () => 1,
    0,
  ],
  [GAP]: () => [
    () => [.0, .0, .0, .0], 
    Id, 
    () => 0,
    0,
  ],
  [LEVEL_ENTRANCE]: (x, y) => {
    const levelCode = levelMap[[x, y]];
    const solved = isLevelSolved(levelCode);
    const color = solved ? FaceColorMap[0] : FaceColorMap[1];
    return [
    () => color,
    () => {
      emitSignal(S_LEVEL_SELECTED, levelCode);
      playLevelStartSound();
    },
    () => 1,
    1,
  ];
  },
  [END]: () => {
    const color = FaceColorMap[0];
    return [
    () => color, 
    (_x, _y, isFaceDown) => {
      if (isFaceDown && getFace() === 0) {
        emitSignal(S_LEVEL_SOLVED, color);
        playLevelEndSound();
      } else {
        playInvalidMoveSound();
      }
    },
    () => 1,
    2,
  ];
  },
  [LEVEL_GATE]: (x, y) => {
    const open = completedLevelsCount() > gateMap[[x, y]];
    const alpha = open ? 1 : .3;
    return [
    () => [.1, .3, .3, alpha],
    Id,
    () => open,
    0,
  ];
  },
  [SINGLE_STEP]: () => {
    let stepped = 0, alpha = 1;
    return [
      () => [.7, .5, .3, alpha],
      () => (stepped = 1, alpha = .3),
      () => !stepped,
      0,
    ];
  },
  [GATE]: () => {
    gatesLocked = 1;
    alpha = .3;
    return [
      () => [.3, .6, .7, alpha],
      Id,
      () => gatesLocked,
    ]
  },
  [KEY]: () => [
    () => [.2, .5, .6, 1],
    () => (gatesLocked = 0),
    () => 1,
    1,
  ],
  [SWAP]: () => {
    let activeCol = 2, col = FaceColorMap[activeCol];

    return [
      () => col,
      () => {
        const temp = getFace();
        setFace(1, activeCol);
        activeCol = temp;
        col = FaceColorMap[activeCol];
      },
      () => 1,
      1,
    ];
  },
  [EDITOR]: () => [
    () => [1, 1, 1, 1],
    () => emitSignal(S_LEVEL_EDITOR),
    () => 1,
    0,
  ],
};

// Maps {{{

const levelMap = {
  [[1, 0]]: 1,
  [[3, 0]]: 2,
  [[0, 3]]: 3,
  [[2, 3]]: 4,

  [[5, 0]]: 5,
  [[6, 0]]: 6,
  [[7, 2]]: 7,
  [[5, 3]]: 8,

  [[10, 0]]: 9,
  [[9, 2]]: 10,
  [[9, 3]]: 11,

  [[9, 6]]: 12,
  [[10, 8]]: 13,
  [[8, 7]]: 14,
  [[8, 8]]: 15,

  [[5, 9]]: 16,
  [[7, 5]]: 17,
  [[3, 5]]: 18,

  [[3, 9]]: 19,
  [[1, 9]]: 20,
  [[0, 8]]: 21,
  [[0, 6]]: 22,
};
const gateMap = {
  [[4, 2]]: 3,

  [[8, 1]]: 7,

  [[10, 4]]: 10,

  [[7, 9]]: 14,
  [[6, 4]]: 14,

  [[4, 8]]: 17,
  [[1, 4]]: 17,
};

// }}}

// vim: fdm=marker:et:sw=2:
