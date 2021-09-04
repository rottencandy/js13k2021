import { SIGNAL_GAME_RESUMED, SIGNAL_GAME_PAUSED, SIGNAL_LEVEL_SELECTED, SIGNAL_LEVEL_ENDED, SIGNAL_LEVEL_END_ANIM_PLAYED, watchSignal } from './engine/observer';
import { clear } from './global-state';
import { LEVELS } from './levels';
import { render, loadLevel } from './scene';

let paused = true, nextScene = 0;

// load hub level
loadLevel(LEVELS[nextScene]);

const observeSignals = () => {
  if(watchSignal(SIGNAL_GAME_RESUMED)) {
    paused = false;
  }
  if(watchSignal(SIGNAL_GAME_PAUSED)) {
    paused = true;
  }
  if(watchSignal(SIGNAL_LEVEL_SELECTED)) {
    nextScene = 1;
  }
  if(watchSignal(SIGNAL_LEVEL_ENDED)) {
    nextScene = 0;
  }
  if(watchSignal(SIGNAL_LEVEL_END_ANIM_PLAYED)) {
    loadLevel(LEVELS[nextScene], false);
  }
}

export const update = (delta) => {
  observeSignals();
  clear();
  render(delta, paused);
}

// vim: fdm=marker:et:sw=2:
