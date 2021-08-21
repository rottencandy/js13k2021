export const LINEAR = t => t;
export const EASEOUTQUAD = t => t * (2 - t);
export const EASEOUTQUINT = t => 1 + (--t) * t * t * t * t;
export const EASEINQUINT = t => t * t * t * t * t;
export const EASEINOUTCUBIC = t => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

export const createInterp = (from, to, t, duration, func = LINEAR) => {
  // t goes from 0 -> duration
  const difference = to - from;

  // check if interpolation is done
  if (t >= duration) {
    return [to, duration, true];

    // convert t into range 0 -> 1 and get lerped value
  } else {
    return [func(++t / duration) * difference, t, false];
  }
};

export const lerp = (from, to, delta, step = 1) => {
  if (from >= to) {
    return [to, true];
  } else {
    return [from += step * delta, false];
  }
};

// vim: fdm=marker:et:sw=2:
