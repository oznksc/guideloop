module.exports = {
    testEnvironment: 'jsdom',
    transform: {
      '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect', '<rootDir>/src/test-setup.ts'],
    testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
    collectCoverageFrom: [
      'src/**/*.{ts,tsx}',
      '!src/**/*.test.{ts,tsx}',
      '!src/test-setup.ts',
      // Re-export barrels only — no executable logic
      '!src/index.ts',
      '!src/rsc-types.ts',
      // Dev-only Tour Builder is a separate package entry; covered by its own suite
      // but excluded from the core library 90% gate.
      '!src/builder.ts',
      '!src/components/TourBuilder/**',
    ],
    coverageThreshold: {
      global: {
        statements: 87,
        branches: 80,
        functions: 84,
        lines: 90,
      },
    },
  };