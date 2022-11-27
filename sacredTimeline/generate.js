const fs = require('fs');
const Game = require('../client/Game.js');
const {
  slotCount,
  convertCodeBase,
  hexaTriDigitStr,
  midCharIndex,
} = require('../client/puzzle.js');
const {
  byteToBits,
  byteFromBitRemainder,
  doneHavingStartedAt,
  progressPercent,
} = require('../client/helpers.js');
const PuzzleSet = require('./PuzzleSet.js');

const ballCountIn = parseInt(process.argv[2] || '1', 10);
if (Number.isNaN(ballCountIn)
|| ballCountIn < 1
|| ballCountIn >= slotCount) {
  process.exit(1);
}

const generateCountFile = (ballCount) => {
  if (ballCount === 1) {
    // Make what the list of all one-ball win states would be under the "no symmetries" rule
    process.stdout.write('Initializing win states (wherein 1 ball is left)...');
    const winStates = new PuzzleSet();
    for (let i = 0; i < slotCount; i++) winStates.add(`${'0'.repeat(i)}1${'0'.repeat(slotCount - 1 - i)}`);
    process.stdout.write('\nDone\n');
    fs.writeFileSync('count/1.bin', winStates.toBuffer());
  } else {
    const buf = fs.readFileSync(`count/${ballCount - 1}.bin`);
    const bufSize = buf.byteLength;
    const puzzleCount = Math.floor((bufSize * 8) / slotCount);
    const puzzleCountThousandth = puzzleCount / 1000;
    let puzzlesDone = 0;
    const progressMessage = 'Finding precursors to previous set...';
    const progressMessageLen = progressMessage.length;
    let progressThousandth = 0;
    let bitQueue = '';
    const solvables = new PuzzleSet(); // This will get very big!

    process.stdout.write(progressMessage);
    progressPercent(0, progressMessageLen);

    const startTime = Date.now();
    for (let i = 0; i < bufSize; i++) {
      // process.stdout.write(buf[i].toString[i]);
      bitQueue += byteToBits(buf[i]);
      while (bitQueue.length >= slotCount) {
        const binCode = bitQueue.slice(0, slotCount);
        bitQueue = bitQueue.slice(slotCount);
        const game = new Game(binCode);
        const parentMoves = game.allValidMoves(true);
        for (let j = 0; j < parentMoves.length; j++) {
          const parentMove = parentMoves[j];
          game.makeMove(parentMove, true);
          solvables.add(game.code(2));
          game.undo(true);
        }
        puzzlesDone++;
        if (puzzlesDone >= puzzleCountThousandth) {
          puzzlesDone -= puzzleCountThousandth;
          progressThousandth++;
          progressPercent(progressThousandth, progressMessageLen);
        }
      }
    }
    progressPercent(1000, progressMessageLen);
    doneHavingStartedAt(startTime);

    fs.writeFileSync(`count/${ballCount}.bin`, solvables.toBuffer());
  }
};

const splitCountFile = (ballCount) => {
  const buf = fs.readFileSync(`count/${ballCount}.bin`);
  const bufSize = buf.byteLength;
  const bufSizeThousandth = bufSize / 1000;

  const puzzleCounts = {};
  for (let i = 0; i < 36; i++) {
    const c = hexaTriDigitStr.charAt(i);
    puzzleCounts[c] = 0;
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
      puzzleCounts[convertCodeBase(binCode, 2, 36).charAt(midCharIndex)]++;
      puzzleCountAll++;
    }

    bytesDone++;
    while (bytesDone > bufSizeThousandth) {
      bytesDone -= bufSizeThousandth;
      progressThousandth++;
      progressPercent(progressThousandth, progressMessageLen);
    }
  }
  progressPercent(1000, progressMessageLen);
  doneHavingStartedAt(startTime);

  const puzzleCountAllThousandth = puzzleCountAll / 1000;

  const bitQueues = {};
  const byteLists = {};
  const byteListIndexes = {};
  for (let i = 0; i < 36; i++) {
    const c = hexaTriDigitStr.charAt(i);
    bitQueues[c] = '';
    byteLists[c] = new Uint8Array(Math.ceil((puzzleCounts[c] * slotCount) / 8));
    byteListIndexes[c] = 0;
  }

  progressMessage = 'Writing to split files...';
  progressMessageLen = progressMessage.length;
  progressThousandth = 0;
  process.stdout.write(progressMessage);
  progressPercent(0, progressMessageLen);

  let puzzlesDone = 0;
  bitQueueAll = '';
  startTime = Date.now();
  for (let i = 0; i < bufSize; i++) {
    bitQueueAll += byteToBits(buf[i]);
    while (bitQueueAll.length >= slotCount) {
      const binCode = bitQueueAll.slice(0, slotCount);
      bitQueueAll = bitQueueAll.slice(slotCount);
      const c = convertCodeBase(binCode, 2, 36).charAt(midCharIndex);
      bitQueues[c] += binCode;
      while (bitQueues[c].length >= 8) {
        byteLists[c][byteListIndexes[c]] = parseInt(bitQueues[c].slice(0, 8), 2);
        byteListIndexes[c]++;
        bitQueues[c] = bitQueues[c].slice(8);
      }

      puzzlesDone++;
      while (puzzlesDone > puzzleCountAllThousandth) {
        puzzlesDone -= puzzleCountAllThousandth;
        progressThousandth++;
        progressPercent(progressThousandth, progressMessageLen);
      }
    }
  }
  progressPercent(1000, progressMessageLen);

  for (let i = 0; i < 36; i++) {
    const c = hexaTriDigitStr.charAt(i);
    if (bitQueues[c].length > 0) {
      byteLists[c][byteListIndexes[c]] = byteFromBitRemainder(bitQueues[c]);
    }
    fs.writeFileSync(`count-mid/${ballCount}-${c}.bin`, byteLists[c]);
  }

  doneHavingStartedAt(startTime);
};

// Now, keep going until the whole cache is generated, or the program is stopped midway
// via user or crash (hence ballCountIn to pick up where the program left off)
for (let i = ballCountIn; i < slotCount; i++) {
  // const i = ballCountIn;
  process.stdout.write(`Current set ball count: ${i}\n`);
  generateCountFile(i);
  splitCountFile(i);
  process.stdout.write('\n');
}
