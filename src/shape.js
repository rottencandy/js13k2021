/**
 * Creates a 2d plane. 6 vertices
 *
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @return {Float32Array} dimensions
*/
export const plane = (x, y, width, height) => {
  const x1 = x,
  x2 = x + width,
  y1 = y,
  y2 = y + height;

  return new Float32Array([
    x1, y1,
    x1, y2,
    x2, y1,
    x2, y1,
    x1, y2,
    x2, y2]);
}

// stroke:
// [0 1]
// [2 3]
// 0 -> 3 -> 1, 0 -> 2 -> 3
/**
 * Creates a cube.
 * 6 * 6 vertices.
 * @param {number} s size of cube
 */
export const cube = (s) => new Float32Array([
  // top face
  0, s, 0,
  s, s, s,
  s, s, 0,
  0, s, 0,
  0, s, s,
  s, s, s,
  // front face
  0, s, s,
  s, 0, s,
  s, s, s,
  0, s, s,
  0, 0, s,
  s, 0, s,
  // right face
  s, s, s,
  s, 0, 0,
  s, s, 0,
  s, s, s,
  s, 0, s,
  s, 0, 0,
  // left face
  0, s, 0,
  0, 0, s,
  0, s, s,
  0, s, 0,
  0, 0, 0,
  0, 0, s,
  // back face
  s, s, 0,
  0, 0, 0,
  0, s, 0,
  s, s, 0,
  s, 0, 0,
  0, 0, 0,
  // bottom face
  0, 0, s,
  s, 0, 0,
  s, 0, s,
  0, 0, s,
  0, 0, 0,
  s, 0, 0,
]);

// vim: fdm=marker:et:sw=2:
