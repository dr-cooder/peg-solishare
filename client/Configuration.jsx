// GRID LEGEND
// 0: Empty space
// 1: Ball
// 2: No space

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
const spaces = 33;
const codeLength = 9;

// https://stackoverflow.com/questions/1779013/check-if-string-contains-only-digits
const isCode = (str) => str.length === codeLength && /^[0-9a-f]+$/.test(str);

const isGrid = (obj) => {
  if (!obj) return false;
  const emptyBoardRef = emptyBoard();

  // Ensure there are rows
  if (!Array.isArray(obj)) return false;

  // Ensure there are the right number of rows
  const objLen = obj.length;
  if (objLen !== emptyBoardRef.length) return false;

  for (let v = 0; v < objLen; v++) {
    // Ensure each "row" is actually a row
    const row = obj[v];
    if (!(row instanceof Uint8Array)) return false;

    // Ensure the row is the right length
    const rowLen = row.length;
    if (rowLen !== emptyBoardRef[v].length) return false;

    // Ensure the contents of the row are valid numbers
    for (let u = 0; u < rowLen; u++) {
      const space = row[u];
      if (space !== 0 && space !== 1 && space !== 2) return false;
    }
  }
  return true;
};

const codeToGrid = (code) => {
  if (!isCode(code)) return null;

  const grid = emptyBoard();
  // If there are no leading zeroes, the balls will be offset
  const codeBin = parseInt(code, 16).toString(2).padStart(spaces, '0');

  // "Print" balls left to right, top to bottom
  let i = 0;
  for (let v = 0; v < grid.length; v++) {
    const row = grid[v];
    for (let u = 0; u < row.length; u++) {
      // Skip over non-spaces
      if (row[u] !== 2) {
        row[u] = codeBin[i];
        i++;
      }
    }
  }

  return grid;
};

class Configuration {
  constructor(basis) {
    if (!basis) {
      this.grid = emptyBoard();
    } else if (isGrid(basis)) {
      // It is assumed that the passed-in grid is not an undesired shallow copy;
      // That it has already been created as a deep copy and modified by one move
      this.grid = basis;
    } else if (typeof basis === 'string') {
      this.grid = codeToGrid(basis);
      if (!this.grid) this.grid = emptyBoard();
    } else {
      this.board = emptyBoard();
    }

    // TO-DO: next possible moves
    // - calculate upon creation
    // - only give a list of grids, not entire Config instances
    //   - that would cause recursion and too much of it at that
  }
}

module.exports = Configuration;
