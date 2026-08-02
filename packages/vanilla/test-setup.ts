// Global mocks for vanilla package tests

// Polyfill structuredClone for older Node
if (typeof globalThis.structuredClone === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).structuredClone = <T>(obj: T): T =>
    JSON.parse(JSON.stringify(obj));
}

// Mock ResizeObserver
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).ResizeObserver = MockResizeObserver;

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Keep a functional MutationObserver for waitForTarget tests
// (jsdom provides one; only stub if missing)
if (typeof globalThis.MutationObserver === 'undefined') {
  class MockMutationObserver {
    callback: MutationCallback;
    constructor(callback: MutationCallback) {
      this.callback = callback;
    }
    observe() {}
    disconnect() {}
    takeRecords(): MutationRecord[] {
      return [];
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).MutationObserver = MockMutationObserver;
}

// Mock requestAnimationFrame
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => {
  return setTimeout(cb, 0) as unknown as number;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).cancelAnimationFrame = (id: number) => {
  clearTimeout(id);
};

// process.env for resolveDebugEnabled
process.env.NODE_ENV = 'test';
