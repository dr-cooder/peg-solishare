const fs = require('fs');
const Configuration = require('./client/Configuration.js');
const { height, width, spaces } = require('./client/grid.js');

let bitQueue = Array(spaces).fill('1').join('0'.repeat(spaces));
const data = [];

while (bitQueue.length >= 8) {
  data.push(parseInt(bitQueue.slice(0, 8), 2));
  bitQueue = bitQueue.slice(8);
}
data.push(parseInt(bitQueue.padEnd(8, '0'), 2));

// https://youtu.be/R4vV4szAoDY
const buf = Buffer.from(data);

fs.open('1.bin', 'w', (errRead, fd) => {
  if (errRead) {
    console.log(errRead.message);
  } else {
    console.log('Opened 1.bin');

    fs.write(fd, buf, 0, buf.byteLength, 0, (errWrite, bytes) => {
      if (errWrite) {
        console.log(errWrite.message);
      } else {
        console.log(`Wrote to 1.bin - ${bytes.toLocaleString('en-US')} bytes`);
      }
    });

    fs.close(fd, () => {
      console.log('Closed 1.bin');
      // Now keep going with the buffer - "stream" it back into a list of grids
      bitQueue = '';
      for (let i = 0; i < buf.byteLength; i++) {
        bitQueue += buf[i].toString(2).padStart(8, '0');
        while (bitQueue.length >= spaces) {
          const binCode = bitQueue.slice(0, spaces);
          console.log(new Configuration(binCode).gridToString());
          console.log();
          bitQueue = bitQueue.slice(spaces);
        }
      }
    });
  }
});

/*
// https://www.geeksforgeeks.org/node-js-fs-read-method/
let inBuf = null;
fs.stat('1.bin', (errStat, stats) => {
  fs.open('1.bin', 'r', (errOpen, fd) => {
    inBuf = Buffer.alloc(stats.size);
    fs.read(fd, inBuf, 0, inBuf.length, null, (errRead, bytesRead, buffer) => {
      console.log('buffer');
      console.log(buffer);
    });
  });
});
console.log('inBuf');
console.log(inBuf);
*/

/*
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
*/
