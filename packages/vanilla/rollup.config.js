import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

const external = [
  '@popperjs/core',
  '@guideloop/core',
];

function jsBuild(input, name) {
  return {
    input,
    output: [
      {
        file: `dist/cjs/${name}.js`,
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
      {
        file: `dist/esm/${name}.js`,
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        exclude: ['**/test-setup.ts', '**/__tests__/**'],
      }),
    ],
    external,
  };
}

function dtsBuild(input, file) {
  return {
    input,
    output: { file, format: 'esm' },
    plugins: [dts()],
    external,
  };
}

export default [
  jsBuild('src/index.ts', 'index'),
  jsBuild('src/web-component.ts', 'web-component'),
  dtsBuild('src/index.ts', 'dist/index.d.ts'),
  dtsBuild('src/web-component.ts', 'dist/web-component.d.ts'),
];
