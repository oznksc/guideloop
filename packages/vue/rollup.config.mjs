import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

const external = [
  'vue',
  /^vue\//,
  '@guideloop/core',
  '@guideloop/vanilla',
  '@popperjs/core',
];

const plugins = [
  resolve({ browser: true }),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    sourceMap: true,
    declaration: false,
    exclude: ['**/__tests__/**', '**/*.test.ts'],
  }),
];

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins,
    external,
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    plugins,
    external,
  },
];
