import { m4 } from '../math.js';

/**
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
  let projectionMat = m4.persp(fov, aspect, zNear, zFar);
  let viewMat;
  let viewProjectionMat;

  const calculateMat = () => {
    viewProjectionMat = m4.multiply(projectionMat, viewMat);
  };

  return {
    move: (x, y, z) => {
      viewMat = m4.xlate(viewMat, -x, -y, -z);
      calculateMat();
    },
    moveTo: (pos, target, up) => {
      viewMat = m4.inverse(m4.lookAt(pos, target, up));
      calculateMat();
    },
    getMat: () => viewProjectionMat,
  };
};

// vim: fdm=marker:et:sw=2:
