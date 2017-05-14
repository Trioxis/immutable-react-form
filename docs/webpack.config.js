var path = require('path');

module.exports = {
  entry: ['babel-polyfill','./src/index.js'],
  output: {
    filename: './dist/bundle.js'
    // path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[path][name]__[local]--[hash:base64:5]'
          }
        }]
      }
    ]
  },
  resolve: {
    alias:{
      'immutable-react-form': path.resolve(__dirname, '../src/immutable-react-form'),
    }
  }
};
