const fs = require('fs');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const typescript = require('@rollup/plugin-typescript');
const html = require('@rollup/plugin-html');

const name = 'OverlayAPI';
const input = './src/index.ts';

/** @type {import('rollup').RollupOptions} */
const site = {
  input,
  output: {
    file: './docs/overlay.min.js',
    format: 'umd',
    name,
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    typescript({
      declaration: false,
      outDir: './docs',
    }),
    html({
      template: () => fs.readFileSync('./index.html', 'utf-8'),
    }),
  ],
};

module.exports = site;
