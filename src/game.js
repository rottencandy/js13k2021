import { SIGNAL_GAME_RESUMED, SIGNAL_GAME_PAUSED, SIGNAL_LEVEL_SELECTED, SIGNAL_LEVEL_ENDED, SIGNAL_LEVEL_END_ANIM_PLAYED, watchSignal } from './engine/observer';
import { clear } from './global-state';
import { LEVELS } from './levels';
import { updateScene, loadLevel } from './scene';
import { updateEditor } from './editor';

let paused = 1, nextScene = 0;

// load hub level
loadLevel(LEVELS[nextScene]);

const observeSignals = () => {
  if(watchSignal(SIGNAL_GAME_RESUMED)) {
    paused = 0;
  }
  if(watchSignal(SIGNAL_GAME_PAUSED)) {
    paused = 1;
  }
  if(watchSignal(SIGNAL_LEVEL_SELECTED)) {
    nextScene = 1;
  }
  if(watchSignal(SIGNAL_LEVEL_ENDED)) {
    nextScene = 0;
  }
  if(watchSignal(SIGNAL_LEVEL_END_ANIM_PLAYED)) {
    loadLevel(LEVELS[nextScene], 0);
  }
}

export const update = (delta) => {
  observeSignals();
  clear();
  //updateScene(delta, paused);

  updateEditor(delta, paused);
}

// vim: fdm=marker:et:sw=2:
