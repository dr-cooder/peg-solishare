const fs = require('fs');
const { slotCount, convertCodeBase } = require('../common/puzzle.js');
const { byteToBits, byteFromBitRemainder } = require('../common/helpers.js');
const PuzzleSet = require('./PuzzleSet.js');

const ballCountName = process.argv[2];
const parts = fs.readdirSync('./partial/').filter((e) => e.slice(0, ballCountName.length + 1) === `${ballCountName}-`);
const partsCount = parts.length;

const solvablesMerged = new PuzzleSet(); // This will get very big!
let buf;
let bitQueue;

for (let i = 0; i < partsCount; i++) {
  process.stdout.write(`\n${i}/${partsCount} merged...`);
  buf = fs.readFileSync(`./partial/${parts[i]}`);
  bitQueue = '';
  for (let j = 0; j < buf.byteLength; j++) {
    bitQueue += byteToBits(buf[j]);
    while (bitQueue.length >= slotCount) {
      solvablesMerged.add(bitQueue.slice(0, slotCount));
      bitQueue = bitQueue.slice(slotCount);
    }
  }
}

const solvablesMergedCount = solvablesMerged.size();
const expectedOutFileSize = Math.ceil((solvablesMergedCount * 33) / 8);
process.stdout.write(`\n${partsCount}/${partsCount} merged! Recompiling and writing ${solvablesMergedCount.toLocaleString('en-US')} unique puzzles to a(n) ${expectedOutFileSize.toLocaleString('en-US')}-byte ${ballCountName}.bin...`);
bitQueue = '';
const bufOut = Buffer.alloc(expectedOutFileSize);
let i = 0;
solvablesMerged.forEach((solvable) => {
  bitQueue += convertCodeBase(solvable, 36, 2);
  while (bitQueue.length >= 8) {
    bufOut[i] = parseInt(bitQueue.slice(0, 8), 2);
    bitQueue = bitQueue.slice(8);
    i++;
  }
});
if (bitQueue.length > 0) bufOut[i] = byteFromBitRemainder(bitQueue);

fs.writeFileSync(`${ballCountName}.bin`, bufOut);
process.stdout.write('\nAll done!');
