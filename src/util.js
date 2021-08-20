const M = Math;

export const
  /** Alias for `document.getElementById()` */
  getById = (id) => document.getElementById(id),
  RAF = requestAnimationFrame,
  MIN = M.min,
  MAX = M.max,
  SQRT = M.sqrt,
  F32 = (x) => new Float32Array(x),
  PI = M.PI,
  SIN = M.sin,
  COS = M.cos,
  TAN = M.tan,
  compose = (...fns) => (...args) => fns.reduceRight((res, fn) => [fn.call(0, ...res)], args)[0];

// vim: fdm=marker:et:sw=2:
