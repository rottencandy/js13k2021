import { SIGNAL_GAME_RESUMED, SIGNAL_GAME_PAUSED, SIGNAL_LEVEL_SELECTED, SIGNAL_LEVEL_ENDED, SIGNAL_LEVEL_END_ANIM_PLAYED, SIGNAL_LEVEL_EDITOR, watchSignal } from './engine/observer';
import { clear } from './global-state';
import { LEVELS } from './levels';
import { updateScene, loadLevel } from './scene';
import { updateEditor, resetEditor } from './editor';

let paused = 1, nextScene = 0, activeScene = updateScene;

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
  if(watchSignal(SIGNAL_LEVEL_EDITOR)) {
    nextScene = -1;
  }
  if(watchSignal(SIGNAL_LEVEL_ENDED)) {
    nextScene = 0;
  }
  if(watchSignal(SIGNAL_LEVEL_END_ANIM_PLAYED)) {
    if (nextScene === -1) {
      resetEditor();
      activeScene = updateEditor;
    } else {
      activeScene = updateScene;
      loadLevel(LEVELS[nextScene], 0);
    }
  }
}

export const update = (delta) => {
  observeSignals();
  clear();
  activeScene(delta, paused);
}

// vim: fdm=marker:et:sw=2:
