/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.svelte$': [
      'svelte-jester',
      {
        preprocess: './svelte.config.js',
      },
    ],
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: {
          esModuleInterop: true,
          module: 'commonjs',
          moduleResolution: 'node',
          target: 'ES2019',
          lib: ['ES2019', 'DOM'],
          strict: true,
          skipLibCheck: true,
          isolatedModules: true,
        },
      },
    ],
  },
  moduleFileExtensions: ['js', 'ts', 'svelte'],
  moduleNameMapper: {
    '^@guideloop/core$': '<rootDir>/../core/src/index.ts',
    '^@guideloop/vanilla$': '<rootDir>/../vanilla/src/index.ts',
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  // Svelte ships ESM; transform it for Jest/CJS
  transformIgnorePatterns: ['/node_modules/(?!(svelte)/)'],
};
