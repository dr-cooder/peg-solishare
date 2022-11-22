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

module.exports = SuperSet;
