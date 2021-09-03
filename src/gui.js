import { createSM, enumArray } from './engine/state';
import { Keys } from './engine/input';
import { SIGNAL_GAME_STARTED, SIGNAL_GAME_PAUSED, emitSignal, watchSignal } from './engine/observer';
import { createInterp, EASEOUTQUAD } from './engine/lerp';
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

let tweenedBackground = createInterp(50, 220, 5, EASEOUTQUAD);
let tweenedPauseCircle;

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

// Config {{{

const pauseScrnColor = color(180, 200, 200, 1),
  pauseBtnX = GAME_WIDTH / 2,
  pauseBtnY = 50,
  pauseBtnSize = 25;

// }}}

// Update {{{

const [SPLASH, INTRO_TRANSITION, IN_GAME, PAUSE_TRANSITION, PAUSED] = enumArray(5);
const [step] = createSM({
  [SPLASH]: (delta) => {
    tweenedBackground[0](delta);
    const col = tweenedBackground[1]();
    fullGradient(color(30, 40, 40, 1),color(col, col, col, 1));
    text(GAME_WIDTH / 2, GAME_HEIGHT / 3, color(0, 0, 0, 1), TITLE_FONT, 'UNTITLED SPACE GAME');
    text(GAME_WIDTH / 2, 2 * GAME_HEIGHT / 3, color(0, 0, 0, 1), SUB_FONT, 'start');

    if(Keys.space || Keys.clicked || Keys.touching) {
      tweenedBackground = createInterp(1, 0, 1, EASEOUTQUAD);
      return INTRO_TRANSITION;
    }
  },
  [INTRO_TRANSITION]: (delta) => {
    const done = tweenedBackground[0](delta);
    const alpha = tweenedBackground[1]();
    const col = 220;
    fullGradient(color(30, 40, 40, alpha),color(col, col, col, alpha));
    if (done) {
      emitSignal(SIGNAL_GAME_STARTED);
      return IN_GAME;
    }
  },
  [IN_GAME]: () => {
    circle(pauseBtnX, pauseBtnY, pauseBtnSize, pauseScrnColor);
    text(GAME_WIDTH / 2, 50, color(50, 50, 50, 1), BOLD_FONT, 'II');

    if(Keys.esc || Keys.clicked && isInCircle(Keys.touchX, Keys.touchY, pauseBtnX, pauseBtnY, pauseBtnSize)) {
      emitSignal(SIGNAL_GAME_PAUSED);
      tweenedPauseCircle = createInterp(0, GAME_WIDTH, 0.7);
      return PAUSE_TRANSITION;
    }
  },
  [PAUSE_TRANSITION]: (delta) => {
    const done = tweenedPauseCircle[0](delta);
    const size = tweenedPauseCircle[1]();
    circle(pauseBtnX, pauseBtnY, size, pauseScrnColor);
    if (done) {
      return PAUSED;
    }
  },
  [PAUSED]: () => {
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
