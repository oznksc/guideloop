// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import external from 'rollup-plugin-peer-deps-external';
import dts from 'rollup-plugin-dts';
import { existsSync, readFileSync } from 'fs';

/** Never bundle these — consumers resolve them (and can code-split @popperjs/core). */
const externalDeps = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  /@popperjs\/core(\/.*)?/,
];

const terserOptions = {
  compress: {
    passes: 2,
    pure_getters: true,
    unsafe_arrows: true,
  },
  mangle: true,
  format: {
    comments: false,
  },
};

/**
 * Ensure `"use client"` survives minify so Next.js / RSC create client boundaries.
 */
function preserveUseClient() {
  return {
    name: 'preserve-use-client',
    renderChunk(code, chunk) {
      const facade = chunk.facadeModuleId
        ? chunk.facadeModuleId.split('?')[0]
        : null;
      if (!facade || !existsSync(facade)) {
        return null;
      }

      let src;
      try {
        src = readFileSync(facade, 'utf8').trimStart();
      } catch {
        return null;
      }

      const isClient =
        src.startsWith("'use client'") || src.startsWith('"use client"');
      if (!isClient) {
        return null;
      }

      if (
        code.startsWith("'use client'") ||
        code.startsWith('"use client"')
      ) {
        return null;
      }

      return {
        code: `"use client";\n${code}`,
        map: { mappings: '' },
      };
    },
  };
}

function createBuild(format) {
  const dir = format === 'esm' ? 'dist/esm' : 'dist/cjs';
  return {
    input: {
      index: 'src/index.ts',
      // RSC-safe type/util surface (no components / no "use client")
      'rsc-types': 'src/rsc-types.ts',
    },
    output: {
      dir,
      format,
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: '[name].js',
      ...(format === 'cjs' ? { exports: 'named' } : {}),
    },
    plugins: [
      external(),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: format === 'esm',
        declarationDir: format === 'esm' ? 'dist/esm' : undefined,
        rootDir: 'src',
        outDir: dir,
        exclude: [
          '**/*.test.ts',
          '**/*.test.tsx',
          'src/__tests__/**',
          'src/test-setup.ts',
        ],
      }),
      terser(terserOptions),
      // After terser: re-apply directive from source file
      preserveUseClient(),
    ],
    external: externalDeps,
  };
}

/**
 * ESM + CJS preserveModules graphs so unused exports can be tree-shaken.
 * @popperjs/core stays external and is loaded dynamically from usePopper.
 */
export default [
  createBuild('esm'),
  createBuild('cjs'),
  {
    input: 'dist/esm/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [dts()],
    external: [/\.css$/, /@popperjs\/core/],
  },
  {
    input: 'dist/esm/rsc-types.d.ts',
    output: [{ file: 'dist/rsc-types.d.ts', format: 'esm' }],
    plugins: [dts()],
    external: [/\.css$/, /@popperjs\/core/],
  },
];
