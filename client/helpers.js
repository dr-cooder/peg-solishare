const distanceNoSqrt = (x1, y1, x2, y2) => {
  const xDiff = x2 - x1;
  const yDiff = y2 - y1;
  return xDiff * xDiff + yDiff * yDiff;
};

const byteToBits = (byte) => byte.toString(2).padStart(8, '0');

const byteFromBitRemainder = (bits) => parseInt(bits.padEnd(8, '0'), 2);

// Format miliseconds in HH:MM:SS.MMM
const formatTime = (milisTotal) => {
  const hours = Math.floor(milisTotal / 3600000);
  const mins = Math.floor(milisTotal / 60000) % 60;
  const secs = Math.floor(milisTotal / 1000) % 60;
  const milis = milisTotal % 1000;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${milis.toString().padStart(3, '0')}`;
};

module.exports = {
  distanceNoSqrt,
  byteToBits,
  byteFromBitRemainder,
  formatTime,
};
