import { CamLookAt } from './global-state';
import { MAX, FLOOR, TAN } from './util';
import { FOV, PLATFORM_SIZE } from './globals';
import { Translate } from './math';
import { parseLevel } from './levels';
import { render as  renderPlayer } from './player';
import { render as  renderPlatform, setLevel } from './platform';
import { render as  renderBackdrop } from './backdrop';

export const loadLevel = (data) => {
  const levelData = parseLevel(data);
  setLevel(levelData);

  // calculate amount of required camera raise distance
  // so that the entire level is visible
  const rows = levelData.length;
  const cols = levelData[0].length;
  // calculate distance using whichever of {width/height} is larger
  const maxOrd = MAX(rows, cols);
  const base = FLOOR(maxOrd) * PLATFORM_SIZE / 2;
  const perpendicular = base / TAN(FOV / 2);
  // The +size * 3 and *3 is used for additional offset on top of required distance
  CamLookAt([base, perpendicular + PLATFORM_SIZE * 3, base * 3], [base, 0, base]);
};

let worldMat = Translate(10, 0, 10);
export const render = (delta) => {
  renderBackdrop();
  renderPlayer(delta, worldMat);
  renderPlatform(delta, worldMat);
}

// vim: fdm=marker:et:sw=2:
