import { renderHook, act } from '@testing-library/react';
import { useScroll } from '../../hooks/useScroll';

describe('useScroll', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
    Object.defineProperty(window, 'scrollX', { value: 0, configurable: true });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns initial scroll position of 0, 0', () => {
    const { result } = renderHook(() => useScroll());
    expect(result.current).toEqual({ x: 0, y: 0 });
  });

  it('updates position on scroll', () => {
    const { result } = renderHook(() => useScroll());

    Object.defineProperty(window, 'scrollY', { value: 100, configurable: true });
    Object.defineProperty(window, 'scrollX', { value: 50, configurable: true });

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(result.current).toEqual({ x: 50, y: 100 });
  });

  it('cleans up scroll listener on unmount', () => {
    const addSpy = jest.spyOn(window, 'addEventListener');
    const removeSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useScroll());

    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });

    unmount();
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});
