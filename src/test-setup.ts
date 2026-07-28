import '@testing-library/jest-dom/extend-expect';

jest.mock('@popperjs/core', () => ({
  createPopper: () => ({
    state: {},
    destroy: jest.fn(),
    forceUpdate: jest.fn(),
    update: jest.fn(() => Promise.resolve()),
    setOptions: jest.fn(),
  }),
}));

global.ResizeObserver = class ResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
};

window.HTMLElement.prototype.scrollIntoView = jest.fn();

const originalWarn = console.warn;

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
    const msg = typeof args[0] === 'string' ? args[0] : '';
    if (
      msg.includes('[useSpotlight] Element not found with selector:') ||
      msg.includes('GuideLoop: No HTMLElement found for selector') ||
      msg.includes('GuideLoop: Empty target selector provided')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});
