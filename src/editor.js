import { createSM, enumArray } from './engine/state';
import { GL_FLOAT } from './engine/gl-constants';
import { createInterp } from './engine/lerp';
import { Keys, dirKeysPressed } from './engine/input';
import { S_EDIT_FINISHED, watchSignal } from './engine/observer';
import { getInputVector } from './input';
import { START, GAP, PLATFORM_DATA, nextPlatform } from './platform-types';
import { Multiply, Translate, Scale, V3Add } from './math';
import { plane } from './shape';
import { createPipeline, CamMat, drawArrays, repositionCamera } from './global-state';
import { vertex, faceFragment, selVertex, editorSelectorFragment, renaming } from './editor.glslx';
import { PLATFORM_SIZE } from './globals';
import { encodeLevel } from './levels';
import { getById } from './util';

// {{{ Init

// 2d array<[PLATFORM_DATA, code]>
// code is used to store backreference of the platform type
let PlatformData = [[[PLATFORM_DATA[START](), START]]];
let SelectorPos = [0, 0, 0];

let tweenedSelectorX, tweenedSelectorY;

// }}}

// setup GL state {{{

const [useFace, getFaceUniform] = createPipeline(
  vertex,
  faceFragment,
  {
    [renaming.aPos]: [3, GL_FLOAT, 24],
    //[renaming.aNorm]: [3, GL_FLOAT, 24, 12],
  },
  plane(PLATFORM_SIZE),
);

const [useSelector, getSelectorUniform] = createPipeline(
  selVertex,
  editorSelectorFragment,
  {
    [renaming.aPos]: [3, GL_FLOAT, 24],
  },
  plane(PLATFORM_SIZE),
);

const uFaceMatrix = getFaceUniform(renaming.uMat);

const uFaceGridPos = getFaceUniform(renaming.uGridPos);

const uFaceColor = getFaceUniform(renaming.uColor);


const uSelMatrix = getSelectorUniform(renaming.uMat);
const uSelGridPos = getSelectorUniform(renaming.uGridPos);

const draw = drawArrays();

// }}}

// Util {{{

export const resetEditor = () => {
  PlatformData = [[[PLATFORM_DATA[START](), START]]];
  repositionCamera(2, 2);
  SelectorPos = [0, 0, 0];
};

// If selector is out of bounds, enlarge the platform array
const recalculatePlatformArrayPos = () => {
  if (SelectorPos[0] >= PlatformData[0].length) {
    PlatformData.map(rows => rows.push([PLATFORM_DATA[GAP](), GAP]));
  }
  if (SelectorPos[0] < 0) {
    PlatformData.map(rows => rows.unshift([PLATFORM_DATA[GAP](), GAP]));
    SelectorPos[0] = 0;
  }
  if (SelectorPos[2] >= PlatformData.length) {
    PlatformData.push(PlatformData[0].map(() => [PLATFORM_DATA[GAP](), GAP]));
  }
  if (SelectorPos[2] < 0) {
    PlatformData.unshift(PlatformData[0].map(() => [PLATFORM_DATA[GAP](), GAP]));
    SelectorPos[2] = 0;
  }
  repositionCamera(PlatformData.length, PlatformData[0].length);
};

const cycleCurrentTile = () => {
  const current = PlatformData[SelectorPos[2]][SelectorPos[0]][1];
  next = nextPlatform(current);
  PlatformData[SelectorPos[2]][SelectorPos[0]] = [PLATFORM_DATA[next](), next];
};

const Inp = getById('e');
Inp.onclick = () => {
  Inp.select();
  document.execCommand('copy');
};
const setAndShowInput = (data) => {
  Inp.readonly = true;
  Inp.value = data;
  Inp.style.display = 'block';
};

// }}}

// {{{ Update

const [INIT, MOVING, MOVED, IDLE] = enumArray(5);
const [step] = createSM({
  // set load level data and reset player pos
  [INIT]: () => {

    return IDLE;
  },

  [IDLE]: (_delta) => {
    const moveDir = getInputVector();
    if (moveDir) {
      const newSelectorPos = V3Add(SelectorPos, moveDir);
      tweenedSelectorX = createInterp(SelectorPos[0], newSelectorPos[0], 0.3);
      tweenedSelectorY = createInterp(SelectorPos[2], newSelectorPos[2], 0.3);
      return MOVING;
    }
    if (Keys.space) {
      cycleCurrentTile();
      return MOVED;
    }

  },

  [MOVING]: (delta) => {
    const xdone = tweenedSelectorX[0](delta);
    const ydone = tweenedSelectorY[0](delta);
    SelectorPos[0] = tweenedSelectorX[1]();
    SelectorPos[2] = tweenedSelectorY[1]();
    if (xdone && ydone) {
      recalculatePlatformArrayPos();
      return MOVED;
    }
  },

  [MOVED]: () => {
    if (!dirKeysPressed() && !Keys.space) {
      return IDLE;
    }
  },
});

// }}}

// {{{ Render

const renderPlatformFaces = (rows, y) => rows.map(([p], x) => {
  const color = p[0]();
  uFaceColor.u4f(...color);
  uFaceGridPos.u3f(x, 0, y, 1);
  draw(6);
});

const localPlatformsMat = Scale(1, 0.2, 1);

export const updateEditor = (delta, paused) => {
  if (watchSignal(S_EDIT_FINISHED)) {
    setAndShowInput(encodeLevel(PlatformData));
  }

  step(delta, paused);

  const mat = Multiply(CamMat(), localPlatformsMat);

  useFace();
  uFaceMatrix.m4fv(false, mat);

  PlatformData.map(renderPlatformFaces);

  useSelector();
  uSelMatrix.m4fv(false, mat);
  uSelGridPos.u3f(SelectorPos[0], 0, SelectorPos[2], 1);
  draw(6);

}

// }}}

// vim: fdm=marker:et:sw=2:
