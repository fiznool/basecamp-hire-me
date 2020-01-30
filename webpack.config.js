// Huge thanks to https://survivejs.com/webpack/
const path = require('path');
const merge = require('webpack-merge');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const common = {
  entry: {
    bundle: './src/index.ts',
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'public'),
  },

  resolve: {
    extensions: ['.ts', '.js'],
  },

  module: {
    rules: [
      {
        test: /\.(ts|js)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
    }),
  ],
};

const development = {
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './public',
    watchContentBase: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};

const production = {
  output: {
    filename: '[name].[chunkhash:7].js',
  },
  devtool: 'source-map',
  optimization: {
    splitChunks: {
      chunks: 'initial',
    },
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*', '!fragments*/**'],
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:7].css',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
};

module.exports = (mode = 'development') => {
  if (mode === 'production') {
    return merge(common, production, { mode });
  }

  return merge(common, development, { mode });
};
