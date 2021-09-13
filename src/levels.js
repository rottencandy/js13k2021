import { PLATFORM_CODE, findCode, GAP } from './platform-types';

/*
 * Format: <cols>:(...[<num_platforms>]<platform_code>)
*/
export const LEVELS = {
  // main selection scene
  0: '11:bebec2ebcbea3bc3bf2bg3bf2becebebebce2bcebcf4cf3cf2bcebcbec2bebc2bc2bce3b2c3bce2be3bf2bcebebebecebf3b:0',

  1: '7:4c4b2c2bd9ba12b3c4b:0',
  2: '5:b2cbc4bcb2cbca3bcb2cbd:0',
  3: '6:a2c4bc2bc5bcd',
  4: '5:cbcbd6bcbc2ba3bbcbcb:0',
  5: '5:2b2c2ba3bc2bcdcbc2b:0',
  6: '5:3bdcbhb3cba2b2cbh3c2bc:0',
  7: '4:2cbd2chca2bh2c2b2chb:0',
  8: '6:c3bhb2cb2cbda4b2cbhcb:0',
  9: '1:a',
  10: '1:a',
};

// Parser {{{

export const parseLevel = (data) => {
  const [rowstr, platforms, cubeFaceCode] = data.split(':');
  const rows = parseFloat(rowstr);
  const faceCode = parseFloat(cubeFaceCode);

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

  return [finalLevel, faceCode];
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
