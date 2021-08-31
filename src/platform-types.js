import { enumArray } from './engine/state';
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

/**
 * @type {Object.<number, [Color, OnStep, Init]>}
 * Platform type data
 */
export const PLATFORM_DATA = {
  [START]: [[.0, .3, .6, 1.0], Id],
  [STATIC]: [[.0, .3, .6, 1.0], Id],
  [GAP]: [[.0, .0, .0, .0], Id],
  [END]: [[.0, .3, .6, 1.0], Id],
};

// vim: fdm=marker:et:sw=2:
