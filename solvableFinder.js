const fs = require('fs');
const Configuration = require('./client/Configuration.js');
const { height, width, spaces } = require('./client/grid.js');

const ballCount = 9;
const moveDiff = 1 - ballCount;
const solvables = new Set();
const config = new Configuration();

for (let v = 0; v < height; v++) {
  for (let u = 0; u < width; u++) {
    if (config.grid[v][u] !== 2) {
      config.grid[v][u] = 1;
      // Recursion takes place here!
      const possibleParents = config.generation(moveDiff, true);
      possibleParents.forEach((e) => solvables.add(e));
      config.grid[v][u] = 0;
    }
  }
}
// OBSERVATION: exponential by a factor of ~4
let bitQueue = '';
const data = [];

solvables.forEach((e) => {
  bitQueue += e;
  while (bitQueue.length >= spaces) {
    data.push(parseInt(bitQueue.slice(0, 8), 2));
    bitQueue = bitQueue.slice(8);
  }
});
data.push(parseInt(bitQueue.padEnd(8, '0'), 2));

const buf = Buffer.from(data);

// https://youtu.be/R4vV4szAoDY
const bufData = `${ballCount}.bin`;

fs.open(bufData, 'w', (err, fd) => {
  if (err) {
    console.log(`code: ${err.code}\nmessage: ${err.message}`);
  } else {
    fs.write(fd, buf, 0, buf.byteLength, 0, (err2, bytes) => {
      if (err2) {
        console.log(err2.message);
      } else {
        console.log(`${bytes} bytes written`);
      }
    });

    fs.close(fd, () => {
      console.log('File closed!');
    });
  }
});
