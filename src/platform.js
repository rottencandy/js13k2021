import { GL_FLOAT } from './engine/gl-constants';
import { STATIC, GAP, platformData } from './platform-types';
import { Multiply, Scale, Translate } from './math';
import { cube } from './shape';
import { compose } from './util';
import { CamMat, createShaderProg, createBuffer, drawArrays } from './global-state';
import { vertex, colorFragment, renaming } from './platform.glslx';
import { U_LIGHT_POS } from './globals';

// {{{ Init

const V_VERTEX_POS = 'aPos',
A_NORMAL_POS = 'aNorm',
U_MATRIX = 'uMat',
U_MODEL = 'uModel';
U_COLOR = 'uColor',
U_GRID_POS = 'uGridPos',
SIZE = 50;

const level = [
  [STATIC, STATIC],
  [STATIC, GAP],
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
const uModel = getUniform(renaming[U_MODEL]);
const uGridPos = getUniform(renaming[U_GRID_POS]);
const uColor = getUniform(renaming[U_COLOR]);
const uLightPos = getUniform(renaming[U_LIGHT_POS]);
const useAndSet = compose(
  attribSetter(attribLoc(renaming[A_NORMAL_POS]), 3, GL_FLOAT, 24, 12),
  attribSetter(attribLoc(renaming[V_VERTEX_POS]), 3, GL_FLOAT, 24),
  use);
setData(cube(SIZE));

const draw = drawArrays();


export const render = (_delta, worldMat) => {
  useAndSet();
  uMatrix.m4fv(false, Multiply(CamMat(), worldMat, localMat));
  uModel.m4fv(false, localMat);
  uLightPos.u3f(0.5, 0.7, 1.0);

  level.map((rows, y) => rows.map((p, x) => {
    const [color] = platformData(p);
    uColor.u4f(...color);
    uGridPos.u3f(x, 0, y, 1);
    draw(6 * 6);
  }));

}

// }}}

// vim: fdm=marker:et:sw=2:
