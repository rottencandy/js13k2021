const keys = {
  left: 0,
  right: 0,
  up: 0,
  down: 0,
  space: 0,
};

export const setupKeyListener = () => {
  const setKeyState = (value) => ({key: code}) => {
    switch (code) {
      case 'ArrowUp':
      case 'w':
      case 'z':
        keys.up = value;
        break;
      case 'ArrowDown':
      case 's':
        keys.down = value;
        break;
      case 'ArrowLeft':
      case 'a':
      case 'q':
        keys.left = value;
        break;
      case 'ArrowRight':
      case 'd':
        keys.right = value;
        break;
      case ' ':
        keys.space = value;
      //break;
      //default:
      //  keys[code] = value;
    }
  }

  onkeydown = setKeyState(1);
  onkeyup = setKeyState(0);

  return keys;
}

export const getKeys = () => keys;

// vim: fdm=marker:et:sw=2:
