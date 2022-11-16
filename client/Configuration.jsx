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

const maxX = gridWidth - 1;
const maxY = gridWidth - 1;
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

// DOES NOT VALIDATE CODE BY ITSELF FOR PERFORMANCE REASONS
const codeToGrid = (code) => {
  // If there are no leading zeroes, the balls will be offset
  const codeBin = parseInt(code, 16).toString(2).padStart(spaces, '0');
  const grid = emptyBoard();

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

// DOES NOT VALIDATE GRID BY ITSELF FOR PERFORMANCE REASONS
const gridToCode = (grid) => {
  let codeBin = '';

  // "Read" balls left to right, top to bottom
  for (let v = 0; v < gridHeight; v++) {
    const row = grid[v];
    for (let u = 0; u < gridWidth; u++) {
      // Skip over non-spaces
      const space = row[u];
      if (space !== 2) {
        codeBin += space;
      }
    }
  }

  return parseInt(codeBin, 2).toString(16).padStart(codeLength, '0');
};

// ^ Consider importing everything above from another file

class Configuration {
  constructor(basis) {
    if (!basis) {
      this.grid = emptyBoard();
    } else if (isGrid(basis)) {
      // It is assumed that the passed-in grid is not an undesired shallow copy
      this.grid = basis;
    } else if (isCode(basis)) {
      this.grid = codeToGrid(basis);
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
  isValidMove(move, reverse) {
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

    // If making the move normally, space at From must be 1,
    // space at To must be 0, and space between must be 1.
    // If making the move in reverse, space at From must be 0,
    // space at To must be 1, and space between must be 0.
    const spaceFromExpected = reverse ? 0 : 1;
    const spaceMidExpected = reverse ? 0 : 1;
    const spaceToExpected = reverse ? 1 : 0;
    if (!(this.grid[fromY][fromX] === spaceFromExpected
      && this.grid[midY][midX] === spaceMidExpected
      && this.grid[toY][toX] === spaceToExpected)) return null;

    // Move is valid!
    return {
      matchingDelta,
      moveMid: {
        x: midX,
        y: midY,
      },
    };
  }

  allValidMoves() {
    // Check for symmetries here - every move has a corresponding one with flipped dir+mag
    // Possible moves are symmetrical <=> Board is symmetrical (THAT'S NOT TRUE UGH I'M AN IDIOT)
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

  // If move is valid, applies the move to the grid
  makeMove(move, reverse) {
    const moveIsValid = this.isValidMove(move, reverse);
    if (!moveIsValid) return;
    const { moveMid } = moveIsValid;

    const moveFrom = move.from;
    const moveTo = move.to;

    const fromAfter = reverse ? 1 : 0;
    const midAfter = reverse ? 1 : 0;
    const toAfter = reverse ? 0 : 1;

    this.grid[moveFrom.y][moveFrom.x] = fromAfter;
    this.grid[moveMid.y][moveMid.x] = midAfter;
    this.grid[moveTo.y][moveTo.x] = toAfter;
  }

  countBalls() {
    let ballCount = 0;
    for (let v = 0; v < gridHeight; v++) {
      for (let u = 0; u < gridWidth; u++) {
        if (this.grid[v][u] === 1) ballCount++;
      }
    }
    return ballCount;
  }

  getSymmetries() {
    const applicableSymmetries = [];

    for (let i = 0; i < symmetryKVPs.length; i++) {
      const [symmetryName, symmentryTransform] = symmetryKVPs[i];
      let symmetryApplicable = true;

      for (let v = 0; v < gridHeight; v++) {
        for (let u = 0; u < gridWidth; u++) {
          // SKIP IF NO SLOT
          const { x: uPrime, y: vPrime } = symmentryTransform({ x: u, y: v });
          if (this.grid[v][u] !== this.grid[vPrime][uPrime]) {
            symmetryApplicable = false;
            break;
          }
        }
        if (!symmetryApplicable) break;
      }

      if (symmetryApplicable) applicableSymmetries.push(symmetryName);
    }

    return applicableSymmetries;
  }

  // VERY RESOURCE-INTENSIVE; only viable in the case of puzzles with ~10 balls or less
  // Workaround ideas: cut down by symmetry (theoretically divides base game by  at least 8)
  // Cache configs of certain ball counts known to be solvable
  solve() {
    const testConfig = new Configuration(this.copyGrid());
    let ballCount = testConfig.countBalls();
    const moveHistory = [];
    const solutions = [];

    const solveRecursive = () => {
      if (ballCount === 4) {
        // If a win state has been reached, register the move history as a solution
        const foundSolution = Array.from(moveHistory);
        solutions.push(foundSolution);
      } else {
        // check for symmetries
        // For every possible move
        const moves = testConfig.allValidMoves();
        for (let i = 0; i < moves.length; i++) {
          const move = moves[i];

          // Make the move and add it to the record
          testConfig.makeMove(move);
          ballCount--;
          moveHistory.push(move);

          // Keep branching, wait until all sub-branches are done
          solveRecursive();

          // Undo the move and remove it from the record
          testConfig.makeMove(move, true);
          ballCount++;
          moveHistory.pop();
        }
      }
    };
    solveRecursive();

    return solutions;
  }

  solveOne() {
    const testConfig = new Configuration(this.copyGrid());
    let ballCount = testConfig.countBalls();
    const moveHistory = [];

    const solveRecursive = () => {
      if (ballCount === 1) {
        // If a win state has been reached, register the move history as a solution
        return moveHistory;
      }
      // check for symmetries
      // For every possible move
      const moves = testConfig.allValidMoves();
      for (let i = 0; i < moves.length; i++) {
        const move = moves[i];

        // Make the move and add it to the record
        testConfig.makeMove(move);
        ballCount--;
        moveHistory.push(move);

        // Keep branching, wait until all sub-branches are done
        const solution = solveRecursive();
        if (solution) return solution;

        // Undo the move and remove it from the record
        testConfig.makeMove(move, true);
        ballCount++;
        moveHistory.pop();
      }
      return null;
    };

    return solveRecursive();
  }

  solveBetter() {
    // Make a copy of this instance for safety
    const testConfig = new Configuration(this.copyGrid());
    let ballCount = testConfig.countBalls();
    const makeNode = (move) => {
      const newNode = {
        moveFromParent: move,
        children: [],
      };

      if (move) {
        testConfig.makeMove(move);
        ballCount--;
      }

      const symmetryNames = testConfig.getSymmetries();
      newNode.symmetries = symmetryNames;
      const nextMoves = testConfig.allValidMoves();
      const nextMovesLength = nextMoves.length;

      // Cull next moves according to each observed symmetry
      for (let i = 0; i < symmetryNames.length; i++) {
        const currentSymmetryFunc = symmetries[symmetryNames[i]];
        for (let j = 0; j < nextMovesLength; j++) {
          // Pick a move, and determine its symmetry-transformed counterpart
          const baseMove = nextMoves[j];
          if (baseMove) {
            const movePrimeActualFrom = currentSymmetryFunc(baseMove.from);
            const movePrimeActualTo = currentSymmetryFunc(baseMove.to);
            for (let k = 0; k < nextMovesLength; k++) {
              // Avoid possibility of move getting culled by itself;
              // certain transforms on certain points can be identity
              if (j !== k) {
                // If another move on the list matches the image, cull it;
                // it is redundant because it and its branches can simply be replicated
                // by applying the transform to the pre-image and all of its branches.
                const movePrimeExpected = nextMoves[k];
                if (movePrimeExpected) {
                  const {
                    from: movePrimeExpectedFrom,
                    to: movePrimeExpectedTo,
                  } = movePrimeExpected;
                  if (movePrimeExpectedFrom.x === movePrimeActualFrom.x
                    && movePrimeExpectedFrom.y === movePrimeActualFrom.y
                    && movePrimeExpectedTo.x === movePrimeActualTo.x
                    && movePrimeExpectedTo.y === movePrimeActualTo.y) {
                    nextMoves[k] = null;
                  }
                }
              }
            }
          }
        }
      }

      for (let i = 0; i < nextMovesLength; i++) {
        const nextMove = nextMoves[i];
        if (nextMove) {
          const child = makeNode(nextMove);
          if (child.children.length !== 0 || ballCount === 1) {
            newNode.children.push(child);
          }
        }
      }

      if (move) {
        testConfig.makeMove(move, true);
        ballCount++;
      }

      return newNode;
    };
    return makeNode();
  }

  gridToString() {
    return this.grid.map((r) => Array.from(r).map((c) => ['.', 'O', ' '][c]).join(' ')).join('\n');
  }

  code() {
    return gridToCode(this.grid);
  }
}

module.exports = Configuration;
