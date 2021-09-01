import { createSM, enumArray } from './engine/state';
import { SIGNAL_GAME_STARTED, SIGNAL_GAME_PAUSED, watchSignal } from './engine/observer';
import { clear } from './global-state';
import { LEVELS } from './levels';
import { render, loadLevel } from './scene';

// load initial level
loadLevel(LEVELS[0]);

const [PAUSED, PLAYING] = enumArray(2);
const [step] = createSM({
  [PAUSED]: () => {
    if(watchSignal(SIGNAL_GAME_STARTED)) {
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
}

// vim: fdm=marker:et:sw=2:
