import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';
import license from 'rollup-plugin-license';

const IS_PROD = process.env.NODE_ENV === 'production';

export default {
  input: './src/index.js',
  output: [
    {
      exports: 'auto',
      name: 'OverlayAPI',
      file: pkg.main,
      format: 'umd',
      sourcemap: true,
    },
    {
      exports: 'auto',
      file: pkg.module,
      format: 'esm',
      sourcemap: true,
    },
    {
      exports: 'auto',
      name: 'OverlayAPI',
      file: 'lib/overlay.min.js',
      format: 'iife',
      plugins: [IS_PROD && terser()],
      sourcemap: !IS_PROD,
    },
    {
      exports: 'auto',
      name: 'OverlayAPI',
      file: 'lib/overlay.esm.min.js',
      format: 'esm',
      plugins: [IS_PROD && terser()],
      sourcemap: !IS_PROD,
    },
  ],
  plugins: [
    babel({ babelHelpers: 'bundled' }),
    license({
      banner: {
        content: `ffxiv-overlay-plugin <%= pkg.version %> | DSRKafuU <amzrk2.cc> | Copyright (c) MIT License`,
        commentStyle: 'ignored',
      },
    }),
  ],
};
