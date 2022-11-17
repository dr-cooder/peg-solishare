const path = require('path');

module.exports = {
  entry: {
    main: './client/main.jsx',
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
  // https://stackoverflow.com/questions/33154285/exclude-react-from-webpack-bundle
  // https://webpack.js.org/configuration/externals/
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    'react-router': 'ReactRouter',
  },
};
