import { Keys, dirKeysPressed } from './engine/input';
import { Vec3 } from './math';

const [UP, DOWN, LEFT, RIGHT] = [Vec3(0, 0, -1), Vec3(0, 0, 1), Vec3(-1, 0, 0), Vec3(1, 0, 0)];
let isAlreadyPressed = false;

export const getInputVector = () => {
  if (isAlreadyPressed) {
    if (!dirKeysPressed()) {
      isAlreadyPressed = false;
    }
    return;
  }
  let moveDir;
  if(dirKeysPressed()) {
    if(Keys.up) {
      moveDir = UP;
    }
    if(Keys.down) {
      moveDir = DOWN;
    }
    if(Keys.left) {
      moveDir = LEFT;
    }
    if(Keys.right) {
      moveDir = RIGHT;
    }
    isAlreadyPressed = true;
    return moveDir;
  }
};


// vim: fdm=marker:et:sw=2:
