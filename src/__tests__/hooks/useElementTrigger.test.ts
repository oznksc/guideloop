import React from 'react';
import { renderHook, act, render } from '@testing-library/react';
import { useElementTrigger } from '../../hooks/useElementTrigger';

describe('useElementTrigger', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  const setupTarget = () => {
    const btn = document.createElement('button');
    btn.id = 'test-target';
    btn.textContent = 'Click Me';
    document.body.appendChild(btn);
    return btn;
  };

  it('calls onTrigger when click event fires on target', () => {
    const onTrigger = jest.fn();
    setupTarget();

    renderHook(() => useElementTrigger({
      enabled: true,
      targetSelector: '#test-target',
      trigger: 'click',
      onTrigger,
    }));

    act(() => {
      document.getElementById('test-target')?.click();
    });
    expect(onTrigger).toHaveBeenCalledTimes(1);
  });

  it('calls onTrigger on change event', () => {
    const onTrigger = jest.fn();
    const input = document.createElement('input');
    input.id = 'test-input';
    document.body.appendChild(input);

    renderHook(() => useElementTrigger({
      enabled: true,
      targetSelector: '#test-input',
      trigger: 'change',
      onTrigger,
    }));

    act(() => {
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(onTrigger).toHaveBeenCalledTimes(1);
  });

  it('calls onTrigger on blur event', () => {
    const onTrigger = jest.fn();
    const input = document.createElement('input');
    input.id = 'test-blur';
    document.body.appendChild(input);

    renderHook(() => useElementTrigger({
      enabled: true,
      targetSelector: '#test-blur',
      trigger: 'blur',
      onTrigger,
    }));

    act(() => {
      input.dispatchEvent(new Event('blur', { bubbles: true }));
    });
    expect(onTrigger).toHaveBeenCalledTimes(1);
  });

  it('calls onTrigger on hover (mouseenter) event', () => {
    const onTrigger = jest.fn();
    const el = document.createElement('div');
    el.id = 'test-hover';
    document.body.appendChild(el);

    renderHook(() => useElementTrigger({
      enabled: true,
      targetSelector: '#test-hover',
      trigger: 'hover',
      onTrigger,
    }));

    act(() => {
      el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    });
    expect(onTrigger).toHaveBeenCalledTimes(1);
  });

  it('does not attach listener when disabled', () => {
    const onTrigger = jest.fn();
    const btn = setupTarget();

    const { rerender } = renderHook(
      ({ enabled }) => useElementTrigger({
        enabled,
        targetSelector: '#test-target',
        trigger: 'click',
        onTrigger,
      }),
      { initialProps: { enabled: false } }
    );

    act(() => { btn.click(); });
    expect(onTrigger).not.toHaveBeenCalled();
  });

  it('warns when target element is not found', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();

    renderHook(() => useElementTrigger({
      enabled: true,
      targetSelector: '#nonexistent',
      trigger: 'click',
      onTrigger: jest.fn(),
    }));

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('not found')
    );
    warn.mockRestore();
  });

  it('uses latest onTrigger callback via ref', () => {
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    setupTarget();

    const { rerender } = renderHook(
      ({ cb }) => useElementTrigger({
        enabled: true,
        targetSelector: '#test-target',
        trigger: 'click',
        onTrigger: cb,
      }),
      { initialProps: { cb: fn1 } }
    );

    rerender({ cb: fn2 });

    act(() => {
      document.getElementById('test-target')?.click();
    });
    expect(fn2).toHaveBeenCalledTimes(1);
    expect(fn1).not.toHaveBeenCalled();
  });
});
