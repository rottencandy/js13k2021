import {
  S_GAME_RESUMED,
  S_GAME_PAUSED,
  S_LEVEL_SELECTED,
  S_LEVEL_ENDED,
  S_LEVEL_SOLVED,
  S_LEVEL_END_ANIM_PLAYED,
  S_LEVEL_EDITOR,
  S_QUIT_TO_MAIN,
  watchSignal
} from './engine/observer';
import { clear } from './global-state';
import { LEVELS } from './levels';
import { updateScene, loadLevel } from './scene';
import { saveLastPos, setFace } from './player';
import { updateEditor, resetEditor } from './editor';
import { saveLevel } from './local-storage';

let paused = 1, activeLevel = 0, activeScene = updateScene;

// load hub level as non-main level for the first time,
// so that anims are triggered
loadLevel(LEVELS[activeLevel]);
setFace(0);

// Signals {{{

const observeSignals = () => {
  if(watchSignal(S_GAME_RESUMED)) {
    paused = 0;
  }
  if(watchSignal(S_GAME_PAUSED)) {
    paused = 1;
  }
  if(watchSignal(S_LEVEL_SELECTED)) {
    activeLevel = watchSignal(S_LEVEL_SELECTED);
  }
  if(watchSignal(S_LEVEL_EDITOR)) {
    activeLevel = -1;
  }
  if(watchSignal(S_LEVEL_ENDED)) {
    activeLevel = 0;
  }
  if (watchSignal(S_LEVEL_SOLVED)) {
    saveLevel(activeLevel);
  }
  if(watchSignal(S_QUIT_TO_MAIN)) {
    activeScene = updateScene;
    loadLevel(LEVELS[0], 1);
  }
  if(watchSignal(S_LEVEL_END_ANIM_PLAYED)) {
    if (activeLevel === -1) {
      resetEditor();
      saveLastPos();
      activeScene = updateEditor;
    } else {
      activeScene = updateScene;
      loadLevel(LEVELS[activeLevel], activeLevel === 0);
    }
  }
}

// }}}

export const update = (delta) => {
  observeSignals();
  clear();
  activeScene(delta, paused);
}

// vim: fdm=marker:et:sw=2:
