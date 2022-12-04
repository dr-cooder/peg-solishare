const path = require('path');

module.exports = {
  entry: {
    home: './client/home.jsx',
    play: './client/play.jsx',
    create: './client/create.jsx',
    login: './client/login.jsx',
    explore: './client/explore.jsx',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'hosted'),
    filename: '[name]Bundle.js',
  },
};
