import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import path from 'path';
import license from 'rollup-plugin-license';
import copy from 'rollup-plugin-copy';
import pkg from './package.json';

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
      name: 'OverlayAPI',
      file: pkg.browser,
      format: 'umd',
      plugins: [IS_PROD && terser()],
      sourcemap: false,
    },
    {
      exports: 'auto',
      file: pkg.module,
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    babel({ babelHelpers: 'bundled' }),
    license({
      sourcemap: true,
      banner: {
        commentStyle: 'ignored',
        content: { file: path.join(__dirname, '.licenserc'), encoding: 'utf-8' },
      },
    }),
    copy({
      targets: [{ src: 'src/index.d.ts', dest: 'lib/' }],
    }),
  ],
};
