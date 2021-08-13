import {RAF} from './util.js';

/**
 * Start the game loop
 * Return any truthy value to terminate.
 *
 * @param {(delta: number) => void} step - update function
 */
export const startLoop = (step) => {
  let last = 0;
  const loop = (now) => {
    // Sanity check - absorb random lag spike / frame jumps
    // (expected delta for 60FPS is 1000/60 = ~16.67ms)
    let dt = Math.min(now - last, 500) / 1000;

    last = now;

    // Stop on truthy return
    //step(dt, now) || RAF(loop);
    step(dt, now);
    RAF(loop);
  };
  RAF(loop);
};

// vim: fdm=marker:et:sw=2:
