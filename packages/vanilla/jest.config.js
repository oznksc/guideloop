/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          esModuleInterop: true,
          module: 'commonjs',
          moduleResolution: 'node',
          target: 'ES2019',
          lib: ['ES2019', 'DOM', 'DOM.Iterable'],
          strict: true,
          skipLibCheck: true,
          resolveJsonModule: true,
          isolatedModules: true,
        },
      },
    ],
  },
  moduleNameMapper: {
    '^@guideloop/core$': '<rootDir>/../core/src/index.ts',
  },
  setupFiles: ['<rootDir>/test-setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};
