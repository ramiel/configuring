/* eslint-env node */

import typescriptPlugin from 'rollup-plugin-typescript2';
import typescript from 'typescript';
import resolve from 'rollup-plugin-node-resolve';
import pkg from './package.json';

const isProd = process.env.NODE_ENV === 'production';

export default [
  {
    input: 'src/index.ts',
    external: [...Object.keys(pkg.peerDependencies || {})],
    plugins: [
      resolve({
        only: [...Object.keys(pkg.dependencies || {})],
      }),
      typescriptPlugin({
        clean: isProd,
        typescript,
      }),
    ],
    output: [
      {
        file: pkg.main,
        format: 'cjs',
      },
      {
        file: pkg.module,
        format: 'es',
      },
    ],
  },
];
