// PUZZLE LEGEND
// 0: Empty slot
// 1: Ball
// 2: No slot

// emptyBoard is a function to ensure that a deep copy of the template is created then returned
// Also notice the format is puzzle[y][x], so no diagonal mirroring is necessary
const emptyBoard = () => {
  const puzzle = [
    new Uint8Array([2, 2, 0, 0, 0, 2, 2]),
    new Uint8Array([2, 2, 0, 0, 0, 2, 2]),
    new Uint8Array([0, 0, 0, 0, 0, 0, 0]),
    new Uint8Array([0, 0, 0, 0, 0, 0, 0]),
    new Uint8Array([0, 0, 0, 0, 0, 0, 0]),
    new Uint8Array([2, 2, 0, 0, 0, 2, 2]),
    new Uint8Array([2, 2, 0, 0, 0, 2, 2]),
  ];
  // https://stackoverflow.com/questions/21988909/is-it-possible-to-create-a-fixed-length-array-in-javascript
  Object.seal(puzzle);
  return puzzle;
};
const width = 7;
const height = 7;
const slotCount = 33;

const validMoveDeltas = [
  {
    name: 'right',
    x: 2,
    y: 0,
    middle: {
      x: 1,
      y: 0,
    },
  },
  {
    name: 'up',
    x: 0,
    y: -2,
    middle: {
      x: 0,
      y: -1,
    },
  },
  {
    name: 'left',
    x: -2,
    y: 0,
    middle: {
      x: -1,
      y: 0,
    },
  },
  {
    name: 'down',
    x: 0,
    y: 2,
    middle: {
      x: 0,
      y: 1,
    },
  },
];
const validMoveDeltaCount = 4;

// Currently-disused feature - meant to cull the size of the Sacred Timeline by culling puzzles
// that are the same but just rotated/flipped, and considering all 8 possible rotations/flips
// when testing for matches. This has the side effect of determining rotations/flips being
// computationally expensive both when generating the cache and checking solvability via
// requests in real time.
/*
const maxX = width - 1;
const maxY = width - 1;
const symmetries = {
  flipHoriz: (coords) => ({
    x: maxX - coords.x,
    y: coords.y,
  }),
  flipVert: (coords) => ({
    x: coords.x,
    y: maxY - coords.y,
  }),
  flipDiagPos: (coords) => ({
    x: coords.y,
    y: coords.x,
  }),
  flipDiagNeg: (coords) => ({
    x: maxY - coords.y,
    y: maxX - coords.x,
  }),
  rotate180: (coords) => ({
    x: maxX - coords.x,
    y: maxY - coords.y,
  }),
  rotate90counterClock: (coords) => ({
    x: coords.y,
    y: maxX - coords.x,
  }),
  rotate90clock: (coords) => ({
    x: maxY - coords.y,
    y: coords.x,
  }),
};
const symmetryKVPs = Object.entries(symmetries);
*/

// Create a cache of the expected max character lengths of codes of all possible bases namely,
// binary codes should be of length 33 (there are 33 slots and 0/1 is analogous to empty/ball),
// hexadecimal codes should be of length 9, and hexaTRIdecimal (Base36) codes should be of length 7.
// One use for this information is padding out raw base-x-converted numbers with leading zeroes
// such that all possible puzzles converted from analogous binary have the same minimal,
// common length for each base
const fullBoardCodeInt = parseInt('1'.repeat(slotCount), 2);
const codeLength = (base) => fullBoardCodeInt.toString(base).length;
const codeLengths = [];
for (let i = 2; i <= 36; i++) codeLengths[i] = codeLength(i);
const convertCodeBase = (code, from, to) => parseInt(code, from).toString(to).padStart(codeLengths[to], '0');
const defaultCodeBase = 16;

// These lengths can also be used to create a cache of RegExps which can be used to verify that
// the passed-in code matches the format of the given code base
// https://stackoverflow.com/questions/1779013/check-if-string-contains-only-digits
// https://www.sitepoint.com/using-regular-expressions-to-check-string-length/
// https://www.webtips.dev/webtips/javascript/javascript-create-regex-from-string-variable
const codeRegExps = [];
for (let i = 2; i <= 36; i++) codeRegExps[i] = new RegExp(`^[${'0123456789abcdefghijklmnopqrstuvwxyz'.slice(0, i)}]{${codeLengths[i]}}$`);
const isCode = (code, base = defaultCodeBase) => codeRegExps[base].test(code);

const isPuzzle = (obj) => {
  if (!obj) return false;
  const emptyBoardInst = emptyBoard();

  // Ensure there are rows
  if (!Array.isArray(obj)) return false;

  // Ensure there are the right number of rows
  const objLen = obj.length;
  if (objLen !== height) return false;

  for (let v = 0; v < objLen; v++) {
    // Ensure each "row" is actually a row
    const row = obj[v];
    if (!(row instanceof Uint8Array)) return false;

    // Ensure the row is the right length
    const rowLen = row.length;
    if (rowLen !== width) return false;

    // Ensure the contents of the row are valid numbers
    for (let u = 0; u < rowLen; u++) {
      const space = row[u];
      if (space !== 0 && space !== 1 && space !== 2) return false;
      // Also ensure that slot placement matches up
      if ((emptyBoardInst[v][u] === 2) !== (space === 2)) return false;
    }
  }

  return true;
};

const copyPuzzle = (puzzle) => {
  const puzzleCopy = [];
  for (let v = 0; v < height; v++) {
    puzzleCopy[v] = new Uint8Array(puzzle[v]);
  }
  Object.seal(puzzleCopy);
  return puzzleCopy;
};

// DOES NOT VALIDATE CODE BY ITSELF FOR PERFORMANCE REASONS
const codeToPuzzle = (code, base = defaultCodeBase) => {
  // If the code is already in binary obviously no conversion is warranted
  const codeBin = (base === 2) ? code : convertCodeBase(code, base, 2);
  const puzzle = emptyBoard();

  // "Print" balls left to right, top to bottom
  let i = 0;
  for (let v = 0; v < height; v++) {
    const row = puzzle[v];
    for (let u = 0; u < width; u++) {
      // Skip over non-slotCount
      if (row[u] !== 2) {
        row[u] = codeBin[i];
        i++;
      }
    }
  }

  return puzzle;
};

// DOES NOT VALIDATE GRID BY ITSELF FOR PERFORMANCE REASONS
const puzzleToCode = (puzzle, base = defaultCodeBase) => {
  let codeBin = '';

  // "Read" balls left to right, top to bottom
  for (let v = 0; v < height; v++) {
    const row = puzzle[v];
    for (let u = 0; u < width; u++) {
      const space = row[u];
      // Skip over non-slotCount
      if (space !== 2) {
        codeBin += space;
      }
    }
  }

  return (base === 2) ? codeBin : convertCodeBase(codeBin, 2, base);
};

module.exports = {
  emptyBoard,
  width,
  height,
  slotCount,
  validMoveDeltas,
  validMoveDeltaCount,
  // symmetries,
  // symmetryKVPs,
  isCode,
  isPuzzle,
  copyPuzzle,
  codeToPuzzle,
  puzzleToCode,
  convertCodeBase,
  defaultCodeBase,
};
