const fs = require('fs');
const Game = require('../client/Game.js');
const { slotCount, convertCodeBase } = require('../client/puzzle.js');
const { byteToBits, byteFromBitRemainder } = require('../client/helpers.js');
const PuzzleSet = require('./PuzzleSet.js');

const ballCount = parseInt(process.argv[2], 10);
if (Number.isNaN(ballCount)) process.exit(1);

const part = Math.max((parseInt(process.argv[3] || 1, 10) - 1), 0);
const partSize = 16500000;

const doneHavingStartedAt = (startTime, padding) => {
  const timeTaken = Date.now() - startTime;
  const hours = Math.floor(timeTaken / 3600000);
  const mins = Math.floor(timeTaken / 60000) % 60;
  const secs = Math.floor(timeTaken / 1000) % 60;
  const milis = timeTaken % 1000;
  process.stdout.write(`${' '.repeat(padding)}Done after ${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${milis.toString().padStart(3, '0')}\n`);
};

if (ballCount === 1) {
  // Make what the list of all one-ball win states would be under the "no symmetries" rule
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
} else {
  const fName = `${ballCount - 1}.bin`;
  // https://www.geeksforgeeks.org/node-js-fs-read-method/
  fs.stat(fName, (errStat, stats) => {
    if (errStat) {
      process.stdout.write(`\nError getting stats for ${fName}: ${errStat.message}`);
    } else {
      fs.open(fName, 'r', (errOpen, fd) => {
        if (errOpen) {
          process.stdout.write(`\nError opening ${fName}: ${errOpen.message}`);
        } else {
          const thisFileSize = stats.size;
          const thisFileParts = Math.ceil(thisFileSize / partSize);
          const partActual = Math.min(part, thisFileParts - 1);
          const offset = partActual * partSize;
          const length = Math.min(thisFileSize - offset, partSize);
          const isPartial = !(offset === 0 && length === thisFileSize);
          if (isPartial) process.stdout.write(`PARTIAL: ${partActual + 1} of ${thisFileParts}\n`);

          const buf = Buffer.alloc(thisFileSize);
          // MEMORY LEAK ERROR CAUSED BY PRECURSOR SEARCH
          // Break basis into parts here
          fs.read(fd, buf, 0, length, offset, (errRead) => {
            if (errRead) {
              process.stdout.write(`\nError reading ${fName}: ${errRead.message}`);
            } else {
              let bitQueue = '';
              const solvables = new PuzzleSet(); // This will get very big!

              let startTime = Date.now();
              process.stdout.write('Finding precursors...');
              for (let i = 0; i < buf.byteLength; i++) {
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
                }
              }
              doneHavingStartedAt(startTime, 14);

              startTime = Date.now();
              process.stdout.write('Writing precursors to byte list...');
              bitQueue = '';
              const byteList = new Uint8Array(Math.ceil((solvables.size() * 33) / 8));
              let i = 0;
              solvables.forEach((solvable) => {
                bitQueue += convertCodeBase(solvable, 36, 2);
                while (bitQueue.length >= 8) {
                  byteList[i] = parseInt(bitQueue.slice(0, 8), 2);
                  i++;
                  bitQueue = bitQueue.slice(8);
                }
              });
              if (bitQueue.length > 0) byteList[i] = byteFromBitRemainder(bitQueue);
              doneHavingStartedAt(startTime, 1);

              fs.writeFileSync(isPartial ? `partial/${ballCount}-${partActual + 1}.bin` : `${ballCount}.bin`, Buffer.from(byteList));
            }
          });
        }
      });
    }
  });
}
