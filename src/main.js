'use strict'

import { init } from './init.js';
import { getById } from './util.js';

const canvas = getById('b');
init(canvas)
const ctx = canvas.getContext('2d');
ctx.fillRect(50, 50, 500, 500);

// vim: fdm=marker:et:sw=2:
