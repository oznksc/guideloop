import { isBrowser, isDevelopmentEnv } from '../../dom/env';

describe('isBrowser', () => {
  it('returns true in jsdom test environment', () => {
    expect(isBrowser()).toBe(true);
  });
});

describe('isDevelopmentEnv', () => {
  const original = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = original;
  });

  it('is true only when NODE_ENV is development', () => {
    process.env.NODE_ENV = 'development';
    expect(isDevelopmentEnv()).toBe(true);

    process.env.NODE_ENV = 'production';
    expect(isDevelopmentEnv()).toBe(false);

    process.env.NODE_ENV = 'test';
    expect(isDevelopmentEnv()).toBe(false);
  });
});
