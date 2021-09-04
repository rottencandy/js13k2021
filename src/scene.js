import { Keys, dirKeysPressed } from './engine/input';
import { SIGNAL_CUBE_MOVE_STARTED, emitSignal, watchSignal } from './engine/observer';
import { CamLookAt, CamMove } from './global-state';
import { MAX, FLOOR, SIN, COS, TAN } from './util';
import { FOV, PLATFORM_SIZE } from './globals';
import { Translate, Vec3 } from './math';
import { parseLevel } from './levels';
import { render as renderPlayer, Pos as playerPos } from './player';
import { render as renderPlatform, setLevel, canMoveTo } from './platform';
import { render as renderBackdrop } from './backdrop';

// Utils {{{

export const loadLevel = (data) => {
  const levelData = parseLevel(data);
  setLevel(levelData);

  // {{{ Calculate cam pos
  // calculate amount of required camera raise distance
  // so that the entire level is visible
  const rows = levelData.length;
  const cols = levelData[0].length;
  // calculate distance using whichever of {width/height} is larger
  const maxOrd = MAX(rows, cols);
  const base = FLOOR(maxOrd) * PLATFORM_SIZE / 2;
  const perpendicular = base / TAN(FOV / 2);
  // The +size * 3 and *3 is used for additional offset on top of minimum distance
  CamLookAt([base, perpendicular + PLATFORM_SIZE * 3, base * 3], [base, 0, base]);
  // }}}
};

const [UP, DOWN, LEFT, RIGHT] = [Vec3(0, 0, -1), Vec3(0, 0, 1), Vec3(-1, 0, 0), Vec3(1, 0, 0)];
let isAlreadyPressed = false;
const getInputVector = () => {
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

// }}}

// Loop {{{

let worldMat = Translate(10, 0, 10), t = 0;
export const render = (delta) => {
  // Check input {{{
  let moveDir = getInputVector();
  if (moveDir && canMoveTo(playerPos, moveDir)) {
    emitSignal(SIGNAL_CUBE_MOVE_STARTED, moveDir);
  }
  // }}}

  // {{{ light camera shake
  const speed = t / 100, amt = 20;
  CamMove(SIN(speed) / amt, COS(speed * 2) / amt, 0);
  // }}}

  renderBackdrop(delta, t);
  renderPlayer(delta, worldMat, moveDir);
  renderPlatform(delta, worldMat);

  t++;
}

// }}}

// vim: fdm=marker:et:sw=2:
