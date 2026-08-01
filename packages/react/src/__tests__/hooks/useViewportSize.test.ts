import { renderHook, act } from '@testing-library/react';
import { useViewportSize } from '../../hooks/useViewportSize';

describe('useViewportSize', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns initial viewport dimensions', () => {
    const { result } = renderHook(() => useViewportSize());
    expect(result.current).toEqual({ width: 1024, height: 768 });
  });

  it('updates on resize event', () => {
    const { result } = renderHook(() => useViewportSize());

    Object.defineProperty(window, 'innerWidth', { value: 800, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 600, configurable: true });

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(result.current).toEqual({ width: 800, height: 600 });
  });

  it('cleans up on unmount', () => {
    const removeSpy = jest.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useViewportSize());

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('cancels animation frame on unmount', () => {
    const cancelSpy = jest.spyOn(window, 'cancelAnimationFrame');
    const { unmount } = renderHook(() => useViewportSize());

    unmount();

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(cancelSpy).toHaveBeenCalled();
    cancelSpy.mockRestore();
  });

  it('handles resize with multiple rapid events', () => {
    const { result } = renderHook(() => useViewportSize());

    Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 400, configurable: true });

    act(() => {
      window.dispatchEvent(new Event('resize'));
      window.dispatchEvent(new Event('resize'));
    });

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(result.current).toEqual({ width: 500, height: 400 });
  });

  it('re-throws no error when window is closed during resize', () => {
    const { unmount } = renderHook(() => useViewportSize());
    unmount();

    expect(() => {
      window.dispatchEvent(new Event('resize'));
    }).not.toThrow();
  });
});
