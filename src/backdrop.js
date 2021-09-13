import { createInterp } from './engine/lerp';
import { GL_FLOAT } from './engine/gl-constants';
import { watchSignal, S_LEVEL_END_ANIM_PLAYED, S_LEVEL_SOLVED } from './engine/observer';
import { Multiply, Scale, Translate } from './math';
import { plane } from './shape';
import { ASPECT } from './globals';
import { createPipeline, drawArrays, CamMat } from './global-state';
import { i2rgb } from './util';
import { vertex, colorFragment, renaming } from './backdrop.glslx';

// {{{ Init

let color = i2rgb(.505040);
// tweened rgb values
// This was done in the last minute
// and there are most certainly better ways to do this
let twR = createInterp(0, .50, 1),
twG = createInterp(0, .50, 1),
twB = createInterp(0, .40, 1);

// }}}

// setup GL state {{{

const [use, getUniform] = createPipeline(
  vertex,
  colorFragment,
  { [renaming.aPos]: [3, GL_FLOAT, 24] },
  plane(50),
);
const uMat = getUniform(renaming.uMat);
const uColor = getUniform(renaming.uColor);
const uTime = getUniform(renaming.uTime);
const uAspect = getUniform(renaming.uAspect);

const draw = drawArrays();

// }}}

// signals {{{

const observeSignals = () => {
  if (watchSignal(S_LEVEL_END_ANIM_PLAYED)) {
    color = i2rgb(.505040);
  }
  if (watchSignal(S_LEVEL_SOLVED)) {
    const [r, g, b] = watchSignal(S_LEVEL_SOLVED);
    twR = createInterp(color[0], r, 2);
    twG = createInterp(color[1], g, 2);
    twB = createInterp(color[2], b, 2);
  }
};

// }}}

// {{{ Render

const mat = Multiply(Scale(40, 1, 25), Translate(-20, -51, -20));

export const render = (dt, t) => {
  observeSignals();

  const doner = twR[0](dt);
  const doneg = twG[0](dt);
  const doneb = twB[0](dt);
  if (!(doner && doneg && doneb)) {
    color = [twR[1](), twG[1](), twB[1]()];
  }

  use();

  uTime.u1f(t);
  uAspect.u1f(ASPECT);
  uColor.u3f(...color);
  uMat.m4fv(false, Multiply(CamMat(), mat));

  draw(6);
}

// }}}

// vim: fdm=marker:et:sw=2:
