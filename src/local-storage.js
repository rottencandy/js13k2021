const LS = localStorage;
const PREFIX = 'js-13fjo0&*^6@^&!}';

export const isLevelSolved = (num) => {
  return LS.getItem(PREFIX + num);
};

export const saveLevel = (num) => {
  LS.setItem(PREFIX + num, 1);
};

export const completedLevelsCount = () => {
  let i = 0;
  let count = 0;
  while (LS.getItem(PREFIX + ++i)) {count++}
  return count;
}

// vim: fdm=marker:et:sw=2:
