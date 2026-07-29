import { isBrowser } from '../../utils/env';

describe('isBrowser', () => {
  it('returns true in jsdom test environment', () => {
    expect(isBrowser()).toBe(true);
  });
});
