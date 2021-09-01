import { createSM, enumArray } from './engine/state';
import { Keys } from './engine/input';
import { SIGNAL_GAME_STARTED, SIGNAL_GAME_PAUSED, emitSignal, watchSignal } from './engine/observer';
import { CANVAS2D, GAME_WIDTH, GAME_HEIGHT } from './globals.js';
import { PI, SQRT } from './util';

const ctx = CANVAS2D.getContext('2d');
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

const FILL_STYLE = 'fillStyle';
const BASE_FONT = ' Trebuchet, sans-serif';
const TITLE_FONT = '100 48px' + BASE_FONT;
const SUB_FONT = '100 26px' + BASE_FONT;
const BOLD_FONT = '26px' + BASE_FONT;

// Utils {{{

const color = (...cols) => 'rgba('+cols.join(',')+')';
const fullGradient = (color1, color2) => {
  const gradient = ctx.createLinearGradient(0, GAME_HEIGHT, GAME_WIDTH, 0);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  ctx[FILL_STYLE] = gradient;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
};

const text = (x, y, color, font, content) => {
  ctx[FILL_STYLE] = color;
  ctx.font = font;
  ctx.fillText(content, x, y);
};

const circle = (x, y, radius, color) => {
  ctx[FILL_STYLE] = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, PI * 2);
  ctx.fill();
};

const isInCircle = (px, py, cx, cy, radius) => {
  const distX = px - cx;
  const distY = py - cy;
  const dist = SQRT(distX * distX + distY * distY);
  return dist <= radius;
};

// }}}

// Update {{{

const [SPLASH, IN_GAME, PAUSE] = enumArray(3);
const [step] = createSM({
  [SPLASH]: () => {
    fullGradient(color(100, 100, 100, 1),color(200, 200, 200, 1));
    text(GAME_WIDTH / 2, GAME_HEIGHT / 3, color(0, 0, 0, 1), TITLE_FONT, 'UNTITLED SPACE GAME');
    text(GAME_WIDTH / 2, 2 * GAME_HEIGHT / 3, color(0, 0, 0, 1), SUB_FONT, 'start');

    if(Keys.space || Keys.clicked || Keys.touching) {
      emitSignal(SIGNAL_GAME_STARTED);
      return IN_GAME;
    }
  },
  [IN_GAME]: () => {
    circle(GAME_WIDTH / 2, 50, 25, color(200, 200, 200, 1));
    text(GAME_WIDTH / 2, 50, color(50, 50, 50, 1), BOLD_FONT, 'II');

    if(Keys.esc) {
      emitSignal(SIGNAL_GAME_PAUSED);
      return PAUSE;
    }
  },
  [PAUSE]: () => {
    text(GAME_WIDTH / 2, 100, color(0, 0, 0, 1), TITLE_FONT, 'RESUME');
  },
});

// }}}

// Render {{{

export const update = (delta) => {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  step(delta);
};

// }}}

// vim: fdm=marker:et:sw=2:
