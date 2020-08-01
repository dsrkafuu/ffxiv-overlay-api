import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

import pkg from './package.json';

const IS_PROD = process.env.NODE_ENV === 'production';

export default {
  input: './src/main.js',
  output: [
    {
      exports: 'auto',
      file: pkg.main,
      format: 'esm',
    },
    {
      exports: 'auto',
      name: 'OverlayAPI',
      file: pkg.browser,
      format: 'umd',
      plugins: [IS_PROD && terser()],
    },
  ],
  plugins: [resolve({ browser: true }), commonjs(), babel({ babelHelpers: 'runtime' })],
};
