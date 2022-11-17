const {
  emptyBoard,
  width,
  height,
  validMoveDeltas,
  validMoveDeltaCount,
  // symmetries,
  symmetryKVPs,
  isHexCode,
  isGrid,
  copyGrid,
  codeToGrid,
  gridToCode,
} = require('./grid.js');

class Configuration {
  constructor(basis) {
    if (!basis) {
      this.grid = emptyBoard();
    } else if (isGrid(basis)) {
      // It is assumed that the passed-in grid is not an undesired shallow copy
      this.grid = basis;
    } else if (isHexCode(basis)) {
      this.grid = codeToGrid(basis);
    } else {
      this.grid = emptyBoard();
    }
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
    if (fromX < 0 || fromX >= width) return null;
    if (fromY < 0 || fromY >= height) return null;
    if (toX < 0 || toX >= width) return null;
    if (toY < 0 || toY >= height) return null;

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

  allValidMoves(reverse) {
    // Check for symmetries here - every move has a corresponding one with flipped dir+mag
    // Possible moves are symmetrical <=> Board is symmetrical (THAT'S NOT TRUE UGH I'M AN IDIOT)
    const validMoves = [];
    // Iterate through every grid space
    for (let v = 0; v < height; v++) {
      for (let u = 0; u < width; u++) {
        // Start by looking for a space with a ball, reverse or not
        if (this.grid[v][u] === 1) {
          // Generate moves from selected ball by iterating through valid deltas
          for (let w = 0; w < validMoveDeltaCount; w++) {
            const delta = validMoveDeltas[w];
            // If a reverse move is desired, the selected ball is ideally
            // the ball that jumped during the move after it did so; otherwise
            // it is ideally that ball before the move is made
            const move = reverse ? {
              from: {
                x: u - delta.x,
                y: v - delta.y,
              },
              to: {
                x: u,
                y: v,
              },
            } : {
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
            if (this.isValidMove(move, reverse)) validMoves.push(move);
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
    for (let v = 0; v < height; v++) {
      for (let u = 0; u < width; u++) {
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

      for (let v = 0; v < height; v++) {
        for (let u = 0; u < width; u++) {
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

  generation(moveDiffInitial = 0, binary = false) {
    const testConfig = new Configuration(copyGrid(this.grid));
    const codes = new Set();
    const reverse = moveDiffInitial < 0;

    const generationRecursive = (moveDiff) => {
      if (moveDiff === 0) {
        codes.add(testConfig.code(binary));
      } else {
        const nextMoves = testConfig.allValidMoves(reverse);
        for (let i = 0; i < nextMoves.length; i++) {
          const nextMove = nextMoves[i];
          testConfig.makeMove(nextMove, reverse);
          generationRecursive(moveDiff + (reverse ? 1 : -1));
          testConfig.makeMove(nextMove, !reverse);
        }
      }
    };

    generationRecursive(moveDiffInitial);
    return codes;
  }

  // VERY RESOURCE-INTENSIVE; only viable in the case of puzzles with ~10 balls or less
  // Workaround ideas: cut down by symmetry (theoretically divides base game by  at least 8)
  //  This was attempted with solveBetter and didn't really work
  // Cache configs of certain ball counts known to be solvable
  //  Current plan: have a cache of all of these with a ball count from a certain set
  //  (remember: factorials) - if any of the results of a grid's set of possible next
  //  (myBallCount - nextCountInSet) moves matches one in that part of the cache, it is solvable
  //  The cache will of course be pre-computed (not time sensitive) and stored
  //  (trade off memory and performance)
  /*
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
  */

  solveOne() {
    const testConfig = new Configuration(copyGrid(this.grid));
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

  // ALSO VERY RESOURCE-INTENSIVE
  /*
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
  */

  gridToString() {
    return this.grid.map((r) => Array.from(r).map((c) => ['.', 'O', ' '][c]).join(' ')).join('\n');
  }

  code(binary) {
    return gridToCode(this.grid, binary);
  }
}

module.exports = Configuration;
