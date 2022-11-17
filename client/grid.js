// GRID LEGEND
// 0: Empty slot
// 1: Ball
// 2: No slot

// emptyBoard is a function to ensure that a deep copy of the template is created then returned
// Also notice the format is grid[y][x], so no diagonal mirroring is necessary
const emptyBoard = () => {
  const grid = [
    new Uint8Array([2, 2, 0, 0, 0, 2, 2]),
    new Uint8Array([2, 2, 0, 0, 0, 2, 2]),
    new Uint8Array([0, 0, 0, 0, 0, 0, 0]),
    new Uint8Array([0, 0, 0, 0, 0, 0, 0]),
    new Uint8Array([0, 0, 0, 0, 0, 0, 0]),
    new Uint8Array([2, 2, 0, 0, 0, 2, 2]),
    new Uint8Array([2, 2, 0, 0, 0, 2, 2]),
  ];
  // https://stackoverflow.com/questions/21988909/is-it-possible-to-create-a-fixed-length-array-in-javascript
  Object.seal(grid);
  return grid;
};
const width = 7;
const height = 7;
const spaces = 33;

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

const hexCodeLength = 9;
// https://stackoverflow.com/questions/1779013/check-if-string-contains-only-digits
// https://www.sitepoint.com/using-regular-expressions-to-check-string-length/
// https://www.webtips.dev/webtips/javascript/javascript-create-regex-from-string-variable
const hexCodePattern = new RegExp(`^[0-9a-f]{${hexCodeLength}}$`);

// https://stackoverflow.com/questions/37199019/method-set-prototype-add-called-on-incompatible-receiver-undefined
const isHexCode = hexCodePattern.test.bind(hexCodePattern);

const isGrid = (obj) => {
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

const copyGrid = (grid) => {
  const gridCopy = [];
  for (let v = 0; v < height; v++) {
    gridCopy[v] = new Uint8Array(grid[v]);
  }
  Object.seal(gridCopy);
  return gridCopy;
};

// DOES NOT VALIDATE CODE BY ITSELF FOR PERFORMANCE REASONS
const codeToGrid = (code) => {
  // If there are no leading zeroes, the balls will be offset
  const codeBin = parseInt(code, 16).toString(2).padStart(spaces, '0');
  const grid = emptyBoard();

  // "Print" balls left to right, top to bottom
  let i = 0;
  for (let v = 0; v < height; v++) {
    const row = grid[v];
    for (let u = 0; u < width; u++) {
      // Skip over non-spaces
      if (row[u] !== 2) {
        row[u] = codeBin[i];
        i++;
      }
    }
  }

  return grid;
};

// DOES NOT VALIDATE GRID BY ITSELF FOR PERFORMANCE REASONS
const gridToCode = (grid, binary) => {
  let codeBin = '';

  // "Read" balls left to right, top to bottom
  for (let v = 0; v < height; v++) {
    const row = grid[v];
    for (let u = 0; u < width; u++) {
      const space = row[u];
      // Skip over non-spaces
      if (space !== 2) {
        codeBin += space;
      }
    }
  }

  if (binary) return codeBin;
  return parseInt(codeBin, 2).toString(16).padStart(hexCodeLength, '0');
};

module.exports = {
  emptyBoard,
  width,
  height,
  spaces,
  validMoveDeltas,
  validMoveDeltaCount,
  symmetries,
  symmetryKVPs,
  isHexCode,
  isGrid,
  copyGrid,
  codeToGrid,
  gridToCode,
};
