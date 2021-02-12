import { babel } from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const IS_PROD = process.env.NODE_ENV === 'production';
const BANNER =
  '/*! ffxiv-overlay-plugin | DSRKafuU (https://dsrkafuu.co) | Copyright MIT License */';

export default {
  input: './src/index.js',
  output: [
    {
      exports: 'auto',
      name: 'OverlayAPI',
      file: pkg.main,
      format: 'umd',
      sourcemap: true,
      banner: BANNER,
    },
    {
      exports: 'auto',
      file: pkg.module,
      format: 'esm',
      sourcemap: true,
      banner: BANNER,
    },
    {
      exports: 'auto',
      name: 'OverlayAPI',
      file: 'lib/overlay.min.js',
      format: 'iife',
      plugins: [IS_PROD && terser()],
      sourcemap: !IS_PROD,
      banner: BANNER,
    },
    {
      exports: 'auto',
      name: 'OverlayAPI',
      file: 'lib/overlay.esm.min.js',
      format: 'esm',
      plugins: [IS_PROD && terser()],
      sourcemap: !IS_PROD,
      banner: BANNER,
    },
  ],
  plugins: [babel({ babelHelpers: 'bundled' })],
};
