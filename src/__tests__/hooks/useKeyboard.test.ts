import { renderHook } from '@testing-library/react';
import { useKeyboard } from '../../hooks/useKeyboard';

describe('useKeyboard', () => {
  const createKeyEvent = (key: string) => new KeyboardEvent('keydown', { key, bubbles: true });

  it('calls onEscape when Escape is pressed', () => {
    const onEscape = jest.fn();
    renderHook(() => useKeyboard({ enabled: true, onEscape }));

    window.dispatchEvent(createKeyEvent('Escape'));
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('calls onArrowRight when ArrowRight is pressed', () => {
    const onArrowRight = jest.fn();
    renderHook(() => useKeyboard({ enabled: true, onArrowRight }));

    window.dispatchEvent(createKeyEvent('ArrowRight'));
    expect(onArrowRight).toHaveBeenCalledTimes(1);
  });

  it('calls onArrowLeft when ArrowLeft is pressed', () => {
    const onArrowLeft = jest.fn();
    renderHook(() => useKeyboard({ enabled: true, onArrowLeft }));

    window.dispatchEvent(createKeyEvent('ArrowLeft'));
    expect(onArrowLeft).toHaveBeenCalledTimes(1);
  });

  it('calls onEnter when Enter is pressed', () => {
    const onEnter = jest.fn();
    renderHook(() => useKeyboard({ enabled: true, onEnter }));

    window.dispatchEvent(createKeyEvent('Enter'));
    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  it('does not trigger callbacks when enabled is false', () => {
    const onEscape = jest.fn();
    renderHook(() => useKeyboard({ enabled: false, onEscape }));

    window.dispatchEvent(createKeyEvent('Escape'));
    expect(onEscape).not.toHaveBeenCalled();
  });

  it('cleans up event listeners on unmount', () => {
    const onEscape = jest.fn();
    const { unmount } = renderHook(() => useKeyboard({ enabled: true, onEscape }));

    unmount();
    window.dispatchEvent(createKeyEvent('Escape'));
    expect(onEscape).not.toHaveBeenCalled();
  });

  it('only calls the matching key handler', () => {
    const onEscape = jest.fn();
    const onArrowRight = jest.fn();
    const onArrowLeft = jest.fn();
    const onEnter = jest.fn();

    renderHook(() => useKeyboard({ enabled: true, onEscape, onArrowRight, onArrowLeft, onEnter }));

    window.dispatchEvent(createKeyEvent('ArrowRight'));
    expect(onArrowRight).toHaveBeenCalledTimes(1);
    expect(onEscape).not.toHaveBeenCalled();
    expect(onArrowLeft).not.toHaveBeenCalled();
    expect(onEnter).not.toHaveBeenCalled();
  });

  it('handles undefined callbacks without error', () => {
    renderHook(() => useKeyboard({ enabled: true }));

    expect(() => {
      window.dispatchEvent(createKeyEvent('Escape'));
      window.dispatchEvent(createKeyEvent('ArrowRight'));
    }).not.toThrow();
  });

  it('re-attaches listeners when enabled changes', () => {
    const onEscape = jest.fn();
    const { rerender } = renderHook(
      ({ enabled }) => useKeyboard({ enabled, onEscape }),
      { initialProps: { enabled: false } }
    );

    window.dispatchEvent(createKeyEvent('Escape'));
    expect(onEscape).not.toHaveBeenCalled();

    rerender({ enabled: true });
    window.dispatchEvent(createKeyEvent('Escape'));
    expect(onEscape).toHaveBeenCalledTimes(1);
  });
});
