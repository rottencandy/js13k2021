import { createSM, enumArray } from './engine/state';
import { SIGNAL_GAME_RESUMED, SIGNAL_GAME_PAUSED, SIGNAL_LEVEL_ENDED, watchSignal } from './engine/observer';
import { clear } from './global-state';
import { LEVELS } from './levels';
import { render, loadLevel } from './scene';

// load hub level
loadLevel(LEVELS[0]);

const [PAUSED, PLAYING] = enumArray(2);
const [step] = createSM({
  [PAUSED]: () => {
    if(watchSignal(SIGNAL_GAME_RESUMED)) {
      return PLAYING;
    }
  },
  [PLAYING]: (delta) => {
    if(watchSignal(SIGNAL_GAME_PAUSED)) {
      return PAUSED;
    }
    clear();
    render(delta);
  },
});

export const update = (delta) => {
  step(delta);
  if(watchSignal(SIGNAL_LEVEL_ENDED)) {
    loadLevel(LEVELS[0]);
  }
}

// vim: fdm=marker:et:sw=2:
