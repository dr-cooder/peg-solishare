const fs = require('fs');
const Game = require('../../client/Game.js');
const {
  slotCount,
  isCode,
  // midCharIndex,
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
  // const codeBin = game.code(2);
  const ballCount = game.countBalls();
  // const midDigit = game.code(36).charAt(midCharIndex);

  // Don't worry about puzzles that are already solved
  if (ballCount === 1) {
    return res.status(200).json({ alreadySolved: true });
  }

  // CONSIDER SKIPPING THIS PART ENTIRELY - If the puzzle isn't solvable, none of the results of its
  // next possible moves will by solvable anyway, and time is money understanding a portion of the
  // sacred timeline must be downloaded every time a list is to be checked
  // Confirm the puzzle is solvable by consulting the list of solvable puzzles
  // of the same ball count
  /*
  // TO-DO: Refactor to conditionally use 3rd-party cloud or non-Git-tracked local
  let fName = `${__dirname}/../../sacredTimeline/count-mid/${ballCount}-${midDigit}.bin`;
  // let fName = `${__dirname}/../../sacredTimeline/count/${ballCount}.bin`;
  console.log(fName);
  console.log(codeBin);
  // https://stackoverflow.com/questions/14391690/how-to-capture-no-file-for-fs-readfilesync
  let buf;
  try {
    buf = fs.readFileSync(fName);
  } catch (err) {
    return res.status(500).json({
      message: 'There was a problem accessing hint data.',
      id: 'problemAccessingHintData',
    });
  }
  let matchFound = false;
  let bitQueue = '';
  for (let i = 0; i < buf.byteLength; i++) {
    bitQueue += byteToBits(buf[i]);
    while (bitQueue.length >= slotCount && !matchFound) {
      const solvableCode = bitQueue.slice(0, slotCount);
      bitQueue = bitQueue.slice(slotCount);
      if (codeBin === solvableCode) {
        matchFound = true;
        break;
      }
    }
    if (matchFound) break;
  }
  if (!matchFound) {
    return res.status(200).json({ unsolvable: true });
  }
  */

  // It has been confirmed that the puzzle is solvable. Now to find the next step in the solution,
  // by consulting the list of all solvable puzzles with one less ball.
  // First, get the codes (and their corresponding moves) we are looking for.
  const nextMoves = game.allValidMoves();
  const nextMovesLen = nextMoves.length;

  if (ballCount === 2) {
    if (nextMovesLen === 0) {
      return res.status(200).json({ unsolvable: true });
    }
    return res.status(200).json({ hint: nextMoves[0] });
  }

  const potentialHints = [];
  for (let i = 0; i < nextMovesLen; i++) {
    const move = nextMoves[i];
    game.makeMove(move);
    potentialHints.push({
      move,
      code: game.code(2),
    });
    game.undo();
  }
  const potentialHintsCount = potentialHints.length;

  // TO-DO: Make use of split-by-middle-digit code files to speed up downloading and parsing
  // TO-DO: Refactor to conditionally use 3rd-party cloud or non-Git-tracked local
  const fName = `${__dirname}/../../sacredTimeline/count/${ballCount - 1}.bin`;
  // console.log(fName);
  let buf;
  try {
    buf = fs.readFileSync(fName);
  } catch (err) {
    return res.status(500).json({
      message: 'There was a problem accessing hint data.',
      id: 'problemAccessingHintData',
    });
  }
  let bitQueue = '';
  for (let i = 0; i < buf.byteLength; i++) {
    bitQueue += byteToBits(buf[i]);
    while (bitQueue.length >= slotCount) {
      const solvableCode = bitQueue.slice(0, slotCount);
      bitQueue = bitQueue.slice(slotCount);
      for (let j = 0; j < potentialHintsCount; j++) {
        const potentialHint = potentialHints[j];
        if (potentialHint.code === solvableCode) {
          return res.status(200).json({ hint: potentialHint.move });
        }
      }
    }
  }
  return res.status(200).json({ unsolvable: true });
};

module.exports = {
  homepage,
  hint,
};
