// BINARY CODES ARE TO BE PASSED IN
const {
  byteToBits,
  byteFromBitRemainder,
  progressPercent,
  doneHavingStartedAt,
} = require('../client/helpers.js');
const { slotCount } = require('../client/puzzle.js');

const indexBinDigits = slotCount - 3;
const contentsSize = 2 ** (indexBinDigits);

// https://github.com/nodejs/node/issues/37320
class PuzzleSet {
  constructor() {
    this.contents = new Uint8Array(contentsSize);
    this.size = 0;
  }

  add(v) {
    const index = parseInt(v.slice(0, indexBinDigits), 2);
    const subIndex = parseInt(v.slice(indexBinDigits), 2);
    const byteBefore = this.contents[index];
    const bitsBefore = byteToBits(byteBefore);
    if (bitsBefore.charAt(subIndex) === '0') this.size++;
    this.contents[index] = parseInt(`${bitsBefore.slice(0, subIndex)}1${bitsBefore.slice(subIndex + 1)}`, 2);
  }

  toBuffer() {
    const progressMessage = 'Writing set to buffer...';
    const progressMessageLen = progressMessage.length;
    const contentsSizeThousandth = contentsSize / 1000;
    let bytesDone = 0;
    let progressThousandth = 0;
    process.stdout.write(progressMessage);
    progressPercent(0, progressMessageLen);

    let bitQueue = '';
    const byteList = new Uint8Array(Math.ceil((this.size * 33) / 8));
    let byteListIndex = 0;

    const startTime = Date.now();
    for (let i = 0; i < contentsSize; i++) {
      const contentByte = this.contents[i];
      if (contentByte !== 0) {
        const contentBits = byteToBits(contentByte);
        for (let j = 0; j < 8; j++) {
          if (contentBits.charAt(j) === '1') {
            bitQueue += `${i.toString(2).padStart(indexBinDigits, 0)}${j.toString(2).padStart(3, 0)}`;
            while (bitQueue.length >= 8) {
              byteList[byteListIndex] = parseInt(bitQueue.slice(0, 8), 2);
              bitQueue = bitQueue.slice(8);
              byteListIndex++;
            }
          }
        }
      }
      bytesDone++;
      if (bytesDone >= contentsSizeThousandth) {
        bytesDone -= contentsSizeThousandth;
        progressThousandth++;
        progressPercent(progressThousandth, progressMessageLen);
      }
    }
    if (bitQueue.length > 0) byteList[byteListIndex] = byteFromBitRemainder(bitQueue);

    progressPercent(1000, progressMessageLen);
    doneHavingStartedAt(startTime);
    return Buffer.from(byteList);
  }
}

module.exports = PuzzleSet;
