import { Multiply, Scale, Translate, Identity } from './math';
import { cube } from './shape';
import { compose } from './util';
import { Cam, createShaderProg, createBuffer, drawArrays } from './global-state';
import { vertex, colorFragment } from './platform.glslx';

const { use, getUniform, attribLoc } = createShaderProg(vertex, colorFragment);
const { setData, attribSetter } = createBuffer();

const uMatrix = getUniform('uMatrix');
const useAndSet = compose(attribSetter(attribLoc('aVertexPos'), 3), use);
setData(cube(10));

const draw = drawArrays();

const localMat = Multiply(Translate(-250, 0, -250), Scale(50, 0, 50), Identity());

export const render = (_delta, worldMat) => {
  useAndSet();

  uMatrix.m4fv(false, Multiply(Cam.getMat(), worldMat, localMat));
  draw(6 * 6);
}

// vim: fdm=marker:et:sw=2:
