import { Camera } from './engine/cam.js';
import { createGLContext } from './engine/webgl.js';
import { CANVAS, FOV, ZNEAR, ZFAR } from './globals.js';

export const [
  gl,
  clear,
  createShaderProg,
  createBuffer,
  drawArrays
] = createGLContext(CANVAS);

export const [CamMove, CamLookAt, CamMat] = Camera(FOV, CANVAS.clientWidth / CANVAS.clientHeight, ZNEAR, ZFAR);

// vim: fdm=marker:et:sw=2:
