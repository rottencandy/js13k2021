import { GAME_WIDTH, GAME_HEIGHT, CANVAS, WIDTH, HEIGHT, STYLE, setCanvas } from './globals.js';
import { MIN, getById } from './util.js';
import { setupKeyListener } from './engine/input.js';

onresize = () => {
  const ratio = MIN(innerWidth / GAME_WIDTH, innerHeight / GAME_HEIGHT);
  CANVAS[STYLE][WIDTH] = GAME_WIDTH * ratio + 'px';
  CANVAS[STYLE][HEIGHT] = GAME_HEIGHT * ratio + 'px';
};

const ele = getById('b');
setCanvas(ele);
CANVAS[WIDTH] = GAME_WIDTH;
CANVAS[HEIGHT] = GAME_HEIGHT;
onresize();

setupKeyListener();

// vim: fdm=marker:et:sw=2:
