import { S_CUBE_MOVE_STARTED, emitSignal, watchSignal } from './engine/observer';
import { CamMove, repositionCamera } from './global-state';
import { getInputVector } from './input';
import { SIN, COS } from './util';
import { parseLevel } from './levels';
import { render as renderPlayer, Pos as playerPos, setFace } from './player';
import { render as renderPlatform, setLevel, canMoveTo } from './platform';
//import { render as renderBackdrop } from './backdrop';
import { playInvalidMoveSound } from './sound';

// Utils {{{

export const loadLevel = (data, isMain = 0) => {
  const [levelData, faceCode] = parseLevel(data);
  setLevel(levelData, isMain, faceCode);

  repositionCamera(levelData.length, levelData[0].length);

  if (isMain) {
    setFace(0);
  } else {
    setFace(1, faceCode);
  }
};

// }}}

// Loop {{{

export const updateScene = (delta, paused) => {

  // Check input {{{
  if (!paused) {
    const moveDir = getInputVector();
    if (moveDir) {
      if (canMoveTo(playerPos, moveDir)) {
        emitSignal(S_CUBE_MOVE_STARTED, moveDir);
      } else {
        playInvalidMoveSound();
      }
    }
  }
  // }}}

  // {{{ camera shake
  const speed = t / 100, amt = 20;
  CamMove(SIN(speed) / amt, COS(speed * 2) / amt, 0);
  // }}}

  //renderBackdrop(delta, t, paused);
  renderPlayer(delta, t, paused);
  renderPlatform(delta, t, paused);

  t++;
}

// }}}

// vim: fdm=marker:et:sw=2:
