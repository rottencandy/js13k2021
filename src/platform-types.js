import { enumArray } from './engine/state';
import {
  S_LEVEL_SELECTED,
  S_LEVEL_SOLVED,
  S_LEVEL_EDITOR,
  emitSignal
} from './engine/observer';
import { Id } from './util';
import { playLevelStartSound, playLevelEndSound } from './sound';
import { isLevelSolved } from './local-storage';

// platform types
const len = 7;
export const [START, STATIC, GAP, END, LEVEL_ENTRANCE, LEVEL_GATE, EDITOR] = enumArray(len);
export const nextPlatform = (i) => ++i >= len-1 ? 0 : i;

export const PLATFORM_CODE = {
  a: START,
  b: STATIC,
  c: GAP,
  d: END,
  e: LEVEL_ENTRANCE,
  f: LEVEL_GATE,
  g: EDITOR,
};

export const findCode = (val) => Object.keys(PLATFORM_CODE).find(k => PLATFORM_CODE[k] === val);

/** @typedef {() => [R: number, G: number, B: number, A: number]} GetColor */
/** @typedef {(x: number, y: number, faceTouched: boolean) => void} OnStep */
/** @typedef {() => boolean} CanBeStepped */

/**
 * @type {Object.<number, (x: number, y: number) => [GetColor, OnStep, Init, CanBeStepped]>}
 * Platform type data
 */
export const PLATFORM_DATA = {
  [START]: () => [
    () => [.5, .7, .6, 1.],
    Id,
    () => 1
  ],
  [STATIC]: () => [
    () => [.0, .0, .5, 1.],
    Id,
    () => 1
  ],
  [GAP]: () => [
    () => [.0, .0, .0, .0], 
    Id, 
    () => 0
  ],
  [END]: () => [
    () => [.0, .7, .2, 1.], 
    (_x, _y, isFaceDown) => {
      if (isFaceDown) {
        emitSignal(S_LEVEL_SOLVED);
        playLevelEndSound();
      }
    },
    () => 1
  ],
  [LEVEL_ENTRANCE]: (x, y) => {
    const levelCode = levelMap[[x, y]];
    const solved = isLevelSolved(levelCode);
    const color = solved ? [.6, .5, .0, 1.] : [.6, .5, .5, 1.];
    return [
    () => color,
    () => {
      emitSignal(S_LEVEL_SELECTED, levelCode);
      playLevelStartSound();
    },
    () => 1
  ]},
  [LEVEL_GATE]: () => [
    () => [1., 1., 1., 1.],
    Id,
    () => 1
  ],
  [EDITOR]: () => [
    () => [.1, 1., .1, 1.],
    () => emitSignal(S_LEVEL_EDITOR),
    () => 1
  ],
};

const levelMap = {
  [[1, 0]]: 1,
  [[0, 3]]: 2,
};

// vim: fdm=marker:et:sw=2:
