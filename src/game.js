import { Cam, clear } from './global-state';
import { cartesianCircle } from './math';
import { render as  renderPlayer } from './player';

let angle = 0;
export const update = (delta) => {
  clear();
  angle += 0.5 * delta;
  const [camX, camZ] = cartesianCircle(angle, 200);
  Cam.moveTo([camX, 100, camZ], [0, 0, 0]);

  renderPlayer(delta);
}

// vim: fdm=marker:et:sw=2:
