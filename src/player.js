import { createSM, enumArray } from './engine/state';
import { S_LEVEL_LOADED, S_CUBE_MOVE_STARTED, S_CUBE_MOVE_ENDED, S_LEVEL_STARTED, S_LEVEL_SOLVED, emitSignal, watchSignal } from './engine/observer';
import { createInterp } from './engine/lerp';
import { GL_FLOAT } from './engine/gl-constants';
import { Identity, Multiply, Translate, RotateX, RotateZ, Vec3, V3Add } from './math';
import { cube, plane } from './shape';
import { PI, isOdd } from './util';
import { createPipeline, CamMat, drawArrays } from './global-state';
import { vertex, cubeFragment, faceFragment, renaming } from './player.glslx';
import { PLATFORM_SIZE } from './globals';
import { playCubeSound } from './sound';

// {{{ Init

export let Pos = Vec3(0, 0, 0);

// angle of rotation(if cube is currently rotating)
const tweenedAngle = createInterp(0, PI / 2, 0.4);
// movement direction vector(if cube is currently moving)
let movementDirection = 0;

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
    [renaming.aPos]: [2, GL_FLOAT, 16],
    [renaming.aNorm]: [2, GL_FLOAT, 16, 8],
  },
  plane(PLATFORM_SIZE)
);

const uMatrix = getCubeUniform(renaming.uMat);
const uModel = getCubeUniform(renaming.uModel);
const uLightPos = getCubeUniform(renaming.uLightPos);
const uFaceMatrix = getFaceUniform(renaming.uMat);
const uFaceModel = getFaceUniform(renaming.uModel);
const uFaceLightPos = getFaceUniform(renaming.uLightPos);

const draw = drawArrays();

// }}}

// {{{ Update

const [UNRENDERED, IDLE, MOVING, END_ANIM] = enumArray(4);

const [step, override] = createSM({
  [IDLE]: () => {
    const moveDir = watchSignal(S_CUBE_MOVE_STARTED);
    if (moveDir) {
      movementDirection = moveDir;
      return MOVING;
    }
  },
  [UNRENDERED]: () => {
    if (watchSignal(S_LEVEL_STARTED)) {
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
      emitSignal(S_CUBE_MOVE_ENDED, Pos);
      playCubeSound();
      return IDLE;
    }
  },
  [END_ANIM]: () => {
    return UNRENDERED;
  }
});

// }}}

// Handle signals {{{

const observeSignals = () => {
  const startPos = watchSignal(S_LEVEL_LOADED);
  if (startPos) {
    [Pos, skipIntro] = startPos;
    resetRotations();
    override(skipIntro ? IDLE : UNRENDERED);
  }

  if (watchSignal(S_LEVEL_SOLVED)) {
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

const resetRotations = () => {
  rotationStack = Identity();
  inXStrip = true;
  stripPos = 0;
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
// const isFaceDown = () => ABS(stripPos) === 2

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
const initialFaceTransform = Multiply(Translate(0, PLATFORM_SIZE, PLATFORM_SIZE), RotateX(-PI / 2));

export const render = (delta, worldMat, paused) => {
  observeSignals();

  const currentState = step(delta, paused);
  if (currentState === UNRENDERED) {
    return;
  }

  const localMat = Multiply(Translate(Pos[0] * PLATFORM_SIZE, PLATFORM_SIZE / 2, Pos[2] * PLATFORM_SIZE), getRotationMat());
  const modelViewMat = Multiply(CamMat(), worldMat, localMat);
  //inverse transpose is required to fix uWorldMat when transformations are done
  //const inverseMVMat = Transpose(Inverse(modelViewMat));

  useCube();
  uMatrix.m4fv(false, modelViewMat);
  uModel.m4fv(false, localMat);
  uLightPos.u3f(0.5, 0.7, 1.0);
  draw(6 * 6);

  useFace();
  uFaceMatrix.m4fv(false, Multiply(modelViewMat, initialFaceTransform));
  uFaceModel.m4fv(false, localMat);
  uFaceLightPos.u3f(0.5, 0.7, 1.0);
  draw(6);
}

// }}}

// vim: fdm=marker:et:sw=2:
