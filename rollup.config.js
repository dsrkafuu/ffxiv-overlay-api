import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

import path from 'path';
import license from 'rollup-plugin-license';

import pkg from './package.json';

const IS_PROD = process.env.NODE_ENV === 'production';

export default {
  input: './src/main.js',
  output: [
    {
      exports: 'auto',
      file: pkg.main,
      format: 'cjs',
    },
    {
      exports: 'auto',
      file: pkg.module,
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
  plugins: [
    resolve({ browser: true }),
    commonjs(),
    babel({ babelHelpers: 'runtime' }),
    license({
      sourcemap: true,
      banner: {
        commentStyle: 'ignored',
        content: { file: path.join(__dirname, 'BANNER'), encoding: 'utf-8' },
      },
    }),
  ],
};
