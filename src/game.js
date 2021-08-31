import { clear } from './global-state';
import { LEVELS } from './levels';
import { render, loadLevel } from './scene';

loadLevel(LEVELS[0]);

export const update = (delta) => {
  clear();
  render(delta);
}

// vim: fdm=marker:et:sw=2:
