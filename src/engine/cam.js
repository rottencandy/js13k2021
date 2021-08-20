import { PerspectiveMat, LookAtMat, Multiply, Translate, Inverse } from '../math.js';

/** @callback Move
 * Move camera along XYZ
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @returns {void}
 */
/** @callback MoveTo
 * Move cam using absolute pos(lookAt)
 * @param {Array} pos
 * @param {Array} target
 * @param {Array} up
 * @returns {void}
 */
/** @callback GetMat
 * get view projection matrix
 * @returns {Float32Array}
 */
/**
 * Create webgl camera
 * NOTE: Use `moveTo` at least once before consuming view projection matrix.
 * This is required to initialize the view matrix properly
 * @param {number} fov - Field of View
 * @param {number} aspect - aspect ratio
 * @param {number} zNear - near limit
 * @param {number} zFar - far limit
 * @returns {[Move, MoveTo, GetMat]}
 */
export const Camera = (fov, aspect, zNear, zFar) => {
  let projectionMat = PerspectiveMat(fov, aspect, zNear, zFar);
  let viewMat;
  let viewProjectionMat;

  const calculateMat = () => {
    viewProjectionMat = Multiply(projectionMat, viewMat);
  };

  return [
    (x, y, z) => {
      viewMat = Multiply(Translate(-x, -y, -z), viewMat)
      calculateMat();
    },
    (pos, target, up = [0, 1, 0]) => {
      viewMat = Inverse(LookAtMat(pos, target, up));
      calculateMat();
    },
    () => viewProjectionMat,
  ];
};

// vim: fdm=marker:et:sw=2:
