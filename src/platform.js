import { GL_FLOAT } from './engine/gl-constants';
import { Multiply, Scale, Translate, Identity } from './math';
import { cube } from './shape';
import { compose } from './util';
import { CamMat, createShaderProg, createBuffer, drawArrays } from './global-state';
import { vertex, colorFragment, renaming } from './platform.glslx';

const V_VERTEX_POS = 'aVertexPos', V_MATRIX = 'uMatrix';

const [, use, getUniform, attribLoc ] = createShaderProg(vertex, colorFragment);
const [, , setData, attribSetter ] = createBuffer();

const uMatrix = getUniform(renaming[V_MATRIX]);
const useAndSet = compose(attribSetter(attribLoc(renaming[V_VERTEX_POS]), 3, GL_FLOAT, 24), use);
setData(cube(10));

const draw = drawArrays();

const localMat = Multiply(Translate(-250, 0, -250), Scale(50, 0, 50), Identity());

export const render = (_delta, worldMat) => {
  useAndSet();

  uMatrix.m4fv(false, Multiply(CamMat(), worldMat, localMat));
  draw(6 * 6);
}

// vim: fdm=marker:et:sw=2:
