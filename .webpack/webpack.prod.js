const path = require('path');
const { merge } = require('webpack-merge');
const { ESBuildMinifyPlugin } = require('esbuild-loader');
const common = require('./webpack.common');

const umdLibrary = {
  type: 'umd',
  name: 'OverlayAPI',
  export: 'default',
  umdNamedDefine: true,
};

// for cdn script
const cdn = merge(common, {
  mode: 'production',
  entry: path.resolve(__dirname, '../src/index.ts'),
  output: {
    path: path.resolve(__dirname, '../lib'),
    filename: 'overlay.min.js',
    library: umdLibrary,
  },
  optimization: {
    minimize: true,
    minimizer: [
      new ESBuildMinifyPlugin({
        target: 'es2015',
        legalComments: 'eof',
      }),
    ],
  },
});

// for umd library script
const umd = merge(common, {
  mode: 'production',
  entry: path.resolve(__dirname, '../src/index.ts'),
  output: {
    path: path.resolve(__dirname, '../lib'),
    filename: 'index.js',
    library: umdLibrary,
  },
  optimization: {
    minimize: false,
  },
});

// for esm library script
const esm = merge(common, {
  mode: 'production',
  entry: path.resolve(__dirname, '../src/index.ts'),
  output: {
    path: path.resolve(__dirname, '../lib'),
    filename: 'index.esm.js',
    library: {
      type: 'module',
    },
  },
  optimization: {
    minimize: false,
  },
  experiments: {
    outputModule: true,
  },
});

module.exports = [cdn, umd, esm];
