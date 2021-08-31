import { createSM, enumArray } from './engine/state';
import { GL_FLOAT } from './engine/gl-constants';
import { SIGNAL_START_LEVEL, SIGNAL_CUBE_MOVED, watchSignal, emitSignal } from './engine/observer';
import { START, PLATFORM_DATA } from './platform-types';
import { Multiply, Scale, Translate, Vec3 } from './math';
import { cube } from './shape';
import { createPipeline, CamMat, drawArrays } from './global-state';
import { vertex, colorFragment, renaming } from './platform.glslx';
import { PLATFORM_SIZE } from './globals';

// {{{ Init

let LoadedLevel = [];
export const setLevel = (l) => LoadedLevel = l;

// }}}

// setup GL state {{{

const [use, getUniform] = createPipeline(
  vertex,
  colorFragment,
  {
    [renaming.aPos]: [3, GL_FLOAT, 24],
    [renaming.aNorm]: [3, GL_FLOAT, 24, 12],
  },
  cube(PLATFORM_SIZE),
);

const uMatrix = getUniform(renaming.uMat);
const uModel = getUniform(renaming.uModel);
const uGridPos = getUniform(renaming.uGridPos);
const uColor = getUniform(renaming.uColor);
const uLightPos = getUniform(renaming.uLightPos);

const draw = drawArrays();

// }}}

// {{{ Update

const [INIT, UPDATE, END] = enumArray(3);
const [step] = createSM({
  [INIT]: () => {
  let startPos = [0, 0];
    LoadedLevel.map((rows, z) => {
      const x = rows.indexOf(START);
      if (x !== -1) {
        startPos = Vec3(x, 0, z);
        return;
      }
    });
    emitSignal(SIGNAL_START_LEVEL, startPos);
    return UPDATE;
  },
  [UPDATE]: (_delta) => {
    // check if cube has moved
    const p = watchSignal(SIGNAL_CUBE_MOVED);
    if (p) {
      // TODO: handle grid out of bounds
      const [x, , z] = p;
      const platform = LoadedLevel[z][x];
      // run onstep handler
      PLATFORM_DATA[platform][1]();
    }
  },
  [END]: () => {},
});

// }}}

// {{{ Render

const localMat = Multiply(Scale(1, 0.5, 1), Translate(0, -PLATFORM_SIZE, 0));

export const render = (delta, worldMat) => {
  step(delta);

  use();
  uMatrix.m4fv(false, Multiply(CamMat(), worldMat, localMat));
  uModel.m4fv(false, localMat);
  uLightPos.u3f(0.5, 0.7, 1.0);

  LoadedLevel.map((rows, y) => rows.map((p, x) => {
    const [color] = PLATFORM_DATA[p];
    uColor.u4f(...color);
    uGridPos.u3f(x, 0, y, 1);
    draw(6 * 6);
  }));

}

// }}}

// vim: fdm=marker:et:sw=2:
