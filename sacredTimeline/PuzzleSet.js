const {
  byteToBits,
  byteFromBitRemainder,
  progressPercent,
  doneHavingStartedAt,
} = require('../common/helpers.js');
const { slotCount } = require('../common/puzzle.js');

// Treat each code as a Base2 integer, and store whether the set "has" the puzzle
// by referecing a pre-established-length "bit array" at that integer as an index
// (really a Uint8Array treated as a group of groups of 8 bits)
// meaning we will have to reserve an index for all possible puzzles
const indexBinDigits = slotCount - 3;
const contentsSize = 2 ** (indexBinDigits);

class PuzzleSet {
  constructor() {
    this.contents = new Uint8Array(contentsSize);
    this.size = 0;
  }

  // BINARY CODES ARE TO BE PASSED IN
  add(v) {
    //  110110100101010001010010100110010
    // /\                            /\ /\
    //             index            subIndex
    // the 3-bit subIndex is really just an index of a list of 8 bits,
    // but together index and subIndex form where we are accessing the "bit array"
    const index = parseInt(v.slice(0, indexBinDigits), 2);
    const subIndex = parseInt(v.slice(indexBinDigits), 2);
    // Take the byte containing the bit we want to set to 1
    const byteBefore = this.contents[index];
    // Turn it into a string of 8 bits
    const bitsBefore = byteToBits(byteBefore);
    // Keep track of whether we are actually adding something new
    if (bitsBefore.charAt(subIndex) === '0') this.size++;
    // Modify the byte containing the bit and place it back where it was
    this.contents[index] = parseInt(`${bitsBefore.slice(0, subIndex)}1${bitsBefore.slice(subIndex + 1)}`, 2);
  }

  // Provide the set's contents as a buffer in the binary format used by generate.js
  toBuffer() {
    const progressMessage = 'Writing set to buffer...';
    const progressMessageLen = progressMessage.length;
    // Progress measured as distance traveled through enormous bit array
    const contentsSizeThousandth = contentsSize / 1000;
    let bytesDone = 0;
    let progressThousandth = 0;
    process.stdout.write(progressMessage);
    progressPercent(0, progressMessageLen);

    let bitQueue = '';
    // Find and reserve expected buffer length
    const byteList = new Uint8Array(Math.ceil((this.size * 33) / 8));
    let byteListIndex = 0;

    const startTime = Date.now();
    for (let i = 0; i < contentsSize; i++) {
      const contentByte = this.contents[i];
      if (contentByte !== 0) {
        const contentBits = byteToBits(contentByte);
        for (let j = 0; j < 8; j++) {
          // If we come across an index whose value represents a puzzle contained by the set,
          // identify what code that index represents and add that code to our bitQueue
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
      // Update progress
      bytesDone++;
      if (bytesDone >= contentsSizeThousandth) {
        bytesDone -= contentsSizeThousandth;
        progressThousandth++;
        progressPercent(progressThousandth, progressMessageLen, startTime);
      }
    }
    // Handle remainder
    if (bitQueue.length > 0) byteList[byteListIndex] = byteFromBitRemainder(bitQueue);

    progressPercent(1000, progressMessageLen);
    doneHavingStartedAt(startTime);
    return Buffer.from(byteList);
  }
}

module.exports = PuzzleSet;
