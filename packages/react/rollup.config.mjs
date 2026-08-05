import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import dts from 'rollup-plugin-dts';

const external = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  '@popperjs/core',
  '@guideloop/core',
];

/** Prefix client entry bundles so Next.js / RSC keep a client boundary. */
function useClientBanner() {
  return {
    name: 'use-client-banner',
    renderChunk(code) {
      if (code.startsWith("'use client'") || code.startsWith('"use client"')) {
        return null;
      }
      return { code: `'use client';\n${code}`, map: null };
    },
  };
}

function jsBuild(input, name, { client = false } = {}) {
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
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        exclude: ['**/test-setup.ts', '**/__tests__/**'],
      }),
      ...(client ? [useClientBanner()] : []),
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
  jsBuild('src/index.ts', 'index', { client: true }),
  jsBuild('src/builder.ts', 'builder', { client: true }),
  jsBuild('src/rsc-types.ts', 'rsc-types', { client: false }),
  dtsBuild('src/index.ts', 'dist/index.d.ts'),
  dtsBuild('src/builder.ts', 'dist/builder.d.ts'),
  dtsBuild('src/rsc-types.ts', 'dist/rsc-types.d.ts'),
];
