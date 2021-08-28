import { Camera } from './engine/cam.js';
import { createGLContext } from './engine/webgl.js';
import { CANVAS, FOV, ZNEAR, ZFAR } from './globals.js';
import { compose } from './util';

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

// vim: fdm=marker:et:sw=2:
