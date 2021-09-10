import { createSM, enumArray } from './engine/state';
import { GL_FLOAT } from './engine/gl-constants';
import { createInterp } from './engine/lerp';
import {
  S_LEVEL_LOADED,
  S_LEVEL_STARTED,
  S_LEVEL_ENDED,
  S_LEVEL_SOLVED,
  S_LEVEL_RESET,
  S_CUBE_MOVE_ENDED,
  watchSignal,
  emitSignal
} from './engine/observer';
import { START, PLATFORM_DATA } from './platform-types';
import { Multiply, Scale, Vec3, V3Add } from './math';
import { cube, plane } from './shape';
import { createPipeline, CamMat, drawArrays } from './global-state';
import { vertex, sideFragment, faceFragment, renaming } from './platform.glslx';
import { PLATFORM_SIZE, LIGHT_POS } from './globals';

// {{{ Init

let currentState;
let PlatformData = [];
let rawLevelData = [];
let resetPlatform = false, enableIntroAnim = false;
let tweenedPlatformHeight;
export const setLevel = (l, isMain) => { rawLevelData = l; resetPlatform = true, enableIntroAnim = !isMain; };

// }}}

// setup GL state {{{

const [useSide, getSideUniform] = createPipeline(
  vertex,
  sideFragment,
  {
    [renaming.aPos]: [3, GL_FLOAT, 24],
    [renaming.aNorm]: [3, GL_FLOAT, 24, 12],
  },
  cube(PLATFORM_SIZE),
);
const [useFace, getFaceUniform] = createPipeline(
  vertex,
  faceFragment,
  {
    [renaming.aPos]: [3, GL_FLOAT, 24],
    //[renaming.aNorm]: [3, GL_FLOAT, 24, 12],
  },
  plane(PLATFORM_SIZE),
);

const uSideMatrix = getSideUniform(renaming.uMat);
const uFaceMatrix = getFaceUniform(renaming.uMat);

const uSideModel = getSideUniform(renaming.uModel);
const uFaceModel = getFaceUniform(renaming.uModel);

const uSideGridPos = getSideUniform(renaming.uGridPos);
const uFaceGridPos = getFaceUniform(renaming.uGridPos);

const uSideColor = getSideUniform(renaming.uColor);
const uFaceColor = getFaceUniform(renaming.uColor);

const uSideLightPos = getSideUniform(renaming.uLightPos);
const uFaceLightPos = getFaceUniform(renaming.uLightPos);

const uFaceType = getFaceUniform(renaming.uFaceType);
const uTime = getFaceUniform(renaming.uTime);

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
  if (x < 0 || z < 0 || x >= PlatformData[0].length || z >= PlatformData.length) {
    return false;
  }
  // check if tile can be stepped on
  return PlatformData[z][x][2]();
};

// }}}

// {{{ Update

const [INIT, START_ANIM, END_ANIM, UPDATE] = enumArray(4);
const [step, override] = createSM({
  // set load level data and reset player pos
  [INIT]: () => {
  let startPos = [0, 0];
    PlatformData = rawLevelData.map((rows, z) => {
      const cubeX = rows.indexOf(START);
      if (cubeX !== -1) {
        startPos = Vec3(cubeX, 0, z);
      }
      return rows.map((v, x) => PLATFORM_DATA[v](x, z));
    });

    // skip platform raise animation
    const initHeight = enableIntroAnim ? 0 : 0.5;
    tweenedPlatformHeight = createInterp(initHeight, 0.5, 1);
    emitSignal(S_LEVEL_LOADED, [startPos, enableIntroAnim]);
    return START_ANIM;
  },

  // start platforms raising anim
  [START_ANIM]: (delta, paused) => {
    const done = paused ? 0 : tweenedPlatformHeight[0](delta);
    if (done) {
      emitSignal(S_LEVEL_STARTED);
      return UPDATE;
    }
  },
  [END_ANIM]: (delta, paused) => {
    const done = paused ? 0 : tweenedPlatformHeight[0](delta);
    if (done) {
      emitSignal(S_LEVEL_ENDED);
    }
  },
  [UPDATE]: (_delta) => {
    // check if cube has moved
    const val = watchSignal(S_CUBE_MOVE_ENDED);
    if (val) {
      const [x, , z] = val[0];
      // run onstep handler, providing platform coordinates
      PlatformData[z][x][1](x, z, val[1]);
    }
    // end if level is completed
    if (watchSignal(S_LEVEL_SOLVED)) {
      tweenedPlatformHeight = createInterp(0.5, 0, 1);
      return END_ANIM;
    }
  },
});

// }}}

// {{{ Render

const renderPlatformSides = (rows, y) => rows.map((p, x) => {
  const color = p[0]();
  uSideColor.u4f(...color);
  uSideGridPos.u3f(x, 0, y, 1);
  draw(6 * 5);
});

const renderPlatformFaces = (rows, y) => rows.map((p, x) => {
  const color = p[0]();
  uFaceColor.u4f(...color);
  uFaceGridPos.u3f(x, 0, y, 1);
  uFaceType.u1i(p[3])
  draw(6);
});

export const render = (delta, worldMat, t, paused) => {
  if (resetPlatform || watchSignal(S_LEVEL_RESET)) {
    override(INIT);
    resetPlatform = false;
  }
  currentState = step(delta, paused);

  const platformHeight = tweenedPlatformHeight[1]();
  if (platformHeight > 0) {
    const localMat = Scale(1, platformHeight, 1);
    const transformMat = Multiply(CamMat(), worldMat, localMat);

    useSide();
    uSideMatrix.m4fv(false, transformMat);
    uSideModel.m4fv(false, localMat);
    uSideLightPos.u3f(...LIGHT_POS);

    PlatformData.map(renderPlatformSides);

    useFace();
    uFaceMatrix.m4fv(false, transformMat);
    uFaceModel.m4fv(false, localMat);
    uFaceLightPos.u3f(...LIGHT_POS);
    uTime.u1f(t);

    PlatformData.map(renderPlatformFaces);
  }

}

// }}}

// vim: fdm=marker:et:sw=2:
