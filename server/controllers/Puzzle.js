const Game = require('../../client/Game.js');
const {
  slotCount,
  isCode,
  codeSampleRange,
  sampleCode,
} = require('../../client/puzzle.js');
const { byteToBits } = require('../../client/helpers.js');
const { getAccount } = require('./controllerHelpers.js');
const { Account } = require('../models');

const hint = async (req, res, getTimelinePart) => {
  // Ensure the user is signed in with an account that can afford a hint
  const { _id } = getAccount(req);
  const account = await Account.findById(_id);
  if (!account) {
    return res.status(401).json({
      message: 'You must be signed in to request a hint.',
      id: 'hintWithoutSignIn',
    });
  }

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
    if (code === purchasedHint.code) {
      return res.status(200).json({
        hint: purchasedHint.hint,
        unsolvable: purchasedHint.unsolvable,
        updatedBalance: account.hintBalance,
      });
    }
  }

  // Otherise make sure charging them is within the realm of possibility
  if (account.hintBalance - 1 < 0) {
    return res.status(401).json({
      message: 'You are out of hints.',
      id: 'insufficientHintBalance',
    });
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
    return res.status(500).json({
      message: 'Unable to access hint data.',
      id: 'hintDataAccessProblem',
    });
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

module.exports = {
  hint,
};
