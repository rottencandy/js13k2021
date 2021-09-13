import { createSM, enumArray } from './engine/state';
import {
  S_LEVEL_LOADED,
  S_CUBE_MOVE_STARTED,
  S_CUBE_MOVE_ENDED,
  S_LEVEL_STARTED,
  S_LEVEL_SOLVED,
  emitSignal,
  watchSignal
} from './engine/observer';
import { createInterp, EASEINELASTIC, EASEINQUINT } from './engine/lerp';
import { GL_FLOAT } from './engine/gl-constants';
import { Identity, Multiply, Translate, RotateX, RotateZ, Vec3, V3Add } from './math';
import { cube, plane } from './shape';
import { ABS, PI, isOdd } from './util';
import { createPipeline, CamMat, drawArrays } from './global-state';
import { vertex, cubeFragment, faceFragment, renaming } from './player.glslx';
import { PLATFORM_SIZE, LIGHT_POS, FaceColorMap } from './globals';
import { playCubeMoveSound, playCubeFallSound } from './sound';

// {{{ Init

export let Pos = Vec3(0, 0, 0);
let mainAreaPos = [0, 0, 0];
export const saveLastPos = () => mainAreaPos = [Pos[0], Pos[1], Pos[2]];
let baseHeight;
const baseColor = [.70, .62, .82];
let faceColor = baseColor;
let faceType = 0;
let faceColorCode;

// angle of rotation(if cube is currently rotating)
const tweenedAngle = createInterp(0, PI / 2, 0.25);
// movement direction vector(if cube is currently moving)
let movementDirection = 0;
// cube y pos for intro anim
let tweenedBaseHeight;

export const setFace = (type, color) => {
  if (type === 0) {
    faceColor = baseColor;
  } else {
    faceColor = FaceColorMap[color];
    faceColorCode = color;
  }
  faceType = type;
};
export const getFace = () => faceColorCode;

// }}}

// {{{ GL state setup

const [useCube, getCubeUniform] = createPipeline(
  vertex,
  cubeFragment,
  {
    [renaming.aPos]: [3, GL_FLOAT, 24],
    [renaming.aNorm]: [3, GL_FLOAT, 24, 12],
  },
  cube(PLATFORM_SIZE)
);
const [useFace, getFaceUniform] = createPipeline(
  vertex,
  faceFragment,
  {
    [renaming.aPos]: [3, GL_FLOAT, 24],
    [renaming.aNorm]: [3, GL_FLOAT, 24, 12],
  },
  plane(PLATFORM_SIZE)
);

const uMatrix = getCubeUniform(renaming.uMat);
const uModel = getCubeUniform(renaming.uModel);
const uLightPos = getCubeUniform(renaming.uLightPos);

const uFaceMatrix = getFaceUniform(renaming.uMat);
const uFaceModel = getFaceUniform(renaming.uModel);
const uFaceLightPos = getFaceUniform(renaming.uLightPos);
const uColor = getFaceUniform(renaming.uColor);
const uFaceType = getFaceUniform(renaming.uFaceType);
const uTime = getFaceUniform(renaming.uTime);

const draw = drawArrays();

// }}}

// {{{ Update

const [OUTSIDE_SCREEN, START_ANIM, IDLE, MOVING, END_ANIM] = enumArray(5);

const [step, override] = createSM({
  [IDLE]: () => {
    const moveDir = watchSignal(S_CUBE_MOVE_STARTED);
    if (moveDir) {
      movementDirection = moveDir;
      return MOVING;
    }
  },
  [OUTSIDE_SCREEN]: () => {
    if (watchSignal(S_LEVEL_STARTED)) {
      tweenedBaseHeight = createInterp(200, PLATFORM_SIZE / 2, 1.2, EASEINELASTIC);
      playCubeFallSound();
      return START_ANIM;
    }
  },
  [START_ANIM]: (dt) => {
    const done = tweenedBaseHeight[0](dt);
    baseHeight = tweenedBaseHeight[1]();

    if (done) {
      return IDLE;
    }
  },
  [MOVING]: (delta, paused) => {
    const moved = paused?0:tweenedAngle[0](delta);
    if (moved) {
      Pos = V3Add(Pos, movementDirection);
      // +ve rotation is counter-clockwise, so invert z-axis amount
      addRotation(Vec3(movementDirection[2], 0, -movementDirection[0]));
      movementDirection = 0;
      tweenedAngle[2]();
      emitSignal(S_CUBE_MOVE_ENDED, [Pos, isFaceDown()]);
      playCubeMoveSound();
      return IDLE;
    }
  },
  [END_ANIM]: (dt) => {
    const done = tweenedBaseHeight[0](dt);
    baseHeight = tweenedBaseHeight[1]();

    if (done) {
      return OUTSIDE_SCREEN;
    }
  }
});

// }}}

// Handle signals {{{

const observeSignals = () => {
  const startPos = watchSignal(S_LEVEL_LOADED);
  if (startPos) {
    const [pos, isLevel, saveOldPos] = startPos;
    resetCubeState();
    override(isLevel ? OUTSIDE_SCREEN : IDLE);
    saveOldPos && saveLastPos();

    if (isLevel) {
      Pos = pos;
    } else {
      Pos = mainAreaPos;
    }
  }

  if (watchSignal(S_LEVEL_SOLVED)) {
    tweenedBaseHeight = createInterp(PLATFORM_SIZE / 2, 300, 1.5, EASEINQUINT);
    override(END_ANIM);
  }
};

// }}}

// Cube rotations {{{

let inXStrip = true;
// 0 -> 3 (4 vals)
let stripPos = 0;
// matrix that keeps track of all past rotations
let rotationStack = Identity();

const resetCubeState = () => {
  rotationStack = Identity();
  inXStrip = true;
  stripPos = 0;
  baseHeight = PLATFORM_SIZE / 2;
};

const addRotation = (dir) => {
  const center = PLATFORM_SIZE / 2, deg = PI / 2;
  // move obj to center, perform rotations by 90deg, and move back
  rotationStack = Multiply(
    Translate(center, center, center),
    Multiply(RotateX(dir[0] * deg), Identity()),
    Multiply(RotateZ(dir[2] * deg), Identity()),
    Translate(-center, -center, -center),
    rotationStack,
  );
  
  // value of whichever direction was moved ( -1 or 1 )
  const amt = (dir[0] || dir[2]);
  // Use remainder because we only need values from 0 -> 4 (PI)
  const nextPos = (stripPos + amt) % 4;

  // moved along currently occupied strip
  if (dir[2] && inXStrip || dir[0] && !inXStrip) {
    stripPos = nextPos;

    // moved along the other strip
  } else {
    // we only need to do something if the face was either at the top or bottom
    if(!isOdd(stripPos)) {
      stripPos = nextPos;
      inXStrip = !inXStrip;
    }
  }
};

const isFaceDown = () => ABS(stripPos) === 2

const getRotationMat = () => {
  if (!movementDirection) {
    return rotationStack;
  }

  // rot = rotation matrix
  // pre & post are only used if pivot point needs to be shifted
  let rot, pre, post;
  const [x,,z] = movementDirection;

  // rotate left/right
  if (x) {
    rot = RotateZ(tweenedAngle[1]() * -x);

    pre = Translate(-PLATFORM_SIZE, 0, 0);
    post = Translate(PLATFORM_SIZE, 0, 0);

    // rotate up/down
  } else {
    rot = RotateX(tweenedAngle[1]() * z);

    pre = Translate(0, 0, -PLATFORM_SIZE);
    post = Translate(0, 0, PLATFORM_SIZE);
  }

  // shifting pivot required if any of the angles is positive
  const changePivot = (x || z) > 0;
  if (changePivot) {
    return Multiply(post, rot, pre, rotationStack);
    // if not simply rotate
  } else {
    return Multiply(rot, rotationStack);
  }
};

// }}}

// {{{ Render

// align face with the cube
export const render = (delta, worldMat, t, paused) => {
  observeSignals();

  const currentState = step(delta, paused);
  if (currentState === OUTSIDE_SCREEN) {
    return;
  }

  const localMat = Multiply(Translate(Pos[0] * PLATFORM_SIZE, baseHeight, Pos[2] * PLATFORM_SIZE), getRotationMat());
  const modelViewMat = Multiply(CamMat(), worldMat, localMat);
  //inverse transpose is required to fix normals when transformations are done
  //const inverseMVMat = Transpose(Inverse(modelViewMat));

  useCube();
  uMatrix.m4fv(false, modelViewMat);
  uModel.m4fv(false, localMat);
  uLightPos.u3f(...LIGHT_POS);
  draw(6 * 5);

  useFace();
  uFaceMatrix.m4fv(false, modelViewMat);
  uFaceModel.m4fv(false, localMat);
  uFaceLightPos.u3f(...LIGHT_POS);
  uColor.u3f(...faceColor);
  uFaceType.u1i(faceType);
  uTime.u1f(t);
  draw(6);
}

// }}}

// vim: fdm=marker:et:sw=2:
