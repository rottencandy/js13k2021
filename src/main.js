'use strict';

import './init.js';
import { startLoop } from './engine/loop';
import { createSM, stateArray } from './engine/state';
import { update as stepGame } from './game';

const [IN_GAME, IN_GUI] = stateArray(2);
const step = createSM({
  [IN_GAME]: (delta) => {
    stepGame(delta);
  },
  [IN_GUI]: () => {
  },
});

startLoop((delta) => {
  step(delta);
});

// vim: fdm=marker:et:sw=2:
