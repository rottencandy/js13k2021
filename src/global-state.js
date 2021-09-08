import { Camera } from './engine/cam.js';
import { createGLContext } from './engine/webgl.js';
import { CANVAS, ZNEAR, ZFAR, PLATFORM_SIZE, FOV } from './globals.js';
import { compose, MAX, TAN } from './util';

export const [
  clear,
  createShaderProg,
  createBuffer,
  drawArrays
] = createGLContext(CANVAS);

export const createPipeline = (vs, fs, attribs, data) => {
  const [ use, getUniform, attribLoc ] = createShaderProg(vs, fs);
  const [ setData, attribSetter ] = createBuffer();

  setData(data);

  const attribSetters = Object.keys(attribs).map((attrib) =>
    attribSetter(attribLoc(attrib), ...attribs[attrib])
  );

  const useAndSet = compose(
    ...attribSetters,
    use,
  );

  return [useAndSet, getUniform];
};

export const [CamMove, CamLookAt, CamMat] = Camera(FOV, CANVAS.clientWidth / CANVAS.clientHeight, ZNEAR, ZFAR);

// calculate amount of required camera raise distance
// so that the entire level is visible
export const repositionCamera = (rows, cols) => {
  const maxOrd = MAX(rows, cols);
  const base = maxOrd * PLATFORM_SIZE / 2;
  const perpendicular = base / TAN(FOV / 2);
  // The +size * 3 and *3 is used for additional offset on top of minimum distance
  CamLookAt([base, perpendicular + PLATFORM_SIZE * 2, base * 2], [base, 0, base]);
};

// vim: fdm=marker:et:sw=2:
