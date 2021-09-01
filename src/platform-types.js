import { enumArray } from './engine/state';
import { SIGNAL_LEVEL_SOLVED, emitSignal } from './engine/observer';
import { Id } from './util';

// platform types
export const [START, STATIC, GAP, END] = enumArray(4);

export const PLATFORM_CODE = {
  a: START,
  b: STATIC,
  c: GAP,
  d: END,
};

/** @typedef {[R: number, G: number, B: number, A: number]} Color */
/** @typedef {(faceTouched: boolean) => void} OnStep */
/** @typedef {boolean} CanBeStepped */

/**
 * @type {Object.<number, [Color, OnStep, Init, CanBeStepped]>}
 * Platform type data
 */
export const PLATFORM_DATA = {
  [START]: [
    [.0, .3, .6, 1.0],
    Id,
    1
  ],
  [STATIC]: [
    [.0, .3, .6, 1.0],
    Id,
    1
  ],
  [GAP]: [
    [.0, .0, .0, .0], 
    Id, 
    0
  ],
  [END]: [
    [.0, .6, .3, 1.0], 
    () => {emitSignal(SIGNAL_LEVEL_SOLVED)}, 
    1
  ],
};

// vim: fdm=marker:et:sw=2:
