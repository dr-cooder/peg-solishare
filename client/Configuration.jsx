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
const gridWidth = 7;
const gridHeight = 7;
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

const codeLength = 9;
// https://stackoverflow.com/questions/1779013/check-if-string-contains-only-digits
// https://www.sitepoint.com/using-regular-expressions-to-check-string-length/
// https://www.webtips.dev/webtips/javascript/javascript-create-regex-from-string-variable
const codePattern = new RegExp(`^[0-9a-f]{${codeLength}}$`);

// https://stackoverflow.com/questions/37199019/method-set-prototype-add-called-on-incompatible-receiver-undefined
const isCode = codePattern.test.bind(codePattern);

const isGrid = (obj) => {
  if (!obj) return false;
  const emptyBoardInst = emptyBoard();

  // Ensure there are rows
  if (!Array.isArray(obj)) return false;

  // Ensure there are the right number of rows
  const objLen = obj.length;
  if (objLen !== gridHeight) return false;

  for (let v = 0; v < objLen; v++) {
    // Ensure each "row" is actually a row
    const row = obj[v];
    if (!(row instanceof Uint8Array)) return false;

    // Ensure the row is the right length
    const rowLen = row.length;
    if (rowLen !== gridWidth) return false;

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

const codeToGrid = (code) => {
  if (!isCode(code)) return null;

  const grid = emptyBoard();
  // If there are no leading zeroes, the balls will be offset
  const codeBin = parseInt(code, 16).toString(2).padStart(spaces, '0');

  // "Print" balls left to right, top to bottom
  let i = 0;
  for (let v = 0; v < gridHeight; v++) {
    const row = grid[v];
    for (let u = 0; u < gridWidth; u++) {
      // Skip over non-spaces
      if (row[u] !== 2) {
        row[u] = codeBin[i];
        i++;
      }
    }
  }

  return grid;
};

// TO-DO: gridToCode(grid) and verify two-way-ness

class Configuration {
  constructor(basis) {
    if (!basis) {
      this.grid = emptyBoard();
    } else if (isGrid(basis)) {
      // It is assumed that the passed-in grid is not an undesired shallow copy;
      // That it has already been created through another Configuration's gridAfterMove
      this.grid = basis;
    } else if (typeof basis === 'string') {
      this.grid = codeToGrid(basis);
      if (!this.grid) this.grid = emptyBoard();
    } else {
      this.grid = emptyBoard();
    }
  }

  copyGrid() {
    const gridCopy = [];
    for (let v = 0; v < gridHeight; v++) {
      gridCopy[v] = new Uint8Array(this.grid[v]);
    }
    Object.seal(gridCopy);
    return gridCopy;
  }

  // If move is valid, returns valid move delta type (right, up, left, down), otherwise returns null
  isValidMove(move) {
    // Ensure passed-in move has the required properties
    if (!(move.from && typeof move.from.x === 'number' && typeof move.from.y === 'number'
      && move.to && typeof move.to.x === 'number' && typeof move.from.y === 'number')) return null;
    const fromX = move.from.x;
    const fromY = move.from.y;
    const toX = move.to.x;
    const toY = move.to.y;
    const deltaX = toX - fromX;
    const deltaY = toY - fromY;

    // Delta between From and To must be 2 up, down, left, or right
    let matchingDelta = null;
    for (let i = 0; i < validMoveDeltaCount; i++) {
      const validDelta = validMoveDeltas[i];
      if (validDelta.x === deltaX && validDelta.y === deltaY) matchingDelta = validDelta;
    }
    if (!matchingDelta) return null;
    const matchingDeltaMiddle = matchingDelta.middle;
    const midX = fromX + matchingDeltaMiddle.x;
    const midY = fromY + matchingDeltaMiddle.y;

    // From and To must be in bounds
    if (fromX < 0 || fromX >= gridWidth) return null;
    if (fromY < 0 || fromY >= gridHeight) return null;
    if (toX < 0 || toX >= gridWidth) return null;
    if (toY < 0 || toY >= gridHeight) return null;

    // Space at From must be 1, space at To must be 0, and space between must be 1
    if (!(this.grid[fromY][fromX] === 1
      && this.grid[midY][midX] === 1
      && this.grid[toY][toX] === 0)) return null;

    // Move is valid!
    return matchingDelta;
  }

  allValidMoves() {
    const validMoves = [];
    // Iterate through every grid space
    for (let v = 0; v < gridHeight; v++) {
      for (let u = 0; u < gridWidth; u++) {
        // Only attempt moves with a ball at the "from" space
        if (this.grid[v][u] === 1) {
          // Generate moves from selected ball by iterating through valid deltas
          for (let w = 0; w < validMoveDeltaCount; w++) {
            const delta = validMoveDeltas[w];
            const move = {
              from: {
                x: u,
                y: v,
              },
              to: {
                x: u + delta.x,
                y: v + delta.y,
              },
            };
            // Finally, validate move and determine whether to add to list
            if (this.isValidMove(move)) validMoves.push(move);
          }
        }
      }
    }
    return validMoves;
  }

  // If move is valid, returns current grid after move is applied (as a deep copy),
  // otherwise returns null
  gridAfterMove(move) {
    const delta = this.isValidMove(move);
    if (!delta) return null;

    const moveFrom = move.from;
    const deltaMid = delta.middle;
    const moveMid = {
      x: moveFrom.x + deltaMid.x,
      y: moveFrom.y + deltaMid.y,
    };
    const moveTo = move.to;

    const newGrid = this.copyGrid();
    newGrid[moveFrom.y][moveFrom.x] = 0;
    newGrid[moveMid.y][moveMid.x] = 0;
    newGrid[moveTo.y][moveMid.x] = 1;

    return newGrid;
  }

  isWon() {
    let ballCount = 0;
    for (let v = 0; v < gridHeight; v++) {
      for (let u = 0; u < gridWidth; u++) {
        if (this.grid[v][u] === 1) ballCount++;
      }
    }
    return ballCount === 1;
  }

  // TO-DO: recursive solve(moveHist): returns array of moves (moveHist)
  // if !moveHist moveHist = []
  // if this.isWon() return moveHist
  // else
  //  for each valid successorMove in allValidMoves()
  //   successorConfig = new Config(this.gridAfterMove(successorMove))
  //   solution = successorConfig.solve(moveHist+successorMove)
  //   if (solution) return solution
  //  return null

  gridToString() {
    return this.grid.map((r) => Array.from(r).map((c) => ['.', 'O', ' '][c]).join(' ')).join('\n');
  }
}

module.exports = Configuration;
