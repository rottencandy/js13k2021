import { createSM, stateArray } from './engine/state';
import { Keys, dirKeysPressed } from './engine/input';
import { SIGNAL_CUBE_MOVED, emitSignal } from './engine/observer';
import { lerp } from './engine/lerp';
import { GL_FLOAT } from './engine/gl-constants';
import { Identity, Multiply, Translate, RotateX, RotateZ, Vec3, V3Add } from './math';
import { cube, plane } from './shape';
import { compose, PI, isOdd } from './util';
import { CamMat, createShaderProg, createBuffer, drawArrays } from './global-state';
import { vertex, cubeFragment, faceFragment, renaming } from './player.glslx';
import { U_LIGHT_POS } from './globals';

// {{{ Init

let Pos = Vec3(0, 0, 0);
const SIZE = 50;

// [x, y, z] direction vectors for move state
const [UP, DOWN, LEFT, RIGHT] = [Vec3(0, 0, -1), Vec3(0, 0, 1), Vec3(-1, 0, 0), Vec3(1, 0, 0)];
let moveDir;
let rotateAngle = 0;

// }}}

// {{{ GL state setup

const A_VERTEX_POS = 'aPos',
A_NORMAL_POS = 'aNorm',
U_MATRIX = 'uMat',
U_MODEL = 'uModel';

const [, use, getUniform, attribLoc ] = createShaderProg(vertex, cubeFragment);
const [, useFace, getFaceUniform, faceAttribLoc ] = createShaderProg(vertex, faceFragment);

const [, , setCubeData, cubeAttribSetter ] = createBuffer();
const [, , setFaceData, faceAttribSetter ] = createBuffer();

const uMatrix = getUniform(renaming[U_MATRIX]);
const uModel = getUniform(renaming[U_MODEL]);
const uLightPos = getUniform(renaming[U_LIGHT_POS]);
const uFaceMatrix = getFaceUniform(renaming[U_MATRIX]);
const uFaceModel = getFaceUniform(renaming[U_MODEL]);
const uFaceLightPos = getFaceUniform(renaming[U_LIGHT_POS]);

const useAndSetCube = compose(
  cubeAttribSetter(attribLoc(renaming[A_NORMAL_POS]), 3, GL_FLOAT, 24, 12),
  cubeAttribSetter(attribLoc(renaming[A_VERTEX_POS]), 3, GL_FLOAT, 24),
  use,
);
const useAndSetFace = compose(
  faceAttribSetter(faceAttribLoc(renaming[A_NORMAL_POS]), 2, GL_FLOAT, 16, 8),
  faceAttribSetter(faceAttribLoc(renaming[A_VERTEX_POS]), 2, GL_FLOAT, 16),
  useFace,
);

setCubeData(cube(SIZE));
setFaceData(plane(SIZE));

const draw = drawArrays();

// }}}

// {{{ Update

const [IDLE, MOVING, MOVED] = stateArray(3);
const step = createSM({
  [IDLE]: () => {
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
      return MOVING;
    }
  },
  [MOVING]: (delta) => {
    [rotateAngle, moved] = lerp(rotateAngle, PI / 2, delta, 5);
    if (moved) {
      Pos = V3Add(Pos, moveDir);
      // +ve rotation is counter-clockwise, so invert z-axis amount
      addRotation(Vec3(moveDir[2], 0, -moveDir[0]));
      rotateAngle = moveDir = 0;
      emitSignal(SIGNAL_CUBE_MOVED, Pos);
      return MOVED;
    }
  },
  [MOVED]: () => {
    if(!dirKeysPressed()) return IDLE;
  },
});

let inXStrip = true;
// 0 -> 3 (4 vals)
let stripPos = 0;
// matrix that keeps track of all past rotations
let rotationStack = Identity();
const addRotation = (dir) => {
  const center = SIZE / 2, deg = PI / 2;
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

// }}}

// {{{ Render

const getRotationMat = () => {
  if (!moveDir) {
    return rotationStack;
  }

  // rot = rotation matrix
  // pre & post are only used if pivot point needs to be shifted
  let rot, pre, post;
  const [x,,z] = moveDir;

  // rotate left/right
  if (x) {
    rot = RotateZ(rotateAngle * -x);

    pre = Translate(-SIZE, 0, 0);
    post = Translate(SIZE, 0, 0);

    // rotate up/down
  } else {
    rot = RotateX(rotateAngle * z);

    pre = Translate(0, 0, -SIZE);
    post = Translate(0, 0, SIZE);
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

// align face with the cube
const initialFaceTransform = Multiply(Translate(0, SIZE, SIZE), RotateX(-PI / 2));

export const render = (delta, worldMat) => {
  step(delta);

  const localMat = Multiply(Translate(Pos[0] * SIZE, 0, Pos[2] * SIZE), getRotationMat());
  const modelViewMat = Multiply(CamMat(), worldMat, localMat);
  //inverse transpose is required to fix uWorldMat when transformations are done
  //const inverseMVMat = Transpose(Inverse(modelViewMat));

  useAndSetCube();
  uMatrix.m4fv(false, modelViewMat);
  uModel.m4fv(false, localMat);
  uLightPos.u3f(0.5, 0.7, 1.0);
  draw(6 * 6);

  useAndSetFace();
  uFaceMatrix.m4fv(false, Multiply(modelViewMat, initialFaceTransform));
  uFaceModel.m4fv(false, localMat);
  uFaceLightPos.u3f(0.5, 0.7, 1.0);
  draw(6);
}

// }}}

// vim: fdm=marker:et:sw=2:
