import { createSM, enumArray } from './engine/state';
import { Keys, ARROW } from './engine/input';
import { SIGNAL_GAME_RESUMED, SIGNAL_GAME_PAUSED, SIGNAL_LEVEL_ENDED, SIGNAL_LEVEL_SELECTED, SIGNAL_LEVEL_END_ANIM_PLAYED, SIGNAL_LEVEL_EDITOR, SIGNAL_EDIT_FINISHED, emitSignal, watchSignal } from './engine/observer';
import { createInterp, EASEOUTQUAD } from './engine/lerp';
import { CANVAS2D, GAME_WIDTH, GAME_HEIGHT } from './globals.js';
import { ABS, PI, SQRT, MAX } from './util';

const ctx = CANVAS2D.getContext('2d');
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
const FILL_STYLE = 'fillStyle';

let inEditor = false;
let tweenedIntroBG = createInterp(50, 210, 10, EASEOUTQUAD);
let tweenedTransition;
let tweenedPauseCircle;

// Utils {{{

const rgba = (...cols) => 'rgba('+cols.join(',')+')';
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

const triangle = (p1, p2, p3) => {
  ctx[FILL_STYLE] = indicatorColor;
  ctx.beginPath();
  ctx.lineCap = 'round';
  ctx.moveTo(p1[0], p1[1]);
  ctx.lineTo(p2[0], p2[1]);
  ctx.lineTo(p3[0], p3[1]);
  ctx.fill();
};

const line = (p1, p2) => {
  ctx.strokeStyle = indicatorColor;
  ctx.beginPath();
  ctx.lineWidth = 20;
  ctx.moveTo(p1[0], p1[1]);
  ctx.lineTo(p2[0], p2[1]);
  ctx.stroke();
};

const circleBtn = (x, y, radius, btnColor, textColor, font, content) => {
  circle(x, y, radius, btnColor);
  text(x, y, textColor, font, content);
};

const isCircleClicked = (cx, cy, radius) => {
  if (!Keys.clicked) {
    return false;
  }
  const distX = Keys.touchX - cx;
  const distY = Keys.touchY - cy;
  const dist = SQRT(distX * distX + distY * distY);
  return dist <= radius;
};

const drawDragIndicatorLR = (invert) => {
  const xpos = invert? indicatorSize:-indicatorSize;
  const halfWidth = GAME_WIDTH / 2;
  const halfHeight = GAME_HEIGHT / 2;
  triangle(
    [halfWidth + xpos, halfHeight],
    [halfWidth, halfHeight + indicatorSize],
    [halfWidth, halfHeight - indicatorSize]);
};

const drawDragIndicatorUD = (invert) => {
  const ypos = invert? 50:-50;
  const halfWidth = GAME_WIDTH / 2;
  const halfHeight = GAME_HEIGHT / 2;
  triangle(
    [halfWidth, halfHeight + ypos],
    [halfWidth + indicatorSize, halfHeight],
    [halfWidth - indicatorSize, halfHeight]);
};

let initialPos = 0;
let pendingEventFire = 0;
let touchDir = '';
const handleDragDirection = () => {
  const THRESHOLD = 50;
  if (Keys.clicked) {
    if (!initialPos) {
      initialPos = [Keys.touchX, Keys.touchY];
    }
    const relX = Keys.touchX - initialPos[0];
    const relY = Keys.touchY - initialPos[1];
    const absX = ABS(relX);
    const absY = ABS(relY);

    // draw drag indicator line
    line(initialPos, [Keys.touchX, Keys.touchY]);
    circle(initialPos[0], initialPos[1], 20, indicatorColor);

    if (absX < THRESHOLD && absY < THRESHOLD) {
      pendingEventFire = 0, touchDir = '';
    } else {
      pendingEventFire = 1;
      if (absX > absY) {
        touchDir = relX < 0 ? 'Left' : 'Right';
        drawDragIndicatorLR(relX > 0);
      } else {
        touchDir = relY < 0 ? 'Up' : 'Down';
        drawDragIndicatorUD(relY > 0);
      }
      return true;
    }

  } else {
    if (pendingEventFire) {
      onkeydown({ key: ARROW + touchDir });
      pendingEventFire = initialPos = 0;
    } else if (touchDir) {
      onkeyup({ key: ARROW + touchDir });
      touchDir = '';
    }
  }
};

// }}}

// Config {{{

const BASE_FONT = ' Trebuchet, sans-serif';
const TITLE_FONT = '100 48px' + BASE_FONT;
const SUB_FONT = '100 26px' + BASE_FONT;
const BOLD_FONT = '26px' + BASE_FONT;

const pauseScrnColor = rgba(180, 200, 200, 1),
  topBtnX = GAME_WIDTH / 2,
  topBtnY = 50,
  topBtnSize = 25;
const indicatorColor = rgba(190, 200, 200, 0.7);
const indicatorSize = 60;
//const indicatorCircle = color(190, 200, 200, 0.5);
const levelTransitionColor = rgba(200, 190, 200, 1);

// }}}

// SM {{{

const [SPLASH, INTRO_TRANSITION, IN_GAME, PAUSE_TRANSITION, LEVEL_TRANSITION, PAUSED] = enumArray(5);
const [step] = createSM({
  [SPLASH]: (delta) => {
    tweenedIntroBG[0](delta);
    const col = tweenedIntroBG[1]();
    fullGradient(rgba(30, 20, 20, 1),rgba(col + 30, col, col - 50, 1));
    text(GAME_WIDTH / 2, GAME_HEIGHT / 3, rgba(0, 0, 0, 1), TITLE_FONT, 'UNTITLED SPACE GAME');
    text(GAME_WIDTH / 2, 2 * GAME_HEIGHT / 3, rgba(0, 0, 0, 1), SUB_FONT, 'start');

    if(Keys.space || Keys.clicked) {
      tweenedIntroBG = createInterp(1, 0, 1, EASEOUTQUAD);
      return INTRO_TRANSITION;
    }
  },
  [INTRO_TRANSITION]: (delta) => {
    const done = tweenedIntroBG[0](delta);
    const alpha = tweenedIntroBG[1]();
    const col = 220;
    fullGradient(rgba(30, 40, 40, alpha),rgba(col, col, col, alpha));
    if (done) {
      emitSignal(SIGNAL_GAME_RESUMED);
      return IN_GAME;
    }
  },
  [IN_GAME]: () => {
    circleBtn(topBtnX, topBtnY, topBtnSize, pauseScrnColor, rgba(50, 50, 50, 1), BOLD_FONT, 'II');
    inEditor && circleBtn(topBtnX + 90, topBtnY, topBtnSize, pauseScrnColor, rgba(50, 50, 50, 1), BOLD_FONT, '🗸');

    const isDragging = handleDragDirection();

    // paused
    if (!isDragging && (Keys.esc || isCircleClicked(topBtnX, topBtnY, topBtnSize))) {
      emitSignal(SIGNAL_GAME_PAUSED);
      tweenedPauseCircle = createInterp(0, GAME_WIDTH, 0.7);
      return PAUSE_TRANSITION;
    }

    // edit completed
    if (inEditor && !isDragging && isCircleClicked(topBtnX + 90, topBtnY, topBtnSize)) {
      emitSignal(SIGNAL_EDIT_FINISHED);
      tweenedPauseCircle = createInterp(0, GAME_WIDTH, 0.7);
      return PAUSE_TRANSITION;
    }

    if (watchSignal(SIGNAL_LEVEL_ENDED) || watchSignal(SIGNAL_LEVEL_SELECTED) || watchSignal(SIGNAL_LEVEL_EDITOR)) {
      emitSignal(SIGNAL_GAME_PAUSED);
      tweenedTransition = createInterp(0, GAME_WIDTH, 1);
      inEditor = watchSignal(SIGNAL_LEVEL_EDITOR);
      return LEVEL_TRANSITION;
    }
  },
  [LEVEL_TRANSITION]: (delta) => {
    // MAX is a safety net, drawing circles with -ve radius crashes
    const value = MAX(tweenedTransition[1](), 0);
    circle(GAME_WIDTH / 2, GAME_HEIGHT / 2, value, levelTransitionColor);

    const done = tweenedTransition[0](delta);
    if (done) {
      if (value === 0) {
        emitSignal(SIGNAL_GAME_RESUMED);
        return IN_GAME;
      }
      emitSignal(SIGNAL_LEVEL_END_ANIM_PLAYED);
      // reuse the same var to tween in the reverse direction
      tweenedTransition = createInterp(GAME_WIDTH, 0, 1);
    }
  },
  [PAUSE_TRANSITION]: (delta) => {
    const done = tweenedPauseCircle[0](delta);
    const size = tweenedPauseCircle[1]();
    circle(topBtnX, topBtnY, size, pauseScrnColor);
    if (done) {
      return PAUSED;
    }
  },
  [PAUSED]: () => {
    text(GAME_WIDTH / 2, 100, rgba(0, 0, 0, 1), TITLE_FONT, 'RESUME');
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
