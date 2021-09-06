import { enumArray } from './engine/state';
import { SIGNAL_LEVEL_SOLVED, SIGNAL_LEVEL_SELECTED, emitSignal } from './engine/observer';
import { Id } from './util';

// platform types
const len = 6;
export const [START, STATIC, GAP, END, LEVEL_ENTRANCE, LEVEL_GATE] = enumArray(len);
export const nextPlatform = (i) => ++i >= len-1 ? 0 : i;

export const PLATFORM_CODE = {
  a: START,
  b: STATIC,
  c: GAP,
  d: END,
  e: LEVEL_ENTRANCE,
  f: LEVEL_GATE,
};

/** @typedef {() => [R: number, G: number, B: number, A: number]} GetColor */
/** @typedef {(faceTouched: boolean) => void} OnStep */
/** @typedef {() => boolean} CanBeStepped */

/**
 * @type {Object.<number, () => [GetColor, OnStep, Init, CanBeStepped]>}
 * Platform type data
 */
export const PLATFORM_DATA = {
  [START]: () => [
    () => [.0, .3, .6, 1.0],
    Id,
    () => 1
  ],
  [STATIC]: () => [
    () => [.0, .3, .6, 1.0],
    Id,
    () => 1
  ],
  [GAP]: () => [
    () => [.0, .0, .0, .0], 
    Id, 
    () => 0
  ],
  [END]: () => [
    () => [.0, .6, .3, 1.0], 
    () => {emitSignal(SIGNAL_LEVEL_SOLVED)}, 
    () => 1
  ],
  [LEVEL_ENTRANCE]: () => [
    () => [.6, .5, .0, 1.0],
    () => {emitSignal(SIGNAL_LEVEL_SELECTED)},
    () => 1
  ],
  [LEVEL_GATE]: () => [
    () => [1., 1., 1., 1.0],
    Id,
    () => 1
  ],
};

// vim: fdm=marker:et:sw=2:
