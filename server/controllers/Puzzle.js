const Game = require('../../common/Game.js');
const {
  slotCount,
  isCode,
  codeSampleRange,
  sampleCode,
} = require('../../common/puzzle.js');
const { byteToBits } = require('../../common/helpers.js');
const { getAccount } = require('./controllerHelpers.js');
const { Account, Puzzle } = require('../models');

const upload = async (req, res, getTimelinePart) => {
  const { _id } = getAccount(req);
  const account = await Account.findById(_id);
  if (!account) {
    return res.status(401).json({ error: 'You must be signed in to upload a puzzle!' });
  }

  const { title, code } = req.body;
  if (!title || !code) {
    // 'Puzzle title and code are required!'
    // ^ Should technically be this but players never directly interface with puzzle code
    // and we don't want to make them think they need to submit anything beyond a
    // WYSIWYG puzzle and its title
    return res.status(400).json({ error: 'Puzzle title is required!' });
  }

  const puzzleData = {
    title,
    creatorName: account.username,
    creatorId: _id,
    code,
  };

  // Ensure the code is valid
  if (!isCode(code)) {
    return res.status(400).json({ error: 'Puzzle code is invalid!' });
  }
  const game = new Game(code);

  // Ensure the ball count is valid
  const ballCount = game.countBalls();
  if (ballCount === 0) {
    return res.status(400).json({ error: 'This puzzle is empty!' });
  }
  if (ballCount === 1) {
    return res.status(400).json({ error: 'This puzzle is already in a solved state!' });
  }

  // Check to see if the puzzle is solvable
  const binCode = game.code(2);
  const codeSample = sampleCode(binCode);
  let buf;
  try {
    buf = await getTimelinePart(ballCount, codeSample);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Unable to verify solvability!' });
  }
  let bitQueue = '';
  let matchFound = false;
  for (let k = 0; k < buf.byteLength; k++) {
    bitQueue += byteToBits(buf[k]);
    while (bitQueue.length >= slotCount && !matchFound) {
      const solvableCode = bitQueue.slice(0, slotCount);
      bitQueue = bitQueue.slice(slotCount);
      if (solvableCode === binCode) {
        matchFound = true;
      }
    }
    if (matchFound) break;
  }
  if (!matchFound) return res.status(400).json({ error: 'This puzzle has no solution(s)!' });

  // Validation on this server is done, now it's up to MongoDB
  try {
    const newPuzzle = new Puzzle(puzzleData);
    await newPuzzle.save();
    return res.status(201).json({
      title: newPuzzle.title,
      code: newPuzzle.code,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Puzzle already exists!' });
    }
    return res.status(400).json({ error: 'An error occurred' });
  }
};

const getPuzzles = async (req, res) => Puzzle.getAll((err, docs) => {
  if (err) {
    console.error(err);
    return res.status(400).json({ error: 'An error occurred' });
  }

  return res.json({ puzzles: docs });
});

const hint = async (req, res, getTimelinePart) => {
  // Ensure the user is signed in
  const { _id } = getAccount(req);
  const account = await Account.findById(_id);
  if (!account) {
    return res.status(401).json({ error: 'You must be signed in to request a hint!' });
  }

  const { code } = req.query;

  // Confirm the input is valid first
  if (!isCode(code)) {
    return res.status(400).json({ error: 'Puzzle code is invalid!' });
  }
  const game = new Game(code);
  const ballCount = game.countBalls();

  // Create an asynchronous helper function to register a hint transaction by the account,
  // returning the updated hint balance
  const chargeHint = async (responseJSON) => {
    account.purchasedHints.push({
      code,
      hint: responseJSON.hint,
      unsolvable: responseJSON.unsolvable,
    });
    const updatedBalance = account.hintBalance - 1;
    account.hintBalance = updatedBalance;
    await account.save();
    return updatedBalance;
  };

  // Don't worry about puzzles that are already solved
  if (ballCount === 1) {
    return res.status(200).json({
      alreadySolved: true,
      updatedBalance: account.hintBalance,
    });
  }

  // If the user has already purchased a hint for the given code, don't charge them
  // and simply give them the desired hint from their personal "purchased hint" cache
  // (This of course also avoids unnecessary calls to the Sacred Timeline)
  const { purchasedHints } = account;
  for (let i = 0; i < purchasedHints.length; i++) {
    const purchasedHint = purchasedHints[i];
    if (purchasedHint && code === purchasedHint.code) {
      return res.status(200).json({
        hint: purchasedHint.hint,
        unsolvable: purchasedHint.unsolvable,
        updatedBalance: account.hintBalance,
      });
    }
  }

  // Otherise make sure charging them is within the realm of possibility
  if (account.hintBalance - 1 < 0) {
    return res.status(401).json({ error: 'You are out of hints!' });
  }

  // Find all possible subsequent moves from given game
  const nextMoves = game.allValidMoves();
  const nextMovesLen = nextMoves.length;

  // If there are 2 balls left, any of the possible moves will lead to a win state.
  // If there are 2 balls left but no possible moves, the game is unsolvable from that state.
  if (ballCount === 2) {
    if (nextMovesLen === 0) {
      const responseJSON = { unsolvable: true };
      const updatedBalance = await chargeHint(responseJSON);
      responseJSON.updatedBalance = updatedBalance;
      return res.status(200).json(responseJSON);
    }
    const responseJSON = { hint: nextMoves[0] };
    const updatedBalance = await chargeHint(responseJSON);
    responseJSON.updatedBalance = updatedBalance;
    return res.status(200).json(responseJSON);
  }

  // Separate potential hints (possible moves from the given code and their resulting codes)
  // by their samples
  const potentialHints = [];
  for (let s = 0; s < codeSampleRange; s++) {
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
  let cachePartBufs;
  try {
    cachePartBufs = await Promise.all(cachePartPromises);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Unable to find hints!' });
  }

  let bitQueue;
  let match;
  // Go through all of the received buffers
  for (let i = 0; i < cachePartsNeededCount; i++) {
    const buf = cachePartBufs[i];
    // Go through all of the hints potentially to be found within this buffer
    const potentialHintsThisBuf = cachePartsNeeded[i][1];
    for (let j = 0; j < potentialHintsThisBuf.length; j++) {
      const potentialHint = potentialHintsThisBuf[j];
      // Look for the hint within the buffer
      bitQueue = '';
      for (let k = 0; k < buf.byteLength; k++) {
        bitQueue += byteToBits(buf[k]);
        while (bitQueue.length >= slotCount && !match) {
          const solvableCode = bitQueue.slice(0, slotCount);
          bitQueue = bitQueue.slice(slotCount);
          if (solvableCode === potentialHint.code) {
            match = potentialHint;
          }
        }
        if (match) break;
      }
      if (match) break;
    }
    if (match) break;
  }
  // Matching solvable puzzle found, return move required to get there
  if (match) {
    const responseJSON = { hint: match.move };
    const updatedBalance = await chargeHint(responseJSON);
    responseJSON.updatedBalance = updatedBalance;
    return res.status(200).json(responseJSON);
  }
  // No matches found, meaning the game is unsolvable from that point
  const responseJSON = { unsolvable: true };
  const updatedBalance = await chargeHint(responseJSON);
  responseJSON.updatedBalance = updatedBalance;
  return res.status(200).json(responseJSON);
};

const submitSolution = async (req, res) => {
  // Ensure the user is signed in
  const { _id } = getAccount(req);
  const account = await Account.findById(_id);
  if (!account) {
    return res.status(401).json({ error: 'You must be signed in to submit a solution!' });
  }

  // Test the solution on the puzzle by performing it
  const { code, solution } = req.body;
  const game = new Game(code);
  let moveSeriesPossible = true;
  for (let i = 0; i < solution.length; i++) {
    if (!game.makeMove(solution[i])) {
      moveSeriesPossible = false;
      break;
    }
  }

  // If the solution doesn't check out, notify the user
  if (!moveSeriesPossible || game.countBalls() !== 1) return res.status(400).json({ error: 'The provided solution to the given puzzle is not valid!' });

  // Otherwise register that the user has solved this puzzle and let them know
  if (!account.completedPuzzles.includes(code)) account.completedPuzzles.push(code);
  try {
    await account.save();
    return res.status(200).json({ message: 'Solution verified!' });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: 'An error occurred' });
  }
};

module.exports = {
  upload,
  getPuzzles,
  hint,
  submitSolution,
};
