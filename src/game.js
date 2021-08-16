import { Cam, clear, createShaderProg, createBuffer, drawArrays } from './global-state.js';
import { cube } from './shape.js';
import { cartesianCircle } from './math.js';
import { vertex, colorFragment } from './plat.glslx';

const { use, getUniform, attribLoc } = createShaderProg(vertex, colorFragment);
const { setData, attribSetter } = createBuffer();

const uMatrix = getUniform('uMatrix');
const setPosAttr = attribSetter(attribLoc('aVertexPos'), 3);
setData(cube(50));

const draw = drawArrays();

let angle = 0;
export const update = (_delta) => {
  clear();
  use();
  setPosAttr();

  angle += 0.01;
  const [camX, camZ] = cartesianCircle(angle, 200);
  Cam.moveTo([camX, 100, camZ], [0, 0, 0]);

  uMatrix.m4fv(false, Cam.getMat());

  draw(6 * 6);
}

// vim: fdm=marker:et:sw=2:
