const {resolve} = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');


const common = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(mp3|wav|png|jpg)$/,
        use: {loader: 'file-loader'},
        exclude: /node_modules/,
      },
    ],
  },

  devServer: {
    contentBase: './dist',
    hot: true,
  },

  resolve: {
    extensions: ['.js', '.json', '.ts', '.tsx'],
  }
}

// DEMOS

const TreeDemo = {
  entry: './src/demos/tree-demo.tsx',
  output: {
    path: resolve(__dirname, 'dist'),
    filename: 'tree-demo.js',
  }, 

  plugins: [
    new HTMLWebpackPlugin({title: 'Tree Demo'}),
  ],

  ...common,
}

module.exports = TreeDemo;
