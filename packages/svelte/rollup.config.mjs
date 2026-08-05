import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import svelte from 'rollup-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';

const external = [
  'svelte',
  'svelte/internal',
  'svelte/store',
  'svelte/transition',
  /^svelte\//,
  '@guideloop/core',
  '@guideloop/vanilla',
  '@popperjs/core',
];

const plugins = [
  svelte({
    preprocess: sveltePreprocess({ typescript: true }),
    compilerOptions: {
      dev: false,
    },
    emitCss: false,
  }),
  resolve({
    browser: true,
    dedupe: ['svelte'],
    exportConditions: ['svelte'],
  }),
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
