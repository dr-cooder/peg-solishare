const Game = require('../../client/Game.js');
const {
  slotCount,
  isCode,
  sampleCode,
} = require('../../client/puzzle.js');
const { byteToBits } = require('../../client/helpers.js');

const homepage = (req, res) => res.render('homepage');

const hint = async (req, res, getTimelinePart) => {
  // TO-DO: Create a stateful hint cache (of a fixed "circular" length?)
  // because 3rd-party cloud service may not be very fast, or take well to too many requests
  const { code } = req.query;

  // Confirm the input is valid first
  if (!isCode(code)) {
    return res.status(400).json({
      message: `"${code}" is not a valid puzzle code.`,
      id: 'invalidCode',
    });
  }
  const game = new Game(code);
  const ballCount = game.countBalls();

  // Don't worry about puzzles that are already solved
  if (ballCount === 1) {
    return res.status(200).json({ alreadySolved: true });
  }

  // Find all possible subsequent moves from given game
  const nextMoves = game.allValidMoves();
  const nextMovesLen = nextMoves.length;

  // If there are 2 balls left, any of the possible moves will lead to a win state.
  // If there are 2 balls left but no possible moves, the game is unsolvable from that state.
  if (ballCount === 2) {
    if (nextMovesLen === 0) {
      return res.status(200).json({ unsolvable: true });
    }
    return res.status(200).json({ hint: nextMoves[0] });
  }

  // Separate potential hints (possible moves from the given code and their resulting codes)
  // by their samples
  const potentialHints = [];
  for (let s = 0; s < 32; s++) {
    potentialHints[s] = [];
  }
  for (let i = 0; i < nextMovesLen; i++) {
    const move = nextMoves[i];
    game.makeMove(move);
    const moveCode = game.code(2);
    potentialHints[sampleCode(moveCode)].push({
      move,
      code: moveCode,
    });
    game.undo();
  }

  // Now determine which cache files we actually need and wait to receive them all
  const cachePartsNeeded = Object.entries(potentialHints).filter((e) => e[1].length > 0);
  const cachePartsNeededCount = cachePartsNeeded.length;
  // cachePartsNeeded.sort((a, b) => a[1].length - b[1].length);
  const cachePartPromises = [];
  for (let i = 0; i < cachePartsNeededCount; i++) {
    cachePartPromises.push(getTimelinePart(ballCount - 1, cachePartsNeeded[i][0]));
  }
  const cachePartBufs = await Promise.all(cachePartPromises);

  let bitQueue;
  // Go through all of the received buffers
  for (let i = 0; i < cachePartsNeededCount; i++) {
    const buf = cachePartBufs[i];
    // Go through all of the hints potentially to be found within this buffer
    const potentialHintsThisBuf = cachePartsNeeded[i][1];
    for (let j = 0; j < potentialHintsThisBuf.length; j++) {
      const potentialHint = potentialHintsThisBuf[j];
      // Look for the hint within the buffer
      bitQueue = '';
      for (let k = 0; k < buf.length; k++) {
        bitQueue += byteToBits(buf[k]);
        while (bitQueue.length >= slotCount) {
          const solvableCode = bitQueue.slice(0, slotCount);
          bitQueue = bitQueue.slice(slotCount);
          if (solvableCode === potentialHint.code) {
            return res.status(200).json({ hint: potentialHint.move });
          }
        }
      }
    }
  }

  // No matches found, meaning the game is unsolvable from that point
  return res.status(200).json({ unsolvable: true });
};

module.exports = {
  homepage,
  hint,
};
