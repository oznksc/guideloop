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
