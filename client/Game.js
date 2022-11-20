const {
  emptyBoard,
  width,
  height,
  validMoveDeltas,
  validMoveDeltaCount,
  // symmetries,
  symmetryKVPs,
  isHexCode,
  isBinCode,
  isPuzzle,
  copyPuzzle,
  codeToPuzzle,
  puzzleToCode,
} = require('./puzzle.js');

class Game {
  constructor(basis) {
    if (!basis) {
      this.puzzle = emptyBoard();
    } else if (isPuzzle(basis)) {
      // It is assumed that the passed-in puzzle is not an undesired shallow copy
      this.puzzle = basis;
    } else if (isHexCode(basis)) {
      this.puzzle = codeToPuzzle(basis);
    } else if (isBinCode(basis)) {
      this.puzzle = codeToPuzzle(basis, true);
    } else {
      this.puzzle = emptyBoard();
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
    if (!(this.puzzle[fromY][fromX] === spaceFromExpected
      && this.puzzle[midY][midX] === spaceMidExpected
      && this.puzzle[toY][toX] === spaceToExpected)) return null;

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
    // Iterate through every puzzle space
    for (let v = 0; v < height; v++) {
      for (let u = 0; u < width; u++) {
        // Start by looking for a space with a ball, reverse or not
        if (this.puzzle[v][u] === 1) {
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

  // If move is valid, applies the move to the puzzle
  makeMove(move, reverse) {
    const moveIsValid = this.isValidMove(move, reverse);
    if (!moveIsValid) return;
    const { moveMid } = moveIsValid;

    const moveFrom = move.from;
    const moveTo = move.to;

    const fromAfter = reverse ? 1 : 0;
    const midAfter = reverse ? 1 : 0;
    const toAfter = reverse ? 0 : 1;

    this.puzzle[moveFrom.y][moveFrom.x] = fromAfter;
    this.puzzle[moveMid.y][moveMid.x] = midAfter;
    this.puzzle[moveTo.y][moveTo.x] = toAfter;
  }

  countBalls() {
    let ballCount = 0;
    for (let v = 0; v < height; v++) {
      for (let u = 0; u < width; u++) {
        if (this.puzzle[v][u] === 1) ballCount++;
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
          if (this.puzzle[v][u] !== this.puzzle[vPrime][uPrime]) {
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
    const testGame = new Game(copyPuzzle(this.puzzle));
    const codes = new Set();
    const reverse = moveDiffInitial < 0;

    const generationRecursive = (moveDiff) => {
      if (moveDiff === 0) {
        codes.add(testGame.code(binary));
      } else {
        const nextMoves = testGame.allValidMoves(reverse);
        for (let i = 0; i < nextMoves.length; i++) {
          const nextMove = nextMoves[i];
          testGame.makeMove(nextMove, reverse);
          generationRecursive(moveDiff + (reverse ? 1 : -1));
          testGame.makeMove(nextMove, !reverse);
        }
      }
    };

    generationRecursive(moveDiffInitial);
    return codes;
  }

  // DO NOT CALL WITHOUT VERIFYING THE PUZZLE IS SOLVABLE FIRST
  // If solve is called on an unsolvable puzzle, this will be found the "hard way" resource-wise;
  // Every possible set of moves will be made only for the function to return null
  solve() {
    const testGame = new Game(copyPuzzle(this.puzzle));
    let ballCount = testGame.countBalls();
    const moveHistory = [];

    const solveRecursive = () => {
      if (ballCount === 1) {
        // If a win state has been reached, register the move history as a solution
        return moveHistory;
      }
      // check for symmetries
      // For every possible move
      const moves = testGame.allValidMoves();
      for (let i = 0; i < moves.length; i++) {
        const move = moves[i];

        // Make the move and add it to the record
        testGame.makeMove(move);
        ballCount--;
        moveHistory.push(move);

        // Keep branching, wait until all sub-branches are done
        const solution = solveRecursive();
        if (solution) return solution;

        // Undo the move and remove it from the record
        testGame.makeMove(move, true);
        ballCount++;
        moveHistory.pop();
      }
      return null;
    };

    return solveRecursive();
  }

  puzzleToString() {
    return this.puzzle.map((r) => Array.from(r).map((c) => ['.', 'O', ' '][c]).join(' ')).join('\n');
  }

  code(binary) {
    return puzzleToCode(this.puzzle, binary);
  }
}

module.exports = Game;
