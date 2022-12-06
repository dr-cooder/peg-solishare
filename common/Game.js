const {
  emptyBoard,
  width,
  height,
  validMoveDeltas,
  validMoveDeltaCount,
  // symmetries,
  // symmetryKVPs,
  isCode,
  isPuzzle,
  // copyPuzzle,
  codeToPuzzle,
  puzzleToCode,
  defaultCodeBase,
  countBalls,
  validateMoveStruct,
  findMoveDelta,
} = require('./puzzle.js');

class Game {
  constructor(basis) {
    if (!basis) {
      this.puzzle = emptyBoard();
    } else if (isPuzzle(basis)) {
      // It is assumed that the passed-in puzzle is not an undesired shallow copy
      this.puzzle = basis;
    } else if (isCode(basis)) {
      this.puzzle = codeToPuzzle(basis);
    } else if (isCode(basis, 2)) {
      this.puzzle = codeToPuzzle(basis, 2);
    } else {
      this.puzzle = emptyBoard();
    }
    this.moveHistory = [];
  }

  // If move is valid, returns valid move delta type (right, up, left, down), otherwise returns null
  validateMove(move, reverse) {
    // Ensure passed-in move has the required properties
    if (!validateMoveStruct(move)) return null;
    const fromX = move.from.x;
    const fromY = move.from.y;
    const toX = move.to.x;
    const toY = move.to.y;

    // Delta between From and To must be 2 up, down, left, or right
    const matchingDelta = findMoveDelta(fromX, fromY, toX, toY);
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
            if (this.validateMove(move, reverse)) validMoves.push(move);
          }
        }
      }
    }
    return validMoves;
  }

  // If move is valid (this needs to be checked to determine the ball to be jumped over),
  // applies the move to the puzzle and returns true. Otherwise returns false.
  makeMove(move, reverse, dontAddToHistory) {
    const moveValidation = this.validateMove(move, reverse);
    if (!moveValidation) return false;
    const { moveMid } = moveValidation;

    const moveFrom = move.from;
    const moveTo = move.to;

    const fromAfter = reverse ? 1 : 0;
    const midAfter = reverse ? 1 : 0;
    const toAfter = reverse ? 0 : 1;

    this.puzzle[moveFrom.y][moveFrom.x] = fromAfter;
    this.puzzle[moveMid.y][moveMid.x] = midAfter;
    this.puzzle[moveTo.y][moveTo.x] = toAfter;

    if (!dontAddToHistory) this.moveHistory.push(move);

    return true;
  }

  // Returns true if the toggle was performed successfully
  // (unsuccessful if space is a "no slot" space)
  toggleBall(x, y, dontAddToHistory) {
    const spaceOld = this.puzzle[y][x];
    if (spaceOld === 2) return false;
    this.puzzle[y][x] = spaceOld === 0 ? 1 : 0;
    if (!dontAddToHistory) this.moveHistory.push({ toggle: { x, y } });
    return true;
  }

  // Undoing is really just making the most recent move in reverse
  // and removing that move from the history
  undo(reverse) {
    const moveToUndo = this.moveHistory.pop();
    if (!moveToUndo) return;
    // Adapt to the input type of the move
    const { toggle } = moveToUndo;
    if (toggle) {
      this.toggleBall(toggle.x, toggle.y, true);
    } else {
      this.makeMove(moveToUndo, !reverse, true);
    }
  }

  // Just to reduce the amount of typing in game.puzzle.countBalls
  countBalls() {
    return countBalls(this.puzzle);
  }

  // Just for testing purposes
  puzzleToString() {
    return this.puzzle.map((r) => Array.from(r).map((c) => ['.', 'O', ' '][c]).join(' ')).join('\n');
  }

  // Similar to countBalls, to absolve unnecessary typing
  code(base = defaultCodeBase) {
    return puzzleToCode(this.puzzle, base);
  }
}

module.exports = Game;
