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
};

/**
 * Set up onkey listeners
*/
export const setupKeyListener = () => {
  const setKeyState = (value) => ({key: code}) => {
    switch (code) {
      case 'ArrowUp':
      case 'w':
      case 'z':
        Keys.up = value;
        break;
      case 'ArrowDown':
      case 's':
        Keys.down = value;
        break;
      case 'ArrowLeft':
      case 'a':
      case 'q':
        Keys.left = value;
        break;
      case 'ArrowRight':
      case 'd':
        Keys.right = value;
        break;
      case ' ':
        Keys.space = value;
      //break;
      //default:
      //  keys[code] = value;
    }
  }

  onkeydown = setKeyState(1);
  onkeyup = setKeyState(0);
}

// vim: fdm=marker:et:sw=2:
