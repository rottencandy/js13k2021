/**
 * Creates a 2d plane. 6 vertices
 *
 * @param {number} width
 * @param {number} height
 * @return {Float32Array} dimensions
*/
export const plane = (s) => new Float32Array([
  0, 0,
  s, s,
  0, s,
  0, 0,
  s, 0,
  s, s]);

// stroke:
// [2 3]
// [0 1]
// 0 -> 3 -> 2, 0 -> 1 -> 3
/**
 * Creates a cube.
 * 6 * 6 vertices.
 * @param {number} s size of cube
 */
export const cube = (s) => new Float32Array([
  // top face
  0, s, 0,
  0, 1, 0,
  s, s, s,
  0, 1, 0,
  s, s, 0,
  0, 1, 0,
  0, s, 0,
  0, 1, 0,
  0, s, s,
  0, 1, 0,
  s, s, s,
  0, 1, 0,
  // front face
  0, s, s,
  0, 0, 1,
  s, 0, s,
  0, 0, 1,
  s, s, s,
  0, 0, 1,
  0, s, s,
  0, 0, 1,
  0, 0, s,
  0, 0, 1,
  s, 0, s,
  0, 0, 1,
  // right face
  s, s, s,
  1, 0, 0,
  s, 0, 0,
  1, 0, 0,
  s, s, 0,
  1, 0, 0,
  s, s, s,
  1, 0, 0,
  s, 0, s,
  1, 0, 0,
  s, 0, 0,
  1, 0, 0,
  // left face
  0, s, 0,
  -1, 0, 0,
  0, 0, s,
  -1, 0, 0,
  0, s, s,
  -1, 0, 0,
  0, s, 0,
  -1, 0, 0,
  0, 0, 0,
  -1, 0, 0,
  0, 0, s,
  -1, 0, 0,
  // back face
  s, s, 0,
  0, 0, -1,
  0, 0, 0,
  0, 0, -1,
  0, s, 0,
  0, 0, -1,
  s, s, 0,
  0, 0, -1,
  s, 0, 0,
  0, 0, -1,
  0, 0, 0,
  0, 0, -1,
  // bottom face
  0, 0, s,
  0, -1, 0,
  s, 0, 0,
  0, -1, 0,
  s, 0, s,
  0, -1, 0,
  0, 0, s,
  0, -1, 0,
  0, 0, 0,
  0, -1, 0,
  s, 0, 0,
  0, -1, 0,
]);

// vim: fdm=marker:et:sw=2:
