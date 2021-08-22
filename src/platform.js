import { GL_FLOAT } from './engine/gl-constants';
import { Multiply, Scale, Translate, Identity } from './math';
import { cube } from './shape';
import { compose } from './util';
import { CamMat, createShaderProg, createBuffer, drawArrays } from './global-state';
import { vertex, colorFragment, renaming } from './platform.glslx';

// {{{ Init

const V_VERTEX_POS = 'aPos',
U_MATRIX = 'uMatrix',
U_COLOR = 'uColor',
U_GRID_POS = 'uGridPos',
SIZE = 50;

const level = [
  [0, 0],
  [0, 0],
];

// }}}

// {{{ Update

const localMat = Multiply(Scale(1, 0.5, 1), Translate(0, -SIZE, 0));

// }}}

// {{{ Render

// Setup GL state
const [, use, getUniform, attribLoc ] = createShaderProg(vertex, colorFragment);
const [, , setData, attribSetter ] = createBuffer();

const uMatrix = getUniform(renaming[U_MATRIX]);
const uGridPos = getUniform(renaming[U_GRID_POS]);
const uColor = getUniform(renaming[U_COLOR]);
const useAndSet = compose(attribSetter(attribLoc(renaming[V_VERTEX_POS]), 3, GL_FLOAT, 24), use);
setData(cube(SIZE));

const draw = drawArrays();


export const render = (_delta, worldMat) => {
  useAndSet();
  uMatrix.m4fv(false, Multiply(CamMat(), worldMat, localMat));
  uColor.u3f(0.0, 0.3, 0.7);

  level.map((rows, y) => rows.map((_tile, x) => {
    uGridPos.u3f(x, 0, y, 1);
    draw(6 * 6);
  }));

}

// }}}

// vim: fdm=marker:et:sw=2:
