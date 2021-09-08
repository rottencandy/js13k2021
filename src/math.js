import { F32, SQRT, SIN, COS, TAN, PI } from './util.js';

// {{{ Matrix multiplication, inverse 

const m4xm4 = (inplace = 1) => (m1, m2) => {
  const m1_00 = m1[0 * 4 + 0];
  const m1_01 = m1[0 * 4 + 1];
  const m1_02 = m1[0 * 4 + 2];
  const m1_03 = m1[0 * 4 + 3];
  const m1_10 = m1[1 * 4 + 0];
  const m1_11 = m1[1 * 4 + 1];
  const m1_12 = m1[1 * 4 + 2];
  const m1_13 = m1[1 * 4 + 3];
  const m1_20 = m1[2 * 4 + 0];
  const m1_21 = m1[2 * 4 + 1];
  const m1_22 = m1[2 * 4 + 2];
  const m1_23 = m1[2 * 4 + 3];
  const m1_30 = m1[3 * 4 + 0];
  const m1_31 = m1[3 * 4 + 1];
  const m1_32 = m1[3 * 4 + 2];
  const m1_33 = m1[3 * 4 + 3];
  const m2_00 = m2[0 * 4 + 0];
  const m2_01 = m2[0 * 4 + 1];
  const m2_02 = m2[0 * 4 + 2];
  const m2_03 = m2[0 * 4 + 3];
  const m2_10 = m2[1 * 4 + 0];
  const m2_11 = m2[1 * 4 + 1];
  const m2_12 = m2[1 * 4 + 2];
  const m2_13 = m2[1 * 4 + 3];
  const m2_20 = m2[2 * 4 + 0];
  const m2_21 = m2[2 * 4 + 1];
  const m2_22 = m2[2 * 4 + 2];
  const m2_23 = m2[2 * 4 + 3];
  const m2_30 = m2[3 * 4 + 0];
  const m2_31 = m2[3 * 4 + 1];
  const m2_32 = m2[3 * 4 + 2];
  const m2_33 = m2[3 * 4 + 3];

  const result = inplace ? m1 : F32(16);

  result[0] =  m2_00 * m1_00 + m2_01 * m1_10 + m2_02 * m1_20 + m2_03 * m1_30;
  result[1] =  m2_00 * m1_01 + m2_01 * m1_11 + m2_02 * m1_21 + m2_03 * m1_31;
  result[2] =  m2_00 * m1_02 + m2_01 * m1_12 + m2_02 * m1_22 + m2_03 * m1_32;
  result[3] =  m2_00 * m1_03 + m2_01 * m1_13 + m2_02 * m1_23 + m2_03 * m1_33;
  result[4] =  m2_10 * m1_00 + m2_11 * m1_10 + m2_12 * m1_20 + m2_13 * m1_30;
  result[5] =  m2_10 * m1_01 + m2_11 * m1_11 + m2_12 * m1_21 + m2_13 * m1_31;
  result[6] =  m2_10 * m1_02 + m2_11 * m1_12 + m2_12 * m1_22 + m2_13 * m1_32;
  result[7] =  m2_10 * m1_03 + m2_11 * m1_13 + m2_12 * m1_23 + m2_13 * m1_33;
  result[8] =  m2_20 * m1_00 + m2_21 * m1_10 + m2_22 * m1_20 + m2_23 * m1_30;
  result[9] =  m2_20 * m1_01 + m2_21 * m1_11 + m2_22 * m1_21 + m2_23 * m1_31;
  result[10] = m2_20 * m1_02 + m2_21 * m1_12 + m2_22 * m1_22 + m2_23 * m1_32;
  result[11] = m2_20 * m1_03 + m2_21 * m1_13 + m2_22 * m1_23 + m2_23 * m1_33;
  result[12] = m2_30 * m1_00 + m2_31 * m1_10 + m2_32 * m1_20 + m2_33 * m1_30;
  result[13] = m2_30 * m1_01 + m2_31 * m1_11 + m2_32 * m1_21 + m2_33 * m1_31;
  result[14] = m2_30 * m1_02 + m2_31 * m1_12 + m2_32 * m1_22 + m2_33 * m1_32;
  result[15] = m2_30 * m1_03 + m2_31 * m1_13 + m2_32 * m1_23 + m2_33 * m1_33;

  return result;
};

export const Inverse = (m) => {
  const m00 = m[0 * 4 + 0];
  const m01 = m[0 * 4 + 1];
  const m02 = m[0 * 4 + 2];
  const m03 = m[0 * 4 + 3];
  const m10 = m[1 * 4 + 0];
  const m11 = m[1 * 4 + 1];
  const m12 = m[1 * 4 + 2];
  const m13 = m[1 * 4 + 3];
  const m20 = m[2 * 4 + 0];
  const m21 = m[2 * 4 + 1];
  const m22 = m[2 * 4 + 2];
  const m23 = m[2 * 4 + 3];
  const m30 = m[3 * 4 + 0];
  const m31 = m[3 * 4 + 1];
  const m32 = m[3 * 4 + 2];
  const m33 = m[3 * 4 + 3];
  const tmp_0  = m22 * m33;
  const tmp_1  = m32 * m23;
  const tmp_2  = m12 * m33;
  const tmp_3  = m32 * m13;
  const tmp_4  = m12 * m23;
  const tmp_5  = m22 * m13;
  const tmp_6  = m02 * m33;
  const tmp_7  = m32 * m03;
  const tmp_8  = m02 * m23;
  const tmp_9  = m22 * m03;
  const tmp_10 = m02 * m13;
  const tmp_11 = m12 * m03;
  const tmp_12 = m20 * m31;
  const tmp_13 = m30 * m21;
  const tmp_14 = m10 * m31;
  const tmp_15 = m30 * m11;
  const tmp_16 = m10 * m21;
  const tmp_17 = m20 * m11;
  const tmp_18 = m00 * m31;
  const tmp_19 = m30 * m01;
  const tmp_20 = m00 * m21;
  const tmp_21 = m20 * m01;
  const tmp_22 = m00 * m11;
  const tmp_23 = m10 * m01;

  const t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
    (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
  const t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
    (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
  const t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
    (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
  const t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
    (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

  const d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

  return F32([
    d * t0,
    d * t1,
    d * t2,
    d * t3,
    d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
      (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
    d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
      (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
    d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
      (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
    d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
      (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
    d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
      (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
    d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
      (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
    d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
      (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
    d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
      (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
    d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
      (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
    d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
      (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
    d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
      (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
    d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
      (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
  ]);
};

const multiplier = (inplace) => (...matrices) =>
  matrices.reduceRight((acc, m) => m4xm4(inplace)(m, acc));

export const Multiply = multiplier(0);
//export const MultiplyI = multiplier(1);

// }}}

// {{{ Matrix transformations

/** Identity matrix */
export const Identity = () => F32([
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
]);

export const Transpose = (m) => F32([
  m[0], m[4], m[8], m[12],
  m[1], m[5], m[9], m[13],
  m[2], m[6], m[10], m[14],
  m[3], m[7], m[11], m[15],
]);

export const Translate = (tx, ty, tz) => F32([
  1,  0,  0,  0,
  0,  1,  0,  0,
  0,  0,  1,  0,
  tx, ty, tz, 1,
]);

export const RotateX = (angleInRadians) => {
  var c = COS(angleInRadians);
  var s = SIN(angleInRadians);

  return F32([
    1,  0, 0, 0,
    0,  c, s, 0,
    0, -s, c, 0,
    0,  0, 0, 1,
  ]);
};

export const RotateY = (angleInRadians) => {
  var c = COS(angleInRadians);
  var s = SIN(angleInRadians);

  return F32([
    c, 0, -s, 0,
    0, 1,  0, 0,
    s, 0,  c, 0,
    0, 0,  0, 1,
  ]);
};

export const RotateZ = (angleInRadians) => {
  var c = COS(angleInRadians);
  var s = SIN(angleInRadians);

  return F32([
    c,  s, 0, 0,
    -s, c, 0, 0,
    0,  0, 1, 0,
    0,  0, 0, 1,
  ]);
};

export const Scale = (sx, sy, sz) => F32([
  sx, 0,  0,  0,
  0,  sy, 0,  0,
  0,  0,  sz, 0,
  0,  0,  0,  1,
]);

// }}}

// {{{ Vector transformations

export const Vec3 = (x, y, z) => [x, y, z];
export const V3Add = (v1, v2) => [
  v1[0] + v2[0],
  v1[1] + v2[1],
  v1[2] + v2[2]
];
export const V3Subtract = (v1, v2) => [
  v1[0] - v2[0], 
  v1[1] - v2[1], 
  v1[2] - v2[2]
];
export const V3Cross = (v1, v2) => [
  v1[1] * v2[2] - v1[2] * v2[1],
  v1[2] * v2[0] - v1[0] * v2[2],
  v1[0] * v2[1] - v1[1] * v2[0],
];
export const V3Normalize = (v) => {
  const length = SQRT(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  // make sure we don't divide by 0.
  if (length > 0.00001) {
    return [v[0] / length, v[1] / length, v[2] / length];
  } else {
    return [0, 0, 0];
  }
}
export const V3Multiply = (v, n) => v.map(x => x * n)

// }}}

// {{{ GL transformations

export const PerspectiveMat = (fov, aspect, near, far) => {
  const f = TAN(PI * 0.5 - 0.5 * fov);
  const rangeInv = 1.0 / (near - far);
  return F32([
    f / aspect, 0,               0,               0,
    0,          f,               0,               0,
    0,          0,   (near + far) * rangeInv,    -1,
    0,          0,   near * far * rangeInv * 2,   0,
  ]);
};

export const LookAtMat = (cameraPos, target, up) => {
  const zAxis = V3Normalize(V3Subtract(cameraPos, target));
  const xAxis = V3Normalize(V3Cross(up, zAxis));
  const yAxis = V3Normalize(V3Cross(zAxis, xAxis));

  return F32([
    xAxis[0], xAxis[1], xAxis[2], 0,
    yAxis[0], yAxis[1], yAxis[2], 0,
    zAxis[0], zAxis[1], zAxis[2], 0,
    cameraPos[0],
    cameraPos[1],
    cameraPos[2],
    1,
  ]);
};

// }}}

// {{{ Misc

/*
* Returns circle coordinates in cartesian form
*/
export const cartesianCircle = (angle, radius = 1) => [COS(angle) * radius, SIN(angle) * radius]

// }}}

// vim: fdm=marker:et:sw=2:
