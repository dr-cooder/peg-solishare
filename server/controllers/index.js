const fs = require('fs');
const Game = require('../../client/Game.js');
const { spaces, isHexCode } = require('../../client/puzzle.js');

const homepage = (req, res) => res.render('homepage');

const hint = (req, res) => {
  const { code } = req.query;

  // Confirm the input is valid first
  if (!isHexCode(code)) {
    return res.status(400).json({
      message: `"${code}" is not a valid puzzle code.`,
      id: 'invalidCode',
    });
  }
  const game = new Game(code);
  const gameCode = game.code(true);
  const ballCount = game.countBalls();

  // Don't worry about puzzles that are already solved
  if (ballCount === 1) {
    return res.status(200).json({ alreadySolved: true });
  }

  // Confirm the puzzle is solvable by consulting the list of solvable puzzles
  // of the same ball count
  let fName = `${__dirname}/../../sacredTimeline/${ballCount}.bin`;
  // https://stackoverflow.com/questions/14391690/how-to-capture-no-file-for-fs-readfilesync
  let buf;
  try {
    buf = fs.readFileSync(fName);
  } catch (err) {
    return res.status(500).json({
      message: 'There was a problem verifying solvability.',
      id: 'problemVerifyingSolvability',
    });
  }
  let matchFound = false;
  let bitQueue = '';
  for (let i = 0; i < buf.byteLength; i++) {
    bitQueue += buf[i].toString(2).padStart(8, '0');
    while (bitQueue.length >= spaces && !matchFound) {
      const solvableCode = bitQueue.slice(0, spaces);
      bitQueue = bitQueue.slice(spaces);
      if (gameCode === solvableCode) matchFound = true;
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
  const testGame = new Game(gameCode);
  for (let i = 0; i < nextMoves.length; i++) {
    const move = nextMoves[i];
    testGame.makeMove(move);
    potentialHints.push({
      move,
      code: testGame.code(true),
    });
    testGame.undo();
  }
  const potentialHintsCount = potentialHints.length;

  fName = `${__dirname}/../../sacredTimeline/${ballCount - 1}.bin`;
  try {
    buf = fs.readFileSync(fName);
  } catch (err) {
    return res.status(500).json({
      message: 'There was a problem generating a hint.',
      id: 'problemGeneratingHint',
    });
  }
  bitQueue = '';
  for (let i = 0; i < buf.byteLength; i++) {
    bitQueue += buf[i].toString(2).padStart(8, '0');
    while (bitQueue.length >= spaces) {
      const solvableCode = bitQueue.slice(0, spaces);
      bitQueue = bitQueue.slice(spaces);
      for (let j = 0; j < potentialHintsCount; j++) {
        const potentialHint = potentialHints[j];
        if (potentialHint.code === solvableCode) {
          return res.status(200).json({ hint: potentialHint.move });
        }
      }
    }
  }

  // This code really shouldn't be reached assuming the "Sacred Timeline" was generated properly
  return res.status(500).json({
    message: 'Solution algorithm has been compromised.',
    id: 'solutionAlgorithmCompromised',
  });
};

module.exports = {
  homepage,
  hint,
};
