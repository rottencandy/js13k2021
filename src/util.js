const M = Math;

export const
  /** Alias for `document.getElementById()` */
  getById = (id) => document.getElementById(id),
  RAF = requestAnimationFrame,
  MIN = M.min,
  MAX = M.max,
  ABS = M.abs,
  SQRT = M.sqrt,
  PI = M.PI,
  SIN = M.sin,
  COS = M.cos,
  TAN = M.tan,
  isOdd = (x) => x % 2,
  F32 = (x) => new Float32Array(x),
  compose = (...fns) => (...args) => fns.reduceRight((res, fn) => [fn.call(0, ...res)], args)[0];

// vim: fdm=marker:et:sw=2:
