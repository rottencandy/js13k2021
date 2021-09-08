import { createSM, enumArray } from './engine/state';
import { GL_FLOAT } from './engine/gl-constants';
import { createInterp } from './engine/lerp';
import { Keys, dirKeysPressed } from './engine/input';
import { S_EDIT_FINISHED, S_LEVEL_STARTED, S_LEVEL_ENDED, S_LEVEL_SOLVED, S_CUBE_MOVE_ENDED, watchSignal, emitSignal } from './engine/observer';
import { getInputVector } from './input';
import { START, GAP, PLATFORM_CODE, PLATFORM_DATA, nextPlatform } from './platform-types';
import { Multiply, Translate, Scale, Vec3, V3Add } from './math';
import { cube } from './shape';
import { createPipeline, CamMat, drawArrays, repositionCamera } from './global-state';
import { vertex, colorFragment, selVertex, editorSelectorFragment, renaming } from './platform.glslx';
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

const [use, getUniform] = createPipeline(
  vertex,
  colorFragment,
  {
    [renaming.aPos]: [3, GL_FLOAT, 24],
    [renaming.aNorm]: [3, GL_FLOAT, 24, 12],
  },
  cube(PLATFORM_SIZE),
);

const [useSelector, getSelectorUniform] = createPipeline(
  selVertex,
  editorSelectorFragment,
  {
    [renaming.aPos]: [3, GL_FLOAT, 24],
  },
  cube(PLATFORM_SIZE),
);

const uMatrix = getUniform(renaming.uMat);
const uModel = getUniform(renaming.uModel);
const uColor = getUniform(renaming.uColor);
const uLightPos = getUniform(renaming.uLightPos);
const uGridPos = getUniform(renaming.uGridPos);

const uSelMatrix = getSelectorUniform(renaming.uMat);
const uSelModel = getSelectorUniform(renaming.uModel);
const uSelGridPos = getSelectorUniform(renaming.uGridPos);

const draw = drawArrays();

// }}}

// Util {{{

export const resetEditor = () => {
  PlatformData = [[[PLATFORM_DATA[START](), START]]];
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

const [INIT, MOVING, MOVING_CAM, MOVED, IDLE] = enumArray(5);
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

  [MOVING_CAM]: (delta) => {
  },

  [MOVED]: () => {
    if (!dirKeysPressed() && !Keys.space) {
      return IDLE;
    }
  },
});

// }}}

// {{{ Render

const localPlatformsMat = Scale(1, 0.2, 1);
const selectorMat = Translate(0, 0.5, 0);

export const updateEditor = (delta, paused) => {
  if (watchSignal(S_EDIT_FINISHED)) {
    setAndShowInput(encodeLevel(PlatformData));
  }

  step(delta, paused);

  const mat = Multiply(CamMat(), localPlatformsMat);
  use();
  uMatrix.m4fv(false, mat);
  uModel.m4fv(false, localPlatformsMat);
  uLightPos.u3f(0.5, 0.7, 1.0);

  PlatformData.map((rows, y) => rows.map(([p], x) => {
    const color = p[0]();
    uColor.u4f(...color);
    uGridPos.u3f(x, 0, y, 1);
    draw(6 * 6);
  }));

  useSelector();
  uSelMatrix.m4fv(false, mat);
  uSelModel.m4fv(false, selectorMat);
  uSelGridPos.u3f(SelectorPos[0], 0, SelectorPos[2], 1);
  draw(6);

}

// }}}

// vim: fdm=marker:et:sw=2:
