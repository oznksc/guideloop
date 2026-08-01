module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts', '@testing-library/jest-dom/extend-expect'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};
