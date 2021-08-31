import { PLATFORM_CODE } from './platform-types';

/*
 * Format: <cols>:(...[<num_platforms>]<platform_code>)
*/
export const LEVELS = {
  // level selection scene
  0: '3:4ba2cbd',
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

// vim: fdm=marker:et:sw=2:
