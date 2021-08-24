import { stateArray } from './engine/state';

// platform types
export const [STATIC, GAP] = stateArray(2);

/** @typedef {[R: number, G: number, B: number, A: number]} Color */
/**
 * Get platform type data
 * @param {number} type
 * @returns {[Color]}
 */
export const platformData = (type) => {
  switch(type) {
    case STATIC:
     return [[.0, .3, .6, 1.0]];
    case GAP:
     return [[.0, .0, .0, .0]];
  }
}

// vim: fdm=marker:et:sw=2:
