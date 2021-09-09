import { SIN } from '../util';
export const LINEAR = t => t;
export const EASEOUTQUAD = t => t * (2 - t);
export const EASEOUTQUINT = t => 1 + (--t) * t * t * t * t;
export const EASEINQUINT = t => t * t * t * t * t;
export const EASEINOUTCUBIC = t => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
export const THERENBACK = t => t < .5 ? 2 * t : 2 * (1 - t)
// elastic bounce effect at the beginning
export const EASEINELASTIC = (t) => (.04 - .04 / t) * SIN(25 * t) + 1;
// elastic bounce effect at the end
export const EASEOUTELASTIC = (t) => .04 * t / (--t) * SIN(25 * t);
// elastic bounce effect at the beginning and end
export const EASEINOUTELASTIC = (t) => (t -= .5) < 0 ? (.02 + .01 / t) * SIN(50 * t) : (.02 - .01 / t) * SIN(50 * t) + 1;

/** @typedef {(delta: number) => boolean} Interpolate */
/** @typedef {() => number} GetValue */
/** @typedef {() => void} Reset */
/**
 * Create an interpolated value calculator
 * @param {number} from Start value
 * @param {number} to End value
 * @param {number} duration duration of interpolation
 * @param {any?} function the interpolation function to use
 * @returns {[Interpolate, GetValue, Reset]} functions to operate the interpolation
*/
export const createInterp = (from, to, duration, func = LINEAR) => {
  // t goes from 0 -> duration
  let t = 0, value = from;
  const difference = to - from;

  const interpolate = (delta) => {
    // check if interpolation is done
    if (t >= duration) {
      value = to;
      return true;

      // convert t into range 0 -> 1 and get interpolated value
    } else {
      t += delta;
      value = from + func(t / duration) * difference;
      return false;
    }
  };

  const reset = () => (t = 0, value = from);

  return [
    interpolate,
    () => value,
    reset,
  ]
};

// vim: fdm=marker:et:sw=2:
