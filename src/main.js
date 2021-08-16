'use strict';

import './init.js';
import { startLoop } from './engine/loop.js';
import { createSM } from './engine/state.js';
import { update as stepGame } from './game.js';

const [IN_GAME, IN_GUI] = [0, 1];
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
