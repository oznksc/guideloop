import { renderHook, act } from '@testing-library/react';
import { useSpotlight } from '../../hooks/useSpotlight';

describe('useSpotlight', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    window.innerWidth = 1024;
    window.innerHeight = 768;
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
    Object.defineProperty(window, 'scrollX', { value: 0, configurable: true });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns default position when selector is null', () => {
    const { result } = renderHook(() => useSpotlight(null));
    expect(result.current).toEqual({ top: 0, left: 0, width: 0, height: 0 });
  });

  it('returns default position when selector is undefined', () => {
    const { result } = renderHook(() => useSpotlight(undefined));
    expect(result.current).toEqual({ top: 0, left: 0, width: 0, height: 0 });
  });

  it('returns default position when element is not found', () => {
    const { result } = renderHook(() => useSpotlight('#nonexistent'));
    expect(result.current).toEqual({ top: 0, left: 0, width: 0, height: 0 });
  });

  it('computes correct position for existing element', () => {
    const el = document.createElement('div');
    el.id = 'target';
    el.getBoundingClientRect = jest.fn(() => ({
      top: 100, left: 200, width: 300, height: 50,
      bottom: 150, right: 500, x: 200, y: 100,
      toJSON: jest.fn(),
    }));
    document.body.appendChild(el);

    const { result } = renderHook(() => useSpotlight('#target'));

    expect(result.current.top).toBe(92);
    expect(result.current.left).toBe(192);
    expect(result.current.width).toBe(316);
    expect(result.current.height).toBe(66);
  });

  it('applies padding correctly', () => {
    const el = document.createElement('div');
    el.id = 'pad';
    el.getBoundingClientRect = jest.fn(() => ({
      top: 100, left: 200, width: 100, height: 50,
      bottom: 150, right: 300, x: 200, y: 100,
      toJSON: jest.fn(),
    }));
    document.body.appendChild(el);

    const { result } = renderHook(() => useSpotlight('#pad', 20));

    expect(result.current.top).toBe(80);
    expect(result.current.left).toBe(180);
    expect(result.current.width).toBe(140);
    expect(result.current.height).toBe(90);
  });

  it('recalculates on scroll event', () => {
    const el = document.createElement('div');
    el.id = 'scroll-target';
    el.getBoundingClientRect = jest.fn(() => ({
      top: 100, left: 200, width: 300, height: 50,
      bottom: 150, right: 500, x: 200, y: 100,
      toJSON: jest.fn(),
    }));
    document.body.appendChild(el);

    const { result } = renderHook(() => useSpotlight('#scroll-target', 8));

    expect(result.current.top).toBe(92);

    (el.getBoundingClientRect as jest.Mock).mockImplementation(() => ({
      top: 50, left: 100, width: 300, height: 50,
      bottom: 100, right: 400, x: 100, y: 50,
      toJSON: jest.fn(),
    }));

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.top).toBe(42);
    expect(result.current.left).toBe(92);
  });

  it('re-renders on resize', () => {
    const el = document.createElement('div');
    el.id = 'resize-target';
    el.getBoundingClientRect = jest.fn(() => ({
      top: 100, left: 200, width: 300, height: 50,
      bottom: 150, right: 500, x: 200, y: 100,
      toJSON: jest.fn(),
    }));
    document.body.appendChild(el);

    const { result } = renderHook(() => useSpotlight('#resize-target'));

    expect(result.current.width).toBe(316);

    (el.getBoundingClientRect as jest.Mock).mockImplementation(() => ({
      top: 200, left: 400, width: 150, height: 80,
      bottom: 280, right: 550, x: 400, y: 200,
      toJSON: jest.fn(),
    }));

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.top).toBe(192);
    expect(result.current.left).toBe(392);
    expect(result.current.width).toBe(166);
  });
});
