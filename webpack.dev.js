const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

module.exports = env => merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  watch: false,
  output: {
    filename: 'ixbrlviewer.js',
    path: env.output || path.resolve(__dirname, 'dist')
  },
});
