import { SIGNAL_GAME_RESUMED, SIGNAL_GAME_PAUSED, SIGNAL_LEVEL_END_ANIM_PLAYED, watchSignal } from './engine/observer';
import { clear } from './global-state';
import { LEVELS } from './levels';
import { render, loadLevel } from './scene';

// load hub level
loadLevel(LEVELS[1]);
let paused = true;

const observeSignals = () => {
  if(watchSignal(SIGNAL_GAME_RESUMED)) {
    paused = false;
  }
  if(watchSignal(SIGNAL_GAME_PAUSED)) {
    paused = true;
  }
  if(watchSignal(SIGNAL_LEVEL_END_ANIM_PLAYED)) {
    loadLevel(LEVELS[0], false);
  }
}

export const update = (delta) => {
  observeSignals();
  clear();
  render(delta, paused);
}

// vim: fdm=marker:et:sw=2:
