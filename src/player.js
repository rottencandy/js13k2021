import { createSM, stateArray } from './engine/state';
import { Keys, dirKeysPressed } from './engine/input';
import { lerp } from './engine/lerp';
import { GL_FLOAT } from './engine/gl-constants';
import { Identity, Multiply, Translate, RotateX, RotateZ, Vec3, V3Add } from './math';
import { cube } from './shape';
import { compose } from './util';
import { CamMat, createShaderProg, createBuffer, drawArrays } from './global-state';
import { vertex, colorFragment, renaming } from './player.glslx';

let Pos = Vec3(0, 0, 0);
const SIZE = 50;
const V_VERTEX_POS = 'aVert',
V_NORMAL_POS = 'aNorm',
V_MATRIX = 'uMat',
V_MODEL = 'uModel',
V_LIGHT = 'uLightPos';

// [x, y] direction vectors for move state
const [UP, DOWN, LEFT, RIGHT] = [Vec3(0, 0, -1), Vec3(0, 0, 1), Vec3(-1, 0, 0), Vec3(1, 0, 0)];
let moveDir;
let rotateAngle = 0;

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
    [rotateAngle, moved] = lerp(rotateAngle, Math.PI / 2, delta, 2);
    if (moved) {
      rotateAngle = 0;
      Pos = V3Add(Pos, moveDir);
      moveDir = 0;
      return MOVED;
    }
  },
  [MOVED]: () => {
    if(!dirKeysPressed()) return IDLE;
  },
});

const [, use, getUniform, attribLoc ] = createShaderProg(vertex, colorFragment);
const [, , setData, attribSetter ] = createBuffer();

const uMatrix = getUniform(renaming[V_MATRIX]);
const uModel = getUniform(renaming[V_MODEL]);
const uLightPos = getUniform(renaming[V_LIGHT]);
const useAndSet = compose(
  attribSetter(attribLoc(renaming[V_NORMAL_POS]), 3, GL_FLOAT, 24, 12),
  attribSetter(attribLoc(renaming[V_VERTEX_POS]), 3, GL_FLOAT, 24),
  use
);
setData(cube(SIZE));

const getRotationMat = () => {
  if (!moveDir) {
    return Identity();
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
    return Multiply(post, rot, pre);
    // if not simply rotate
  } else {
    return rot;
  }
};

const draw = drawArrays();

export const render = (delta, worldMat) => {
  useAndSet();

  step(delta);

  const localMat = Multiply(Translate(Pos[0] * SIZE, 0, Pos[2] * SIZE), getRotationMat());
  const modelMat = Multiply(worldMat, localMat);
  //inverse transpose is required for uWorldMat when transformations are done
  //const inverseMVMat = Transpose(Inverse(modelViewMat));
  uMatrix.m4fv(false, Multiply(CamMat(), modelMat));
  uModel.m4fv(false, localMat);
  uLightPos.u3f(0.5, 0.7, 1.0);
  draw(6 * 6);
}

// vim: fdm=marker:et:sw=2:
