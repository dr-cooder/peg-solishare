// BINARY CODES ARE TO BE PASSED IN, TO BE STORED AS HEXATRIDECIMAL
const { transform, isometryCount, convertCodeBase } = require('../client/puzzle.js');

const imageCount = isometryCount + 1;

// https://github.com/nodejs/node/issues/37320
class PuzzleSet {
  constructor() {
    this.sets = [new Set()];
  }

  add(v) {
    if (!this.has(v)) {
      if (this.sets[this.sets.length - 1].size === 16777000) this.sets.push(new Set());
      this.sets[this.sets.length - 1].add(convertCodeBase(v, 2, 36));
    }
  }

  has(v) {
    const images = [];
    images.push(convertCodeBase(v, 2, 36));
    for (let i = 0; i < isometryCount; i++) {
      images.push(convertCodeBase(transform(v, i), 2, 36));
    }

    for (let i = 0; i < imageCount; i++) {
      const image = images[i];
      for (let j = 0; j < this.sets.length; j++) {
        if (this.sets[j].has(image)) return true;
      }
    }
    return false;
  }

  size() {
    let total = 0;
    for (let i = 0; i < this.sets.length; i++) {
      total += this.sets[i].size;
    }
    return total;
  }

  forEach(callback) {
    for (let i = 0; i < this.sets.length; i++) {
      this.sets[i].forEach(callback);
    }
  }
}

module.exports = PuzzleSet;
