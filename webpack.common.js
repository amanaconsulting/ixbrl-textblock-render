const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: './src/js/index.js',
  context: path.resolve(__dirname),
  module: {
    rules: [
                {
                    test: /\.(woff(2)?|ttf|eot|svg|png|ico)(\?v=\d+\.\d+\.\d+)?$/,
                    use: "base64-inline-loader"
                },
                {
                    test: /\.html$/,
                    use: [ { 
                      loader: "html-loader",
                      options: {
                          esModule: false,
                          minimize: {
                              removeAttributeQuotes: false,
                              keepClosingSlash: true
                          }
                      }
                  }]
                },
                {
                  test: /\.less$/,
                  use: [
                      {
                          loader: "css-loader",
                          options: {
                              esModule: false
                          }
                      },
                      {
                          loader: "less-loader",
                          options: {
                              lessOptions: {
                                  math: "parens-division"
                              }
                          }
                      }
                  ]
              },
              {
                test: /\.(css)$/,
                use: ['to-string-loader', 'css-loader'],
              }
            ]


  }, 
  resolve: {
    alias: {
      'popper.js': path.resolve(__dirname, 'src/popperjs/popper.js')
    }
  },   
  plugins: [
    // Ignore all locale files of moment.js
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment/,
    })
  ]
};
