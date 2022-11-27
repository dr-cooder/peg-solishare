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

const progressPercent = (progressOutOfThousand, offset) => {
  const beforeDecimal = progressOutOfThousand.toString().padStart(2, '0').padStart(4, ' ');
  // https://blog.bitsrc.io/coloring-your-terminal-using-nodejs-eb647d4af2a2
  const progressText = ` \x1b[32m${beforeDecimal.slice(0, -1)}.${beforeDecimal.slice(-1)}%\x1b[39m`;
  // https://stackoverflow.com/questions/17309749/node-js-console-log-is-it-possible-to-update-a-line-rather-than-create-a-new-l
  process.stdout.cursorTo(offset);
  process.stdout.write(progressText);
};

const doneHavingStartedAt = (startTime) => {
  const timeTaken = Date.now() - startTime;
  process.stdout.write(`\nDone after ${formatTime(timeTaken)}\n`);
};

module.exports = {
  distanceNoSqrt,
  byteToBits,
  byteFromBitRemainder,
  formatTime,
  progressPercent,
  doneHavingStartedAt,
};
