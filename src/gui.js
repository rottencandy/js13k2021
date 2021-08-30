import { createSM, enumArray } from './engine/state';
import { Keys } from './engine/input';
import { emitSignal, watchSignal } from './engine/observer';
import { CANVAS2D, GAME_WIDTH, GAME_HEIGHT } from './globals.js';

const ctx = CANVAS2D.getContext('2d');
const FILL_STYLE = 'fillStyle';

ctx.font = '100 2.5rem Trebuchet, sans-serif';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

const [SPLASH, IN_GAME, PAUSE] = enumArray(3);
const [step] = createSM({
  [SPLASH]: () => {
    ctx[FILL_STYLE] = '#555'
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx[FILL_STYLE] = '#000'
    ctx.fillText('SPACE', 100, 100);
    if(Keys.space) {
      return IN_GAME;
    }
  },
  [IN_GAME]: () => {
    ctx.fillText('II', GAME_WIDTH / 2, 50);
    if(Keys.esc) {
      return PAUSE;
    }
  },
  [PAUSE]: () => {
    ctx.fillText('RESUME', 100, 100);
  },
});

export const update = (delta) => {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  step(delta);
};

// vim: fdm=marker:et:sw=2:
