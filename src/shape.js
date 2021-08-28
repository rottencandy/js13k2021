import { F32 } from './util';

/**
 * Creates a 2d plane. 6 vertices
 * Includes normals.
 *
 * @param {number} s size of cube
 * @return {Float32Array} dimensions
*/
export const plane = (s) => F32([
  0, 0,
  0, 1,
  s, s,
  0, 1,
  0, s,
  0, 1,
  0, 0,
  0, 1,
  s, 0,
  0, 1,
  s, s,
  0, 1,
]);

// stroke:
// [2 3]
// [0 1]
// 0 -> 3 -> 2, 0 -> 1 -> 3
/**
 * Creates a cube.
 * 6 * 6 vertices.
 * Includes normals.
 *
 * @param {number} s size of cube
 * @return {Float32Array} dimensions
 */
export const cube = (s) => F32([
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

export const absPlane = F32([
  -1,  1,
   1, -1,
   1,  1,
  -1,  1,
  -1, -1,
   1, -1,
]);

// vim: fdm=marker:et:sw=2:
