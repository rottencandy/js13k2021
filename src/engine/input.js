import { CANVAS2D } from '../globals';
import { deviceScaleRatio } from '../util';
/**
 * Keys being watched
 * @typedef {Object} WatchedKeys
 * @property {boolean} left - left key
 * @property {boolean} right - right key
 * @property {boolean} up - up key
 * @property {boolean} down - down key
 * @property {boolean} space - space key
 * @property {boolean} esc - escape key
 * @property {boolean} clicked - clicked mouse btn
 * @property {number} touchX - touch screen coordinates
 * @property {number} touchY - touch screen coordinates
*/
/** @type {WatchedKeys} */
export const Keys = {
  left: 0,
  right: 0,
  up: 0,
  down: 0,
  space: 0,
  esc: 0,
  clicked: 0,
  touchX: 0,
  touchY: 0,
};

export const dirKeysPressed = () => Keys.left || Keys.right || Keys.up || Keys.down;

/**
 * Set up onkey listeners
*/
export const setupKeyListener = () => {
  const setKeyState = (value) => ({key: code}) => {
    const ARROW = 'Arrow';
    switch (code) {
      case ARROW + 'Up':
      case 'w':
      case 'z':
        Keys.up = value;
        break;
      case ARROW + 'Down':
      case 's':
        Keys.down = value;
        break;
      case ARROW + 'Left':
      case 'a':
      case 'q':
        Keys.left = value;
        break;
      case ARROW + 'Right':
      case 'd':
        Keys.right = value;
        break;
      case 'Escape':
        Keys.esc = value;
        break;
      case ' ':
        Keys.space = value;
    }
  }

  onkeydown = setKeyState(1);
  onkeyup = setKeyState(0);

  CANVAS2D.onpointerdown = () => Keys.clicked = 1;
  CANVAS2D.onpointerup = () => Keys.clicked = 0;
  CANVAS2D.onpointermove = e => {
    const ratio = deviceScaleRatio();
    Keys.touchX = e.offsetX / ratio;
    Keys.touchY = e.offsetY / ratio;
  }
  CANVAS2D.ontouchstart = CANVAS2D.ontouchmove = CANVAS2D.ontouchend = CANVAS2D.ontouchcancel = e => {
    e.preventDefault();
    Keys.clicked = e.touches.length > 0;
    if(Keys.clicked) {
      const ratio = deviceScaleRatio();
      Keys.touchX = e.touches[0].offsetX / ratio;
      Keys.touchY = e.touches[0].offsetY / ratio;
    }
  }
}

// vim: fdm=marker:et:sw=2:
