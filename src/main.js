import './init.js';
import { startLoop } from './engine/loop';
import { signalStep } from './engine/observer';
import { update as stepGame } from './game';
import { update as stepGUI } from './gui';

startLoop((delta) => {
  stepGame(delta);
  stepGUI(delta);
  signalStep();
});

// vim: fdm=marker:et:sw=2:
