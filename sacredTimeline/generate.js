const fs = require('fs');
const Game = require('../client/Game.js');
const { slotCount, convertCodeBase } = require('../client/puzzle.js');
const { byteToBits, byteFromBitRemainder, formatTime } = require('../client/helpers.js');
const PuzzleSet = require('./PuzzleSet.js');

const ballCountIn = parseInt(process.argv[2] || '1', 10);
if (Number.isNaN(ballCountIn)
|| ballCountIn < 1
|| ballCountIn >= slotCount) {
  process.exit(1);
}

const doneHavingStartedAt = (startTime) => {
  const timeTaken = Date.now() - startTime;
  process.stdout.write(`\nDone after ${formatTime(timeTaken)}\n`);
};

const progressPercent = (progressOutOfThousand, offset) => {
  const beforeDecimal = progressOutOfThousand.toString().padStart(2, '0').padStart(4, ' ');
  // https://blog.bitsrc.io/coloring-your-terminal-using-nodejs-eb647d4af2a2
  const progressText = ` \x1b[32m${beforeDecimal.slice(0, -1)}.${beforeDecimal.slice(-1)}%\x1b[39m`;
  // https://stackoverflow.com/questions/17309749/node-js-console-log-is-it-possible-to-update-a-line-rather-than-create-a-new-l
  process.stdout.cursorTo(offset);
  process.stdout.write(progressText);
};

const generateCountFile = (ballCount) => {
  if (ballCount === 1) {
    // Make what the list of all one-ball win states would be under the "no symmetries" rule
    process.stdout.write('Initializing win states (wherein 1 ball is left)...');
    const winStates = new PuzzleSet();
    for (let i = 0; i < slotCount; i++) winStates.add(`${'0'.repeat(i)}1${'0'.repeat(slotCount - 1 - i)}`);

    // let bitQueue = Array(slotCount).fill('1').join('0'.repeat(slotCount));
    const byteList = [];
    let bitQueue = '';
    winStates.forEach((winState) => {
      bitQueue += convertCodeBase(winState, 36, 2);
      while (bitQueue.length >= 8) {
        byteList.push(parseInt(bitQueue.slice(0, 8), 2));
        bitQueue = bitQueue.slice(8);
      }
    });
    if (bitQueue.length > 0) byteList.push(byteFromBitRemainder(bitQueue));

    fs.writeFileSync('1.bin', Buffer.from(byteList));
    process.stdout.write('\n\n');
  } else {
    process.stdout.write(`Current set ball count: ${ballCount}\n`);

    const buf = fs.readFileSync(`${ballCount - 1}.bin`);
    const bufSize = buf.byteLength;
    const puzzleCount = Math.floor((bufSize * 8) / slotCount);
    const puzzleCountThousandth = puzzleCount / 1000;
    let puzzlesDone = 0;
    let progressMessage = 'Finding precursors to previous set...';
    let progressMessageLen = progressMessage.length;
    let progressThousandth = 0;
    let bitQueue = '';
    const solvables = new PuzzleSet(); // This will get very big!

    process.stdout.write(progressMessage);
    progressPercent(0, progressMessageLen);

    let startTime = Date.now();
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

    progressMessage = 'Writing precursors to byte list...';
    progressMessageLen = progressMessage.length;
    progressThousandth = 0;
    bitQueue = '';
    const byteListLen = Math.ceil((solvables.size() * slotCount) / 8);
    const byteListLenThousandth = byteListLen / 1000;
    const byteList = new Uint8Array(byteListLen);

    process.stdout.write(progressMessage);
    progressPercent(0, progressMessageLen);

    let i = 0;
    let bytesDone = 0;
    startTime = Date.now();
    solvables.forEach((solvable) => {
      bitQueue += convertCodeBase(solvable, 36, 2);
      while (bitQueue.length >= 8) {
        byteList[i] = parseInt(bitQueue.slice(0, 8), 2);
        bitQueue = bitQueue.slice(8);
        i++;
        bytesDone++;
        if (bytesDone >= byteListLenThousandth) {
          bytesDone -= byteListLenThousandth;
          progressThousandth++;
          progressPercent(progressThousandth, progressMessageLen);
        }
      }
    });
    if (bitQueue.length > 0) byteList[i] = byteFromBitRemainder(bitQueue);
    progressPercent(1000, progressMessageLen);
    doneHavingStartedAt(startTime);

    fs.writeFileSync(`${ballCount}.bin`, Buffer.from(byteList));
  }
};

// Now, keep going until the whole cache is generated, or the program is stopped midway
// via user or crash (hence ballCountIn to pick up where the program left off)
for (let i = ballCountIn; i < slotCount; i++) {
  generateCountFile(i);
  process.stdout.write('\n');
}
