import { enumArray } from './state';

export const [
  S_GAME_PAUSED,
  S_GAME_RESUMED,

  S_CUBE_MOVE_STARTED,
  S_CUBE_MOVE_ENDED,

  S_LEVEL_SELECTED,
  S_LEVEL_LOADED,
  S_LEVEL_STARTED,

  S_LEVEL_RESET,
  S_LEVEL_SOLVED,
  S_LEVEL_ENDED,
  S_LEVEL_END_ANIM_PLAYED,

  S_LEVEL_EDITOR,
  S_EDIT_FINISHED,

  S_QUIT_TO_MAIN,
] = enumArray(14);

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
