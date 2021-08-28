import { GL_FLOAT } from './engine/gl-constants';
import { absPlane } from './shape';
import { createPipeline, drawArrays } from './global-state';
import { vertex, colorFragment, renaming } from './backdrop.glslx';

// {{{ Init


// }}}

// setup GL state {{{

const [use, getUniform] = createPipeline(
  vertex,
  colorFragment,
  { [renaming.aPos]: [2, GL_FLOAT] },
  absPlane
);
const uLightPos = getUniform(renaming.uLightPos);

const draw = drawArrays();

// }}}

// {{{ Update


// }}}

// {{{ Render

export const render = (_delta) => {

  use();

  draw(6);

}

// }}}

// vim: fdm=marker:et:sw=2:
