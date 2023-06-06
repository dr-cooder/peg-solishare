// !!! WARNING !!!
// If you plan to run this script, please ensure you have about 20GB of storage free first!
// (you can delete half of that result after it's done, specifically, the contents of "count")

const fs = require('fs');
const Game = require('../common/Game.js');
const {
  slotCount,
  codeSampleRange,
  sampleCode,
  countBinName,
  countSampleBinName,
} = require('../common/puzzle.js');
const {
  byteToBits,
  byteFromBitRemainder,
  doneHavingStartedAt,
  progressPercent,
} = require('../common/helpers.js');
const PuzzleSet = require('./PuzzleSet.js');

// Receive parameters or use defaults
const ballCountIn = parseInt(process.argv[2] || '1', 10);
if (Number.isNaN(ballCountIn)
|| ballCountIn < 1
|| ballCountIn >= slotCount) {
  process.exit(1);
}

// Find and write all solvable puzzles with the given ball count,
// building off of the previous generation
// (unless the count is 1, entailing the already-known solved states)
const generateCountFile = (ballCount) => {
  if (ballCount === 1) {
    // Make the list of all one-ball win states.
    // This is unique and extremely fast, so don't bother with ETA or "done having started at"
    process.stdout.write('Initializing win states (wherein 1 ball is left)...');
    const winStates = new PuzzleSet();
    for (let i = 0; i < slotCount; i++) winStates.add(`${'0'.repeat(i)}1${'0'.repeat(slotCount - 1 - i)}`);
    process.stdout.write('\nDone\n');
    fs.writeFileSync(`count/${countBinName(1)}`, winStates.toBuffer());
  } else {
    // Read from the previous file instead of keeping the whole of the past cache in working memory
    // (not viable considering its size)
    const buf = fs.readFileSync(`count/${countBinName(ballCount - 1)}`);
    const bufSize = buf.byteLength;
    // How many puzzles fit into (bytes * 8) bits?
    const puzzleCount = Math.floor((bufSize * 8) / slotCount);
    // How many puzzles is 1/1000th of the way done?
    const puzzleCountThousandth = puzzleCount / 1000;
    let puzzlesDone = 0;
    const progressMessage = 'Finding precursors to previous set...';
    const progressMessageLen = progressMessage.length;
    let progressThousandth = 0;
    process.stdout.write(progressMessage);
    progressPercent(0, progressMessageLen);

    // "bitQueue" is a '0'/'1' string acting as a middleman between objects
    // that store different lengths of bits when reading from one to another
    // (in this casse, a list of bytes (8 each) and a puzzle object (33))
    let bitQueue = '';
    const solvables = new PuzzleSet();

    const startTime = Date.now();
    for (let i = 0; i < bufSize; i++) {
      bitQueue += byteToBits(buf[i]);
      while (bitQueue.length >= slotCount) {
        const binCode = bitQueue.slice(0, slotCount);
        bitQueue = bitQueue.slice(slotCount);
        const game = new Game(binCode);
        // For all of the confirmed-solvable puzzles, all of their one-move-before
        // precursors are also solvable
        const parentMoves = game.allValidMoves(true);
        for (let j = 0; j < parentMoves.length; j++) {
          const parentMove = parentMoves[j];
          // Make the valid reverse move
          game.makeMove(parentMove, true);
          // Mark the result as solvable
          solvables.add(game.code(2));
          // Return to the pre-reverse-move state to try the next
          game.undo(true);
        }
        // Update progress
        puzzlesDone++;
        if (puzzlesDone >= puzzleCountThousandth) {
          puzzlesDone -= puzzleCountThousandth;
          progressThousandth++;
          progressPercent(progressThousandth, progressMessageLen, startTime);
        }
      }
    }
    progressPercent(1000, progressMessageLen);
    doneHavingStartedAt(startTime);

    fs.writeFileSync(`count/${countBinName(ballCount)}`, solvables.toBuffer(startTime));
  }
};

// Divide a count file made by the previous function into parts taxonomized by sampled slots
// written as a decimal integer
const splitCountFile = (ballCount) => {
  // File size allocation/declaration is important (even if it takes extra time) -
  // I believe using loose, variable-length objects like Array here
  // are what caused the memory overflows in early iterations; remmeber that we are
  // working with a huge amount of data and need to be efficient about it

  const buf = fs.readFileSync(`count/${countBinName(ballCount)}`);
  const bufSize = buf.byteLength;
  // Our progress here will be measured in how much of the full, pre-split file we have read
  const bufSizeThousandth = bufSize / 1000;

  // Keep track of how many puzzles of each sample there are
  const puzzleCounts = [];
  for (let s = 0; s < codeSampleRange; s++) {
    puzzleCounts[s] = 0;
  }

  let progressMessage = 'Allocating split file sizes...';
  let progressMessageLen = progressMessage.length;
  let progressThousandth = 0;
  process.stdout.write(progressMessage);
  progressPercent(0, progressMessageLen);

  let bitQueueAll = '';
  let puzzleCountAll = 0;
  let bytesDone = 0;
  let startTime = Date.now();
  for (let i = 0; i < bufSize; i++) {
    bitQueueAll += byteToBits(buf[i]);
    while (bitQueueAll.length >= slotCount) {
      const binCode = bitQueueAll.slice(0, slotCount);
      bitQueueAll = bitQueueAll.slice(slotCount);
      // Add one to the count of this puzzle's sample
      puzzleCounts[sampleCode(binCode)]++;
      // And one to the puzzle count altogether
      puzzleCountAll++;
    }

    // Update progress
    bytesDone++;
    while (bytesDone > bufSizeThousandth) {
      bytesDone -= bufSizeThousandth;
      progressThousandth++;
      progressPercent(progressThousandth, progressMessageLen, startTime);
    }
  }
  progressPercent(1000, progressMessageLen);
  doneHavingStartedAt(startTime);

  // Altogether puzzle count used to determine progress in writing split files
  const puzzleCountAllThousandth = puzzleCountAll / 1000;

  // Each sample has their own file, needing they need their own bit queue, byte list,
  // and byte list write index; ensure the types of the sample-indexed arrays' contents
  // have been declared
  const bitQueues = [];
  const byteLists = [];
  const byteListIndexes = [];
  for (let s = 0; s < codeSampleRange; s++) {
    bitQueues[s] = '';
    byteLists[s] = new Uint8Array(Math.ceil((puzzleCounts[s] * slotCount) / 8));
    byteListIndexes[s] = 0;
  }

  progressMessage = 'Writing to split files...';
  progressMessageLen = progressMessage.length;
  progressThousandth = 0;
  process.stdout.write(progressMessage);
  progressPercent(0, progressMessageLen);

  let puzzlesDone = 0;
  bitQueueAll = '';
  startTime = Date.now();
  // Iterate through the base file once again
  for (let i = 0; i < bufSize; i++) {
    bitQueueAll += byteToBits(buf[i]);
    while (bitQueueAll.length >= slotCount) {
      const binCode = bitQueueAll.slice(0, slotCount);
      bitQueueAll = bitQueueAll.slice(slotCount);
      // Add each code to its respective sample-indexed binQueue and flush it
      const s = sampleCode(binCode);
      bitQueues[s] += binCode;
      while (bitQueues[s].length >= 8) {
        byteLists[s][byteListIndexes[s]] = parseInt(bitQueues[s].slice(0, 8), 2);
        byteListIndexes[s]++;
        bitQueues[s] = bitQueues[s].slice(8);
      }

      // Update progress
      puzzlesDone++;
      while (puzzlesDone > puzzleCountAllThousandth) {
        puzzlesDone -= puzzleCountAllThousandth;
        progressThousandth++;
        progressPercent(progressThousandth, progressMessageLen, startTime);
      }
    }
  }
  progressPercent(1000, progressMessageLen);

  for (let s = 0; s < codeSampleRange; s++) {
    const thisBitQueue = bitQueues[s];
    const thisByteList = byteLists[s];
    // Deal with remainders
    if (thisBitQueue.length > 0) {
      thisByteList[byteListIndexes[s]] = byteFromBitRemainder(thisBitQueue);
    }
    // Write the file (DON'T DO IF EMPTY)
    if (thisByteList.byteLength > 0) {
      fs.writeFileSync(`count-sample/${countSampleBinName(ballCount, s)}`, Buffer.from(thisByteList));
    }
  }

  doneHavingStartedAt(startTime);
};

// Now, keep going until the whole cache is generated, or the program is stopped midway
// via user or crash (hence ballCountIn to pick up where the program left off) (also the
// latter of which I hope I've fixed)
for (let i = ballCountIn; i < slotCount; i++) {
  process.stdout.write(`Current set ball count: ${i}\n`);
  generateCountFile(i);
  splitCountFile(i);
  process.stdout.write('\n');
}
// Maybe add an even flashier message here? The computer finally finishing is quite the occasion
process.stdout.write('\x1b[32m*** ALL DONE!!! ***\x1b[39m');
