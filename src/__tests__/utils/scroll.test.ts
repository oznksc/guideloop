import { scrollIntoView } from '../../utils/scroll';

describe('scrollIntoView', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('resolves immediately when element is null', async () => {
    const promise = scrollIntoView(null as unknown as Element);
    jest.runAllTimers();
    await expect(promise).resolves.toBeUndefined();
  });

  it('resolves when element is already intersecting', async () => {
    const el = document.createElement('div');
    const mockObserve = jest.fn();
    const mockDisconnect = jest.fn();

    window.IntersectionObserver = jest.fn().mockImplementation((callback: IntersectionObserverCallback) => {
      setTimeout(() => {
        callback([{ isIntersecting: true } as IntersectionObserverEntry], null as unknown as IntersectionObserver);
      }, 0);
      return { observe: mockObserve, disconnect: mockDisconnect };
    });

    const promise = scrollIntoView(el);
    jest.runAllTimers();
    await promise;
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('calls scrollIntoView and resolves after delay when not intersecting', async () => {
    const el = document.createElement('div');
    el.scrollIntoView = jest.fn();
    const mockDisconnect = jest.fn();

    window.IntersectionObserver = jest.fn().mockImplementation((callback: IntersectionObserverCallback) => {
      setTimeout(() => {
        callback([{ isIntersecting: false } as IntersectionObserverEntry], null as unknown as IntersectionObserver);
      }, 0);
      return { observe: jest.fn(), disconnect: mockDisconnect };
    });

    const promise = scrollIntoView(el);
    jest.runAllTimers();
    await promise;
    expect(el.scrollIntoView).toHaveBeenCalled();
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
