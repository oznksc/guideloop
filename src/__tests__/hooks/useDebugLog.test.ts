import { renderHook, act } from '@testing-library/react';
import { useDebugLog, resolveDebugEnabled } from '../../hooks/useDebugLog';

describe('useDebugLog', () => {
  it('records events when enabled', () => {
    const { result } = renderHook(() => useDebugLog(true));
    act(() => {
      result.current.push('open', 'hello', 0);
      result.current.push('next', 'go', 1);
    });
    expect(result.current.events).toHaveLength(2);
    expect(result.current.events[0].message).toBe('hello');
    expect(result.current.events[1].type).toBe('next');
  });

  it('no-ops when disabled', () => {
    const { result } = renderHook(() => useDebugLog(false));
    act(() => {
      result.current.push('open', 'should not appear');
    });
    expect(result.current.events).toHaveLength(0);
  });

  it('caps history at 50 events', () => {
    const { result } = renderHook(() => useDebugLog(true));
    act(() => {
      for (let i = 0; i < 60; i += 1) {
        result.current.push('info', `e${i}`);
      }
    });
    expect(result.current.events).toHaveLength(50);
    expect(result.current.events[0].message).toBe('e10');
    expect(result.current.events[49].message).toBe('e59');
  });
});

describe('resolveDebugEnabled', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('returns true when debug is true', () => {
    process.env.NODE_ENV = 'production';
    expect(resolveDebugEnabled(true)).toBe(true);
  });

  it('returns false when debug is false', () => {
    process.env.NODE_ENV = 'development';
    expect(resolveDebugEnabled(false)).toBe(false);
  });

  it('auto-enables only in development', () => {
    process.env.NODE_ENV = 'development';
    expect(resolveDebugEnabled('auto')).toBe(true);
    expect(resolveDebugEnabled(undefined)).toBe(true);
  });

  it('auto-disables in production and test', () => {
    process.env.NODE_ENV = 'production';
    expect(resolveDebugEnabled('auto')).toBe(false);
    expect(resolveDebugEnabled(undefined)).toBe(false);

    process.env.NODE_ENV = 'test';
    expect(resolveDebugEnabled('auto')).toBe(false);
    expect(resolveDebugEnabled(undefined)).toBe(false);
  });
});
