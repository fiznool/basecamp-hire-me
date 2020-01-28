const path = require('path');

module.exports = {
  entry: {
    bundle: './src/index.ts',
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'public'),
  },

  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './public',
  },

  resolve: {
    extensions: ['.ts', '.js'],
  },

  module: {
    rules: [
      {
        test: /\.(ts|js)$/,
        exclude: /node_modules/,
        use: [{ loader: 'babel-loader' }],
      },
    ],
  },

  plugins: [],
};
