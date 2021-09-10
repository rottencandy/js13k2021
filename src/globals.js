import { getById } from './util.js';

/** @type {HTMLCanvasElement} */
export let CANVAS = getById('b');
/** @type {HTMLCanvasElement} */
export let CANVAS2D = getById('c');
export const
  GAME_WIDTH = 640,
  GAME_HEIGHT = 360,
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
  setCanvas = (ele) => CANVAS = ele;

// vim: fdm=marker:et:sw=2:
