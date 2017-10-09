// Alias 'seek-style-guide' so 'seek-style-guide-webpack' works correctly
const path = require('path');
require('module-alias').addAlias('seek-style-guide', path.join(__dirname, '..'));

const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const autoprefixerConfig = require('../config/autoprefixer.config');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const decorateClientConfig = require('seek-style-guide-webpack').decorateClientConfig;
const babelConfig = require('../config/babel.config.js')({ reactHotLoader: false });

const appCss = new ExtractTextPlugin('app.css');

// Must be absolute paths
const appPaths = [
  path.resolve(__dirname, 'src'),
  path.resolve(__dirname, 'wip_modules')
];

const config = {
  entry: path.resolve(__dirname, 'src/client-render'),

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    libraryTarget: 'umd'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        include: appPaths,
        use: {
          loader: 'babel-loader',
          options: babelConfig
        }
      },
      {
        test: /\.js$/,
        include: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            presets: ['env']
          }
        }
      },
      {
        test: /\.less$/,
        include: appPaths,
        loader: appCss.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                modules: true,
                localIdentName: '[name]__[local]___[hash:base64:5]'
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: [autoprefixer(autoprefixerConfig)]
              }
            },
            {
              loader: 'less-loader'
            }
          ]
        }),
      },
      {
        test: /\.svg$/,
        include: appPaths,
        use: [
          {
            loader: 'raw-loader'
          },
          {
            loader: 'svgo-loader'
          }
        ]
      }
    ]
  },

  resolve: {
    modules: ['node_modules', 'wip_modules', 'components']
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.BASE_HREF': JSON.stringify(process.env.BASE_HREF)
    }),
    appCss,
    new webpack.optimize.UglifyJsPlugin({
      output: {
        comments: false
      },
      compress: {
        warnings: false
      }
    })
  ],

  stats: { children: false }
};

module.exports = decorateClientConfig(config, {
  extractTextPlugin: appCss
});
