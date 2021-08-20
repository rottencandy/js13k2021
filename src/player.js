import { createSM, stateArray } from './engine/state';
import { Keys, dirKeysPressed } from './engine/input';
import { Multiply, Translate, Vec3, V3Add } from './math';
import { cube } from './shape';
import { compose } from './util';
import { CamMat, createShaderProg, createBuffer, drawArrays } from './global-state';
import { vertex, colorFragment, renaming } from './player.glslx';

let Pos = Vec3(0, 0, 0);
const SIZE = 50;
const V_VERTEX_POS = 'aVertexPos', V_MATRIX = 'uMatrix';

const [UP, DOWN, LEFT, RIGHT] = [Vec3(0, 0, -1), Vec3(0, 0, 1), Vec3(-1, 0, 0), Vec3(1, 0, 0)];
let moveDir;

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
  [MOVING]: () => {
    Pos = V3Add(Pos, moveDir);
    return MOVED;
  },
  [MOVED]: () => {
    if(!dirKeysPressed()) return IDLE;
  },
});

const [, use, getUniform, attribLoc ] = createShaderProg(vertex, colorFragment);
const [, , setData, attribSetter ] = createBuffer();

const uMatrix = getUniform(renaming[V_MATRIX]);
const useAndSet = compose(attribSetter(attribLoc(renaming[V_VERTEX_POS]), 3), use);
setData(cube(SIZE));

const draw = drawArrays();

export const render = (delta, worldMat) => {
  useAndSet();

  step(delta);

  uMatrix.m4fv(false, Multiply(CamMat(), worldMat, Translate(Pos[0] * SIZE, 0, Pos[2] * SIZE)));
  draw(6 * 6);
}

// vim: fdm=marker:et:sw=2:
