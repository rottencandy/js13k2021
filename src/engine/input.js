/**
 * Keys being watched
 * @typedef {Object} WatchedKeys
 * @property {boolean} left - left key
 * @property {boolean} right - right key
 * @property {boolean} up - up key
 * @property {boolean} down - down key
 * @property {boolean} space - space key
*/
/** @type {WatchedKeys} */
export const Keys = {
  left: 0,
  right: 0,
  up: 0,
  down: 0,
  space: 0,
  esc: 0,
};

export const dirKeysPressed = () => Keys.left || Keys.right || Keys.up || Keys.down;

/**
 * Set up onkey listeners
*/
export const setupKeyListener = () => {
  const ARROW = 'Arrow';
  const setKeyState = (value) => ({key: code}) => {
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
}

// vim: fdm=marker:et:sw=2:
