import { GL_FLOAT } from './engine/gl-constants';
import { absPlane } from './shape';
import { compose } from './util';
import { createShaderProg, createBuffer, drawArrays } from './global-state';
import { vertex, colorFragment, renaming } from './backdrop.glslx';

// {{{ Init


// }}}

// setup GL state {{{

const [, use, getUniform, attribLoc ] = createShaderProg(vertex, colorFragment);
const [, , setData, attribSetter ] = createBuffer();

const uLightPos = getUniform(renaming.uLightPos);

const useAndSet = compose(
  attribSetter(attribLoc(renaming.aPos), 2, GL_FLOAT),
  use
);

setData(absPlane);

const draw = drawArrays();

// }}}

// {{{ Update


// }}}

// {{{ Render

export const render = (_delta) => {

  useAndSet();

  draw(6);

}

// }}}

// vim: fdm=marker:et:sw=2:
