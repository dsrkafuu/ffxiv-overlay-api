const { nodeResolve } = require('@rollup/plugin-node-resolve');
const typescript = require('@rollup/plugin-typescript');

const name = 'OverlayAPI';
const input = './src/index.ts';

/** @type {import('rollup').RollupOptions} */
const umd = {
  input,
  output: {
    file: './lib/index.js',
    format: 'umd',
    name,
    sourcemap: true,
  },
  plugins: [nodeResolve(), typescript()],
};

/** @type {import('rollup').RollupOptions} */
const esm = {
  input,
  output: {
    file: './lib/index.esm.js',
    format: 'esm',
    sourcemap: true,
  },
  plugins: [nodeResolve(), typescript()],
};

/** @type {import('rollup').RollupOptions} */
const cdn = {
  input,
  output: {
    file: './lib/overlay.min.js',
    format: 'umd',
    name,
    sourcemap: true,
  },
  plugins: [nodeResolve(), typescript()],
};

module.exports = [umd, esm, cdn];
