import { GL_FLOAT } from './engine/gl-constants';
import { absPlane } from './shape';
import { ASPECT } from './globals';
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
const uTime = getUniform(renaming.uTime);
const uAspect = getUniform(renaming.uAspect);

const draw = drawArrays();

// }}}

// {{{ Update


// }}}

// {{{ Render

export const render = (_delta, t) => {

  use();
  uTime.u1f(t);
  uAspect.u1f(ASPECT);

  draw(6);

}

// }}}

// vim: fdm=marker:et:sw=2:
