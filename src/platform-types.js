import { stateArray } from './engine/state';

// platform types
export const [STATIC, GAP] = stateArray(2);

/** @typedef {[R: number, G: number, B: number, A: number]} Color */
/** @typedef {(faceTouched: boolean) => void} OnStep */

/**
 * @type {Object.<number, [Color, OnStep]>}
 * Platform type data
 */
export const PLATFORM_DATA = {
  [STATIC]: [[.0, .3, .6, 1.0], () => {}],
  [GAP]: [[.0, .0, .0, .0], () => {}],
};

// vim: fdm=marker:et:sw=2:
