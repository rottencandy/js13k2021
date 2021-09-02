import { createSM, enumArray } from './engine/state';
import { GL_FLOAT } from './engine/gl-constants';
import { createInterp } from './engine/lerp';
import { SIGNAL_LEVEL_LOADED, SIGNAL_LEVEL_STARTED, SIGNAL_LEVEL_ENDED, SIGNAL_LEVEL_SOLVED, SIGNAL_CUBE_MOVE_ENDED, watchSignal, emitSignal } from './engine/observer';
import { START, PLATFORM_DATA } from './platform-types';
import { Multiply, Scale, Vec3, V3Add } from './math';
import { cube } from './shape';
import { createPipeline, CamMat, drawArrays } from './global-state';
import { vertex, colorFragment, renaming } from './platform.glslx';
import { PLATFORM_SIZE } from './globals';

// {{{ Init

let currentState;
let LoadedLevel = [];
let resetPlatform = false;
// TODO: Lerp should also work with negative values
let tweenedPlatformHeight;
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
  if(currentState === START_ANIM) {
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

const [INIT, START_ANIM, END_ANIM, UPDATE, END] = enumArray(5);
const [step, override] = createSM({
  [INIT]: () => {
  let startPos = [0, 0];
    LoadedLevel.map((rows, z) => {
      const x = rows.indexOf(START);
      if (x !== -1) {
        startPos = Vec3(x, 0, z);
      }
    });
    tweenedPlatformHeight = createInterp(0, 0.5, 1);
    emitSignal(SIGNAL_LEVEL_LOADED, startPos);
    return START_ANIM;
  },
  [START_ANIM]: (delta) => {
    const done = tweenedPlatformHeight[0](delta);
    if (done) {
      emitSignal(SIGNAL_LEVEL_STARTED);
      return UPDATE;
    }
  },
  [END_ANIM]: (delta) => {
    const done = tweenedPlatformHeight[0](delta);
    if (done) {
      emitSignal(SIGNAL_LEVEL_ENDED);
    }
  },
  [UPDATE]: (_delta) => {
    // check if cube has moved
    const p = watchSignal(SIGNAL_CUBE_MOVE_ENDED);
    if (p) {
      const [x, , z] = p;
      const platform = LoadedLevel[z][x];
      // run onstep handler, providing platform coordinates
      PLATFORM_DATA[platform][1](z, x);
    }
    // end if level is completed
    if (watchSignal(SIGNAL_LEVEL_SOLVED)) {
      tweenedPlatformHeight = createInterp(0.5, 0, 1);
      return END_ANIM;
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

  if (tweenedPlatformHeight[1]() > 0) {
    use();
    const localMat = Scale(1, tweenedPlatformHeight[1](), 1);
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

}

// }}}

// vim: fdm=marker:et:sw=2:
