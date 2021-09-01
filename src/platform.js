import { createSM, enumArray } from './engine/state';
import { GL_FLOAT } from './engine/gl-constants';
import { lerp } from './engine/lerp';
import { SIGNAL_LEVEL_LOADED, SIGNAL_LEVEL_STARTED, SIGNAL_CUBE_MOVE_ENDED, watchSignal, emitSignal } from './engine/observer';
import { START, PLATFORM_DATA } from './platform-types';
import { Multiply, Scale, Translate, Vec3, V3Add } from './math';
import { cube } from './shape';
import { createPipeline, CamMat, drawArrays } from './global-state';
import { vertex, colorFragment, renaming } from './platform.glslx';
import { PLATFORM_SIZE } from './globals';

// {{{ Init

let currentState;
let LoadedLevel = [];
let resetPlatform = false;
let platformInitialHeight;
export const setLevel = (l) => { LoadedLevel = l; resetPlatform = true };

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

const uMatrix = getUniform(renaming.uMat);
const uModel = getUniform(renaming.uModel);
const uGridPos = getUniform(renaming.uGridPos);
const uColor = getUniform(renaming.uColor);
const uLightPos = getUniform(renaming.uLightPos);

const draw = drawArrays();

// }}}

// Util {{{

export const canMoveTo = (curPos, moveDir) => {
  // make player unresponsive if scene is animating
  if(currentState === ANIMATING) {
    return false;
  }
  const [x, , z] = V3Add(curPos, moveDir);
  // usual out of grid bounds check
  if (x < 0 || z < 0 || x >= LoadedLevel[0].length || z >= LoadedLevel.length) {
    return false;
  }
  // check if tile can be stepped on
  return PLATFORM_DATA[LoadedLevel[z][x]][2];
};

// }}}

// {{{ Update

const [INIT, ANIMATING, UPDATE, END] = enumArray(4);
const [step, override] = createSM({
  [INIT]: () => {
  let startPos = [0, 0];
    LoadedLevel.map((rows, z) => {
      const x = rows.indexOf(START);
      if (x !== -1) {
        startPos = Vec3(x, 0, z);
      }
    });
    platformInitialHeight = 0;
    emitSignal(SIGNAL_LEVEL_LOADED, startPos);
    return ANIMATING;
  },
  [ANIMATING]: (delta) => {
    [platformInitialHeight, done] = lerp(platformInitialHeight, 0.5, delta);
    if (done) {
      emitSignal(SIGNAL_LEVEL_STARTED);
      return UPDATE;
    }
  },
  [UPDATE]: (_delta) => {
    // check if cube has moved
    const p = watchSignal(SIGNAL_CUBE_MOVE_ENDED);
    if (p) {
      const [x, , z] = p;
      const platform = LoadedLevel[z][x];
      // run onstep handler
      PLATFORM_DATA[platform][1]();
    }
  },
  [END]: () => {},
});

// }}}

// {{{ Render

export const render = (delta, worldMat) => {
  if (resetPlatform) {
    override(INIT);
    resetPlatform = false;
  }
  currentState = step(delta);

  use();
  const localMat = Scale(1, platformInitialHeight, 1);
  uMatrix.m4fv(false, Multiply(CamMat(), worldMat, localMat));
  uModel.m4fv(false, localMat);
  uLightPos.u3f(0.5, 0.7, 1.0);

  LoadedLevel.map((rows, y) => rows.map((p, x) => {
    const [color] = PLATFORM_DATA[p];
    uColor.u4f(...color);
    uGridPos.u3f(x, 0, y, 1);
    draw(6 * 6);
  }));

}

// }}}

// vim: fdm=marker:et:sw=2:
