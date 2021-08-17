import { PerspectiveMat, LookAtMat, Multiply, Translate, Inverse } from '../math.js';

/**
 * Use webgl camera
 * NOTE: Use `moveTo` at least once before consuming view projection matrix.
 * This is required to initialize the view matrix properly
 * @typedef {Object} CamFns
 * @property {(x: number, y: number, z: number) => void} move - Move camera along XYZ
 * @property {(pos: Array, target: Array, up: Array) => void} moveTo - Move cam using absolute pos(lookAt)
 * @property {() => Float32Array} getMat - get view projection matrix
 */
/**
 * Create webgl camera
 * NOTE: Use `moveTo` at least once before consuming view projection matrix.
 * This is required to initialize the view matrix properly
 * @param {number} fov - Field of View
 * @param {number} aspect - aspect ratio
 * @param {number} zNear - near limit
 * @param {number} zFar - far limit
 * @returns {CamFns}
 */
export const Camera = (fov, aspect, zNear, zFar) => {
  let projectionMat = PerspectiveMat(fov, aspect, zNear, zFar);
  let viewMat;
  let viewProjectionMat;

  const calculateMat = () => {
    viewProjectionMat = Multiply(projectionMat, viewMat);
  };

  return {
    move: (x, y, z) => {
      viewMat = Multiply(Translate(-x, -y, -z), viewMat)
      calculateMat();
    },
    moveTo: (pos, target, up = [0, 1, 0]) => {
      viewMat = Inverse(LookAtMat(pos, target, up));
      calculateMat();
    },
    getMat: () => viewProjectionMat,
  };
};

// vim: fdm=marker:et:sw=2:
