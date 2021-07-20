import { babel } from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy';
import pkg from './package.json';

const IS_PROD = process.env.NODE_ENV === 'production';
const BANNER = `/*! ffxiv-overlay-plugin v${pkg.version} | DSRKafuU (https://dsrkafuu.su) | Copyright (c) MIT License */`;

export default {
  input: './src/index.js',
  output: [
    {
      file: pkg.main,
      format: 'esm',
      sourcemap: true,
      banner: BANNER,
    },
    {
      name: 'OverlayAPI',
      file: 'lib/overlay.min.js',
      format: 'iife',
      plugins: [IS_PROD && terser()],
      sourcemap: !IS_PROD,
      banner: BANNER,
    },
  ],
  plugins: [
    babel({ babelHelpers: 'bundled' }),
    copy({ targets: [{ src: 'src/index.d.ts', dest: 'lib/', rename: 'index.esm.d.ts' }] }),
  ],
};
