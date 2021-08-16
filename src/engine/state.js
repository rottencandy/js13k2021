/**
 * State machine function.
 * @typedef {(...data: any[]) => number} StateFn
 */
/**
 * Create linear state machine.
 * Initial state is always first function.
 *
 * @param {Object<number, StateFn>} states - Array of state functions, each optionally returning the next state.
 *
 * @example
 * const step = createSM({
 *   0: () => {},
 *   1: () => {}
 * });
 *
 * @returns {(...data: any[]) => number} Step function, returns last run state.
 * Any args will be passed on to state function.
*/
export const createSM = (states) => {
  let state = 0;
  return (...data) => {
    next = states[state](...data);
    state = next === undefined ? state : next;
    return state;
  };
}

// vim: fdm=marker:et:sw=2:
