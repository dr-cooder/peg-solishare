const fs = require('fs');
const Game = require('../../client/Game.js');
const {
  slotCount,
  isCode,
  codeImages,
} = require('../../client/puzzle.js');
const { byteToBits } = require('../../client/helpers.js');

const homepage = (req, res) => res.render('homepage');

const hint = (req, res) => {
  // TO-DO: Create a stateful hint cache (of a fixed "circular" length?)
  // because 3rd-party cloud service may not be very fast
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
  const gameCodeImages = codeImages(game.code(2));
  const gameCodeImageCount = gameCodeImages.length;

  // Don't worry about puzzles that are already solved
  if (ballCount === 1) {
    return res.status(200).json({ alreadySolved: true });
  }

  // Confirm the puzzle is solvable by consulting the list of solvable puzzles
  // of the same ball count
  // TO-DO: Refactor to conditionally use 3rd-party cloud or non-Git-tracked local
  let fName = `${__dirname}/../../sacredTimeline/${ballCount}.bin`;
  // https://stackoverflow.com/questions/14391690/how-to-capture-no-file-for-fs-readfilesync
  let buf;
  try {
    buf = fs.readFileSync(fName);
  } catch (err) {
    return res.status(500).json({
      message: 'There was a problem accessing hint data.',
      id: 'problemVerifyingSolvability',
    });
  }
  let matchFound = false;
  let bitQueue = '';
  for (let i = 0; i < buf.byteLength; i++) {
    bitQueue += byteToBits(buf[i]);
    while (bitQueue.length >= slotCount && !matchFound) {
      const solvableCode = bitQueue.slice(0, slotCount);
      bitQueue = bitQueue.slice(slotCount);
      for (let j = 0; j < gameCodeImageCount; j++) {
        if (gameCodeImages[j] === solvableCode) {
          matchFound = true;
          break;
        }
      }
    }
    if (matchFound) break;
  }
  if (!matchFound) {
    return res.status(200).json({ unsolvable: true });
  }

  // It has been confirmed that the puzzle is solvable. Now to find the next step in the solution,
  // by consulting the list of all solvable puzzles with one less ball.
  // First, get the codes (and their corresponding moves) we are looking for.
  const nextMoves = game.allValidMoves();
  const potentialHints = [];
  for (let i = 0; i < nextMoves.length; i++) {
    const move = nextMoves[i];
    game.makeMove(move);
    // Remember: if the result of a hint is in the solvables list, or even one of its images is,
    // that means the result of the hint is solvable, and therefore the hint is valid
    const codes = codeImages(game.code(2));
    potentialHints.push({
      move,
      codes,
    });
    game.undo();
  }
  const potentialHintsCount = potentialHints.length;

  // TO-DO: See above comment
  fName = `${__dirname}/../../sacredTimeline/${ballCount - 1}.bin`;
  try {
    buf = fs.readFileSync(fName);
  } catch (err) {
    return res.status(500).json({
      message: 'There was a problem accessing hint data.',
      id: 'problemGeneratingHint',
    });
  }
  bitQueue = '';
  for (let i = 0; i < buf.byteLength; i++) {
    bitQueue += byteToBits(buf[i]);
    while (bitQueue.length >= slotCount) {
      const solvableCode = bitQueue.slice(0, slotCount);
      bitQueue = bitQueue.slice(slotCount);
      for (let j = 0; j < potentialHintsCount; j++) {
        const potentialHint = potentialHints[j];
        for (let k = 0; k < potentialHint.codes.length; k++) {
          if (potentialHint.codes[k] === solvableCode) {
            return res.status(200).json({ hint: potentialHint.move });
          }
        }
      }
    }
  }

  // This code really shouldn't be reached assuming the "Sacred Timeline" was generated properly.
  // Manually brute force testing that this can't happen obviously isn't a humanly feasible option.
  return res.status(500).json({
    message: 'Solution algorithm has been compromised.',
    id: 'solutionAlgorithmCompromised',
  });
};

module.exports = {
  homepage,
  hint,
};
