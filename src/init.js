import { setupKeyListener } from './engine/input';
import { GAME_WIDTH, GAME_HEIGHT, CANVAS, CANVAS2D, WIDTH, HEIGHT, STYLE } from './globals';
import { getById, deviceScaleRatio } from './util';

onresize = () => {
  const ratio = deviceScaleRatio();
  CANVAS[STYLE][WIDTH] = CANVAS2D[STYLE][WIDTH] = GAME_WIDTH * ratio + 'px';
  CANVAS[STYLE][HEIGHT] = CANVAS2D[STYLE][HEIGHT] = GAME_HEIGHT * ratio + 'px';
  // display note if device is in potrait
  getById('d').style.display = innerWidth < innerHeight ? 'block':'none';
};

CANVAS[WIDTH] = CANVAS2D[WIDTH] = GAME_WIDTH;
CANVAS[HEIGHT] = CANVAS2D[HEIGHT] = GAME_HEIGHT;
onresize();

setupKeyListener();

// vim: fdm=marker:et:sw=2:
