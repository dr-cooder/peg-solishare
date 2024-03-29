// Sqrt is computationally expensive and currently the only place that needs this
// already has a fixed "C squared"
const distanceNoSqrt = (x1, y1, x2, y2) => {
  const xDiff = x2 - x1;
  const yDiff = y2 - y1;
  return xDiff * xDiff + yDiff * yDiff;
};

// Turns byte into an 8-bit 0/1 string
const byteToBits = (byte) => byte.toString(2).padStart(8, '0');

// Turns bits remaining in a queue string into a padded-out byte so it can be translated back
const byteFromBitRemainder = (bits) => parseInt(bits.padEnd(8, '0'), 2);

// Format miliseconds in HH:MM:SS.MMM
const formatTime = (milisTotal) => {
  const hours = Math.floor(milisTotal / 3600000);
  const mins = Math.floor(milisTotal / 60000) % 60;
  const secs = Math.floor(milisTotal / 1000) % 60;
  const milis = Math.floor(milisTotal) % 1000;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${milis.toString().padStart(3, '0')}`;
};

const progressPercent = (progressOutOfThousand, offset, startTime) => {
  let etaText = '';
  if (startTime && progressOutOfThousand > 0) {
    etaText = ` ETA \x1b[93m${formatTime(((Date.now() - startTime) / progressOutOfThousand) * (1000 - progressOutOfThousand))}\x1b[39m`;
  }
  if (progressOutOfThousand === 1000) {
    // https://stackoverflow.com/questions/32938213/is-there-a-way-to-erase-the-last-line-of-output
    etaText = '\x1b[K';
  }
  const beforeDecimal = progressOutOfThousand.toString().padStart(2, '0').padStart(4, ' ');
  // https://blog.bitsrc.io/coloring-your-terminal-using-nodejs-eb647d4af2a2
  const progressText = ` \x1b[32m${beforeDecimal.slice(0, -1)}.${beforeDecimal.slice(-1)}%\x1b[39m${etaText}`;
  // https://stackoverflow.com/questions/17309749/node-js-console-log-is-it-possible-to-update-a-line-rather-than-create-a-new-l
  process.stdout.cursorTo(offset);
  process.stdout.write(progressText);
};

const doneHavingStartedAt = (startTime) => {
  const timeTaken = Date.now() - startTime;
  process.stdout.write(`\nDone after ${formatTime(timeTaken)}\n`);
};

const loadImage = (url) => new Promise((resolve, reject) => {
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.src = url;
  img.onload = () => {
    resolve(img);
  };
  img.onerror = (e) => {
    reject(e);
  };
});

// Send a POST request and return the response
const sendPost = async (url, data) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (result.redirect) {
    window.location = result.redirect;
  }

  return result;
};

module.exports = {
  distanceNoSqrt,
  byteToBits,
  byteFromBitRemainder,
  formatTime,
  progressPercent,
  doneHavingStartedAt,
  loadImage,
  sendPost,
};
