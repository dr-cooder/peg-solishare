const fs = require('fs');
const Game = require('../client/Game.js');
const { slotCount } = require('../client/puzzle.js');

// https://github.com/nodejs/node/issues/37320
class SuperSet {
  constructor() {
    this.sets = [new Set()];
  }

  add(v) {
    if (this.sets[this.sets.length - 1].size === 16777000) this.sets.push(new Set());
    if (!this.has(v)) this.sets[this.sets.length - 1].add(v);
  }

  has(v) {
    for (let i = 0; i < this.sets.length; i++) {
      if (this.sets[i].has(v)) return true;
    }
    return false;
  }

  forEach(callback) {
    for (let i = 0; i < this.sets.length; i++) {
      this.sets[i].forEach(callback);
    }
  }
}

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

const saveFile = (byteList, fName) => {
  const startTime = Date.now();
  process.stdout.write('Making buffer from byte list...');
  const buf = Buffer.from(byteList);
  doneHavingStartedAt(startTime, 4);
  fs.open(fName, 'w', (errOpen, fd) => {
    if (errOpen) {
      process.stdout.write(`\nError opening ${fName}: ${errOpen.message}`);
    } else {
      fs.write(fd, buf, 0, buf.byteLength, 0, (errWrite) => {
        if (errWrite) {
          process.stdout.write(`\nError writing buffer to ${fName}: ${errWrite.message}`);
          fs.close(fd);
        } else {
          fs.close(fd, () => process.stdout.write('All done!'));
        }
      });
    }
  });
};

if (ballCount === 1) {
  let bitQueue = Array(slotCount).fill('1').join('0'.repeat(slotCount));
  const byteList = [];

  while (bitQueue.length >= 8) {
    byteList.push(parseInt(bitQueue.slice(0, 8), 2));
    bitQueue = bitQueue.slice(8);
  }
  byteList.push(parseInt(bitQueue.padEnd(8, '0'), 2));

  saveFile(byteList, '1.bin');
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
              const solvables = new SuperSet(); // This will get very big!

              let startTime = Date.now();
              process.stdout.write('Finding precursors...');
              for (let i = 0; i < buf.byteLength; i++) {
                // process.stdout.write(buf[i].toString[i]);
                bitQueue += buf[i].toString(2).padStart(8, '0');
                while (bitQueue.length >= slotCount) {
                  const binCode = bitQueue.slice(0, slotCount);
                  bitQueue = bitQueue.slice(slotCount);
                  const game = new Game(binCode);
                  const parentMoves = game.allValidMoves(true);
                  for (let j = 0; j < parentMoves.length; j++) {
                    const parentMove = parentMoves[j];
                    game.makeMove(parentMove, true);
                    solvables.add(game.code(true));
                    game.undo(true);
                  }
                }
              }
              doneHavingStartedAt(startTime, 9);

              startTime = Date.now();
              process.stdout.write('Writing precursors to byte list...');
              bitQueue = '';
              const byteList = [];
              solvables.forEach((solvable) => {
                bitQueue += solvable;
                while (bitQueue.length >= 8) {
                  byteList.push(parseInt(bitQueue.slice(0, 8), 2));
                  bitQueue = bitQueue.slice(8);
                }
              });
              byteList.push(parseInt(bitQueue.padEnd(8, '0'), 2));
              doneHavingStartedAt(startTime, 1);

              saveFile(byteList, isPartial ? `partial/${ballCount}-${partActual + 1}.bin` : `${ballCount}.bin`);
            }
          });
        }
      });
    }
  });
}
