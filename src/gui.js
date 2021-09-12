import { createSM, enumArray } from './engine/state';
import { Keys, ARROW } from './engine/input';
import {
  S_GAME_RESUMED,
  S_GAME_PAUSED,
  S_LEVEL_ENDED,
  S_LEVEL_SELECTED,
  S_LEVEL_END_ANIM_PLAYED,
  S_LEVEL_EDITOR,
  S_LEVEL_RESET,
  S_EDIT_FINISHED,
  S_QUIT_TO_MAIN,
  emitSignal,
  watchSignal
} from './engine/observer';
import { createInterp, EASEOUTQUAD, EASEINQUINT } from './engine/lerp';
import { CANVAS2D, GAME_WIDTH, GAME_HEIGHT } from './globals.js';
import { getById, ABS, PI, SQRT, MAX } from './util';

const ctx = CANVAS2D.getContext('2d');
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
const FILL_STYLE = 'fillStyle';

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
    initialPos = 0;

    if (pendingEventFire) {
      onkeydown({ key: ARROW + touchDir });
      pendingEventFire = 0;
    } else if (touchDir) {
      onkeyup({ key: ARROW + touchDir });
      touchDir = '';
    }
  }
};

const Inp = getById('e');
const hideInput = () => {
  Inp.style.display = 'none';
};

// }}}

// Config {{{

const BASE_FONT = ' Trebuchet, sans-serif';
const TITLE_FONT = '100 48px' + BASE_FONT;
const SUB_FONT = '100 26px' + BASE_FONT;
const SUB_FONT2 = '100 22px' + BASE_FONT;
const BOLD_FONT = '26px' + BASE_FONT;

const titleGradient1 = rgba(30, 20, 20, 1);
const titleGradient2_from = 50;
const titleGradient2_to = 210;
const titleTextColor = rgba(0, 0, 0, 1);
const CONTROLS = 'Controls: ←↑→↓ | WASD | ZQSD | touch & drag';
const tweenedTutorialText = createInterp(1, 0, 5, EASEINQUINT);

const pauseScrnColor = rgba(180, 200, 200, 1),
  topBtnX = GAME_WIDTH / 2,
  topBtnY = 50,
  btnSize = 25,
  midBtnX = GAME_WIDTH / 2,
  midBtnY = GAME_HEIGHT / 2,
  btnTextColor = rgba(50, 50, 50, 1);

const indicatorColor = rgba(190, 200, 200, 0.7);
const indicatorSize = 60;
const levelTransitionColor = rgba(200, 190, 200, 1);

let inEditor = false;
let inLevel = false;
let tweenedIntroBG = createInterp(titleGradient2_from, titleGradient2_to, 10, EASEOUTQUAD);
let tweenedTransition;
let tweenedPauseCircle;

// }}}

// SM {{{

const [SPLASH, INTRO_TRANSITION, IN_GAME, PAUSE_TRANSITION, UNPAUSE_TRANSITION, LEVEL_TRANSITION, PAUSED] = enumArray(7);
const [step] = createSM({
  [SPLASH]: (delta) => {
    tweenedIntroBG[0](delta);
    const col = tweenedIntroBG[1]();
    fullGradient(titleGradient1, rgba(col, col, col, 1));
    text(GAME_WIDTH / 2, GAME_HEIGHT / 3, titleTextColor, TITLE_FONT, 'UNTITLED SPACE GAME');
    text(GAME_WIDTH / 2, 2 * GAME_HEIGHT / 3, titleTextColor, SUB_FONT, 'START');

    if(Keys.space || Keys.clicked) {
      tweenedIntroBG = createInterp(1, 0, 2, EASEOUTQUAD);
      return INTRO_TRANSITION;
    }
  },
  [INTRO_TRANSITION]: (delta) => {
    const done = tweenedIntroBG[0](delta);
    const alpha = tweenedIntroBG[1]();
    const col = 220;
    fullGradient(rgba(30, 40, 40, alpha),rgba(col, col, col, alpha));
    if (done) {
      emitSignal(S_GAME_RESUMED);
      return IN_GAME;
    }
  },
  [IN_GAME]: (dt) => {
    circleBtn(topBtnX, topBtnY, btnSize, pauseScrnColor, btnTextColor, BOLD_FONT, 'II');
    inEditor && circleBtn(topBtnX - 90, topBtnY, btnSize, pauseScrnColor, btnTextColor, BOLD_FONT, '⦺');
    inEditor && circleBtn(topBtnX + 90, topBtnY, btnSize, pauseScrnColor, btnTextColor, BOLD_FONT, '🗸');
    inLevel && circleBtn(topBtnX + 90, topBtnY, btnSize, pauseScrnColor, btnTextColor, BOLD_FONT, '↺');

    // tutorial text
    if (!tweenedTutorialText[0](dt)) {
      text(GAME_WIDTH / 2, GAME_HEIGHT / 2, rgba(0, 0, 0, tweenedTutorialText[1]()), SUB_FONT2, CONTROLS);
    }

    const isDragging = handleDragDirection();

    if (inLevel && !isDragging && isCircleClicked(topBtnX + 90, topBtnY, btnSize)) {
      emitSignal(S_LEVEL_RESET);
    }

    // paused
    if (!isDragging && (Keys.esc || isCircleClicked(topBtnX, topBtnY, btnSize))) {
      emitSignal(S_GAME_PAUSED);
      tweenedPauseCircle = createInterp(0, GAME_WIDTH, 0.7);
      return PAUSE_TRANSITION;
    }

    if (inEditor) {
      // edit completed
      if (!isDragging && isCircleClicked(topBtnX + 90, topBtnY, btnSize)) {
        emitSignal(S_EDIT_FINISHED);
        tweenedPauseCircle = createInterp(0, GAME_WIDTH, 0.7);
        return PAUSE_TRANSITION;
      }
      // cycle platform
      if (!isDragging && isCircleClicked(topBtnX - 90, topBtnY, btnSize)) {
        // NOTE: setting state directly like this causes flickering after delay
        // but it's fine as there is a good amount of delay
        Keys.space = 1;
      } else {
        Keys.space = 0;
      }
    }

    if (watchSignal(S_LEVEL_ENDED) || watchSignal(S_LEVEL_SELECTED) || watchSignal(S_LEVEL_EDITOR)) {
      emitSignal(S_GAME_PAUSED);
      tweenedTransition = createInterp(0, GAME_WIDTH, 1);
      inLevel = watchSignal(S_LEVEL_SELECTED);
      inEditor = watchSignal(S_LEVEL_EDITOR);
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
        emitSignal(S_GAME_RESUMED);
        return IN_GAME;
      }
      emitSignal(S_LEVEL_END_ANIM_PLAYED);
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
  [UNPAUSE_TRANSITION]: (delta) => {
    const done = tweenedPauseCircle[0](delta);
    const size = MAX(tweenedPauseCircle[1](), 0);
    circle(topBtnX, topBtnY, size, pauseScrnColor);
    if (done) {
      emitSignal(S_GAME_RESUMED);
      return IN_GAME;
    }
  },
  [PAUSED]: () => {
    fullGradient(pauseScrnColor, pauseScrnColor);
    circleBtn(midBtnX - 50, midBtnY, btnSize, btnTextColor, pauseScrnColor, BOLD_FONT, '▶');
    circleBtn(midBtnX + 50, midBtnY, btnSize, btnTextColor, pauseScrnColor, BOLD_FONT, '⌂');

    // resume button
    if (isCircleClicked(midBtnX - 50, midBtnY, btnSize)) {
      tweenedPauseCircle = createInterp(GAME_WIDTH, 0, 0.7);
      hideInput();
      return UNPAUSE_TRANSITION;
    }
    // home button
    if (isCircleClicked(midBtnX + 50, midBtnY, btnSize)) {
      tweenedPauseCircle = createInterp(GAME_WIDTH, 0, 0.7);
      emitSignal(S_QUIT_TO_MAIN);
      hideInput();
      inEditor = false;
      return UNPAUSE_TRANSITION;
    }
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
