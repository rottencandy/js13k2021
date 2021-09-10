import { PLATFORM_CODE, findCode, GAP } from './platform-types';

/*
 * Format: <cols>:(...[<num_platforms>]<platform_code>)
*/
export const LEVELS = {
  // main selection scene
  0: '6:ae2bec5bc5bge2bebc',

  1: '4:4ba2bd',
  2: '3:abc2bd',
};

// Parser {{{

export const parseLevel = (data) => {
  const [rowstr, platforms] = data.split(':');
  const rows = parseFloat(rowstr);

  // stores 1d array of all the decoded platforms
  const flatLevel = [];
  let numPrefixCount = 0;

  platforms.split('').map(s => {
    const maybeNum = parseFloat(s);
    if (maybeNum) {
      // if number, start counting
      numPrefixCount = numPrefixCount * 10 + maybeNum;
    } else {
      // push data x times
      // here we push atleast one for when count is already zero, or prefix isn't present
      // (also start counting from 1 to compensate for the initial push)
      flatLevel.push(PLATFORM_CODE[s]);
      for ( let i = 1; i++ < numPrefixCount; ) {
        flatLevel.push(PLATFORM_CODE[s]);
      }
      numPrefixCount = 0;
    }
  });

  // final level is stiched together using <rows> arrays for each col
  const finalLevel = [];
  let colCount = 0;
  let colArray = [];

  flatLevel.map(p => {
    colArray.push(p);
    if (++colCount === rows) {
      finalLevel.push(colArray);
      colCount = 0;
      colArray = [];
    }
  });

  return finalLevel;
};

// }}}

// Encoder {{{

// TODO: This fails for a 1x1 empty array
// NOTE: This modifies the passed array, but that's okay since we're done with it anyways
export const encodeLevel = (levelData) => {
  let rows = levelData.length - 1;
  let cols = levelData[0].length - 1;

  while (levelData[rows].every(([_, v]) => v === GAP)) {
    levelData.pop();
    rows--;
  }
  while (levelData[0].every(([_, v]) => v === GAP)) {
    levelData.shift();
    rows--;
  }

  while (levelData.every(r => r[cols][1] === GAP)) {
    levelData.map(r => r.pop());
    cols--;
  }
  while (levelData.every(r => r[0][1] === GAP)) {
    levelData.map(r => r.shift());
    cols--;
  }

  let flatData = [];
  levelData.map(r => flatData.push(...r));
  flatData = flatData.map(d => findCode(d[1]));

  let prevStr = flatData[0], count = 1, finalStr = '';
  for(let i = 1; i < flatData.length; i++) {
    const cur = flatData[i];
    if (cur !== prevStr) {
      finalStr += count === 1 ? prevStr : '' + count + prevStr;
      prevStr = cur;
      count = 1;
    } else {
      count++;
    }
  }
  finalStr += count === 1 ? prevStr : '' + count + prevStr;

  return '' + (cols + 1) + ':' + finalStr;
};

// }}}

// vim: fdm=marker:et:sw=2:
