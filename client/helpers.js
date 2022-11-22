const distanceNoSqrt = (x1, y1, x2, y2) => {
  const xDiff = x2 - x1;
  const yDiff = y2 - y1;
  return xDiff * xDiff + yDiff * yDiff;
};

const byteToBits = (byte) => byte.toString(2).padStart(8, '0');

const byteFromBitRemainder = (bits) => parseInt(bits.padEnd(8, '0'), 2);

module.exports = {
  distanceNoSqrt,
  byteToBits,
  byteFromBitRemainder,
};
