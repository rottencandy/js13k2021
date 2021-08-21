import { CamLookAt, clear } from './global-state';
import { Translate } from './math';
import { render as  renderPlayer } from './player';
import { render as  renderPlatform } from './platform';

let worldMat = Translate(10, 0, 10);
export const update = (delta) => {
  clear();
  CamLookAt([100, 200, 300], [0, 0, 0]);

  renderPlayer(delta, worldMat);
  renderPlatform(delta, worldMat);
}

// vim: fdm=marker:et:sw=2:
