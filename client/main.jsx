const Configuration = require('./Configuration.jsx');

const sample = new Configuration('a23efb5c1');
console.log(sample.gridToString());
console.log(sample.allValidMoves());
