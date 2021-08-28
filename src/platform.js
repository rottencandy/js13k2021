import { GL_FLOAT } from './engine/gl-constants';
import { SIGNAL_CUBE_MOVED, watchSignal } from './engine/observer';
import { STATIC, GAP, PLATFORM_DATA } from './platform-types';
import { Multiply, Scale, Translate } from './math';
import { cube } from './shape';
import { compose } from './util';
import { CamMat, createShaderProg, createBuffer, drawArrays } from './global-state';
import { vertex, colorFragment, renaming } from './platform.glslx';
import { PLATFORM_SIZE } from './globals';

// {{{ Init

const level = [
  [STATIC, STATIC],
  [STATIC, GAP],
];

// }}}

// setup GL state {{{

const [ use, getUniform, attribLoc ] = createShaderProg(vertex, colorFragment);
const [ setData, attribSetter ] = createBuffer();

const uMatrix = getUniform(renaming.uMat);
const uModel = getUniform(renaming.uModel);
const uGridPos = getUniform(renaming.uGridPos);
const uColor = getUniform(renaming.uColor);
const uLightPos = getUniform(renaming.uLightPos);

const useAndSet = compose(
  attribSetter(attribLoc(renaming.aNorm), 3, GL_FLOAT, 24, 12),
  attribSetter(attribLoc(renaming.aPos), 3, GL_FLOAT, 24),
  use);

setData(cube(PLATFORM_SIZE));

const draw = drawArrays();

// }}}

// {{{ Update

const localMat = Multiply(Scale(1, 0.5, 1), Translate(0, -PLATFORM_SIZE, 0));

// }}}

// {{{ Render

export const render = (_delta, worldMat) => {
  // check if cube has moved
  const p = watchSignal(SIGNAL_CUBE_MOVED);
  if(p) {
    // TODO: handle grid out of bounds
    const [x, , z] = p;
    const platform = level[z][x];
    // run onstep handler
    PLATFORM_DATA[platform][1]();
  }

  useAndSet();
  uMatrix.m4fv(false, Multiply(CamMat(), worldMat, localMat));
  uModel.m4fv(false, localMat);
  uLightPos.u3f(0.5, 0.7, 1.0);

  level.map((rows, y) => rows.map((p, x) => {
    const [color] = PLATFORM_DATA[p];
    uColor.u4f(...color);
    uGridPos.u3f(x, 0, y, 1);
    draw(6 * 6);
  }));

}

// }}}

// vim: fdm=marker:et:sw=2:
