import { getById } from './util.js';

/** @type {HTMLCanvasElement} */
export let CANVAS = getById('b');
/** @type {HTMLCanvasElement} */
export let CANVAS2D = getById('c');
export const
  GAME_WIDTH = 1280,
  GAME_HEIGHT = 720,
  ASPECT = GAME_HEIGHT / GAME_WIDTH,
  FOV = 1.047,
  ZNEAR = 1,
  ZFAR = 2000,
  WIDTH = 'width',
  HEIGHT = 'height',
  STYLE = 'style',
  PLATFORM_SIZE = 50,
  LIGHT_POS = [.6, .9, .5],
  /** Set Canvas element */
  setCanvas = (ele) => CANVAS = ele,
  FaceColorMap = {
    // Main face color
    0: [.2, .7, .4, 1],
    // solved platform color
    1: [.4, .2, .1, 1],

    2: [.3, .6, .8, 1],
    3: [.8, .6, .4, 1],
  };

// vim: fdm=marker:et:sw=2:
