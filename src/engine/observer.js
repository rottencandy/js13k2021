import { enumArray } from './state';

export const [
  SIGNAL_GAME_RESUMED,
  SIGNAL_GAME_PAUSED,
  SIGNAL_CUBE_MOVE_STARTED,
  SIGNAL_CUBE_MOVE_ENDED,
  SIGNAL_LEVEL_LOADED,
  SIGNAL_LEVEL_STARTED,
  SIGNAL_LEVEL_SOLVED,
  SIGNAL_LEVEL_ENDED,
  SIGNAL_LEVEL_END_ANIM_PLAYED,
  SIGNAL_LEVEL_SELECTED,
] = enumArray(10);

let PREV_SIGNALS = {}, NEXT_SIGNALS = {};

/** Collect all emitted signals and make them available for wathing */
export const signalStep = () => {
  // swapping is done to reduce GC pauses
  const temp = PREV_SIGNALS;
  PREV_SIGNALS = NEXT_SIGNALS;
  NEXT_SIGNALS = temp;
  for(let k in NEXT_SIGNALS) {
    delete NEXT_SIGNALS[k];
  }
};

export const emitSignal = (signal, data = 1) => {
  NEXT_SIGNALS[signal] = data;
};

export const watchSignal = (signal) => {
  return PREV_SIGNALS[signal];
};

// vim: fdm=marker:et:sw=2:
