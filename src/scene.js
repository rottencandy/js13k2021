import { CamLookAt } from './global-state';
import { Translate } from './math';
import { parseLevel } from './levels';
import { render as  renderPlayer } from './player';
import { render as  renderPlatform, setLevel } from './platform';
import { render as  renderBackdrop } from './backdrop';

export const loadLevel = (data) => {
  // TODO: move cam so the full level is visible
  CamLookAt([100, 200, 300], [0, 0, 0]);
  setLevel(parseLevel(data));
};

let worldMat = Translate(10, 0, 10);
export const render = (delta) => {
  renderBackdrop();
  renderPlayer(delta, worldMat);
  renderPlatform(delta, worldMat);
}

// vim: fdm=marker:et:sw=2:
