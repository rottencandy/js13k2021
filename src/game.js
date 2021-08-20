import { Cam, clear } from './global-state';
import { Translate, cartesianCircle } from './math';
import { render as  renderPlayer } from './player';
import { render as  renderPlatform } from './platform';

let angle = 0;
let worldMat = Translate(10, 0, 10);
export const update = (delta) => {
  clear();
  angle += 0.1 * delta;
  const [camX, camZ] = cartesianCircle(angle, 500);
  Cam.moveTo([camX, 100, camZ], [0, 0, 0]);

  renderPlayer(delta, worldMat);
  renderPlatform(delta, worldMat);
}

// vim: fdm=marker:et:sw=2:
