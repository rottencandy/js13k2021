import { GAME_WIDTH, GAME_HEIGHT, CANVAS, WIDTH, HEIGHT, STYLE, setCanvas } from './globals.js';
import { MIN } from './util.js';

const aspectRatioFit = (srcWidth, srcHeight, maxWidth, maxHeight) => {
  var ratio = MIN(maxWidth / srcWidth, maxHeight / srcHeight);

  return [
    srcWidth * ratio,
    srcHeight * ratio
  ];
};


onresize = () => {
  const sizes = aspectRatioFit(GAME_WIDTH, GAME_HEIGHT, innerWidth, innerHeight)
  CANVAS[STYLE][WIDTH] = sizes[0] + 'px';
  CANVAS[STYLE][HEIGHT] = sizes[1] + 'px';
};

export const init = (ele) => {
  setCanvas(ele);
  CANVAS[WIDTH] = GAME_WIDTH;
  CANVAS[HEIGHT] = GAME_HEIGHT;
  onresize();
};

// vim: fdm=marker:et:sw=2:
