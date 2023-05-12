const { mergeWithRules } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const MiniCssExtractPlugin  = require("mini-css-extract-plugin");

module.exports = env => mergeWithRules({
    module: {
        rules: {
            test: 'match',
            use: 'prepend'
        }    
    }
})(common, {
  mode: 'development',
  devtool: 'eval-source-map',
  watch: false,
  output: {
    filename: 'ixbrlviewer.js',
    path: env.output || path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
        {
            test: /\.less$/,
            use: [ 
                MiniCssExtractPlugin.loader,
                { 
                  loader: 'css-loader', 
                  options: { 
                    url: false,
                    sourceMap: true                    
                  } 
                }
            ]
        }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
        filename: './viewer.css'
    })
  ]
});
