import { GAME_WIDTH, GAME_HEIGHT } from './globals';
const M = Math;

export const
  /** Alias for `document.getElementById()` */
  getById = (id) => document.getElementById(id),
  deviceScaleRatio = () => MIN(innerWidth / GAME_WIDTH, innerHeight / GAME_HEIGHT),
  RAF = requestAnimationFrame,

  // Math aliases
  MIN = M.min,
  MAX = M.max,
  FLOOR = x => ~~x,
  ABS = M.abs,
  SQRT = M.sqrt,
  PI = M.PI,
  SIN = M.sin,
  COS = M.cos,
  TAN = M.tan,

  // collision detection
  AABB = (px, py, x1, y1, x2, y2) => px > x1 && px < x2 && py > y1 && py < y2,
  // identity
  Id = () => {},
  isOdd = (x) => x % 2,
  F32 = (x) => new Float32Array(x),

  // evil bit shifting to store rgb as a single int
  // where r, g, b are in the range [0, 1]
  rgb2i = (r, g, b) => r + g / 100 + b / 100_00,
  i2rgb = (i) => (r = (i *= 100) / 100, i %= 1, g = (i *= 100) / 100, i %= 1, b = (i *= 100) / 100, [r, g, b]),

  // FP utils
  compose = (...fns) => (...args) => fns.reduceRight((res, fn) => [fn.call(0, ...res)], args)[0];

// vim: fdm=marker:et:sw=2:
