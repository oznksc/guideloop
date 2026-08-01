import { renderHook, act } from '@testing-library/react';
import { useElementClick } from '../../hooks/useElementClick';

jest.mock('../../utils/events', () => ({
  createRestartEvent: jest.fn((step: number) => new CustomEvent('guideRestart', { detail: { nextStep: step } })),
}));

const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('useElementClick', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  const createTarget = (id: string): HTMLElement => {
    const el = document.createElement('div');
    el.id = id;
    document.body.appendChild(el);
    return el;
  };

  it('returns processingRef initially false', () => {
    const { result } = renderHook(() => useElementClick({ scrollSmooth: true }));
    expect(result.current.processingRef.current).toBe(false);
  });

  it('clicks an HTMLElement and dispatches restart event', async () => {
    createTarget('btn');
    const hideTour = jest.fn();
    const onAdvance = jest.fn();
    const dispatchSpy = jest.spyOn(document, 'dispatchEvent');

    const { result } = renderHook(() => useElementClick({ scrollSmooth: false }));

    await act(async () => {
      await result.current.handleElementClick({
        elementSelector: '#btn',
        delay: 0,
        nextStepIndex: 1,
        hideTour,
        onAdvance,
      });
      await flushMicrotasks();
    });

    expect(hideTour).toHaveBeenCalledWith();
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'guideRestart', detail: { nextStep: 1 } })
    );
    expect(onAdvance).not.toHaveBeenCalled();
    dispatchSpy.mockRestore();
  });

  it('warns and advances when element is not found', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    const onAdvance = jest.fn();
    const hideTour = jest.fn();

    const { result } = renderHook(() => useElementClick({ scrollSmooth: false }));

    await act(async () => {
      await result.current.handleElementClick({
        elementSelector: '#nonexistent',
        nextStepIndex: 1,
        hideTour,
        onAdvance,
      });
    });

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('not found'));
    expect(onAdvance).toHaveBeenCalledWith(1);
    expect(hideTour).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('skips processing if already processing', async () => {
    const { result } = renderHook(() => useElementClick({ scrollSmooth: false }));
    result.current.processingRef.current = true;

    const onClick = jest.fn();
    await act(async () => {
      await result.current.handleElementClick({
        onClick,
        nextStepIndex: 0,
        onAdvance: jest.fn(),
      });
    });

    expect(onClick).not.toHaveBeenCalled();
  });

  it('calls onClick callback when provided', async () => {
    const onClick = jest.fn();
    const { result } = renderHook(() => useElementClick({ scrollSmooth: false }));

    await act(async () => {
      await result.current.handleElementClick({ onClick });
    });

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('advances step index without elementSelector', async () => {
    const onAdvance = jest.fn();

    const { result } = renderHook(() => useElementClick({ scrollSmooth: false }));

    await act(async () => {
      await result.current.handleElementClick({
        nextStepIndex: 2,
        onAdvance,
      });
    });

    expect(onAdvance).toHaveBeenCalledWith(2);
  });

  it('handles errors gracefully and advances step', async () => {
    const onClick = jest.fn(() => {
      throw new Error('Click error');
    });
    const onAdvance = jest.fn();
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useElementClick({ scrollSmooth: false }));

    await act(async () => {
      await result.current.handleElementClick({
        onClick,
        nextStepIndex: 3,
        onAdvance,
      });
    });

    expect(errorSpy).toHaveBeenCalledWith('Error during element click:', expect.any(Error));
    expect(onAdvance).toHaveBeenCalledWith(3);
    errorSpy.mockRestore();
  });

  it('advances step on non-HTMLElement via dispatchEvent', async () => {
    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEl.id = 'svg-element';
    document.body.appendChild(svgEl);

    const clickSpy = jest.spyOn(svgEl, 'dispatchEvent');
    const { result } = renderHook(() => useElementClick({ scrollSmooth: false }));

    await act(async () => {
      await result.current.handleElementClick({
        elementSelector: '#svg-element',
        nextStepIndex: 1,
        hideTour: jest.fn(),
        onAdvance: jest.fn(),
      });
      await flushMicrotasks();
    });

    expect(clickSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'click' }));
    clickSpy.mockRestore();
  });

  it('sets processingRef back to false after completion', async () => {
    const { result } = renderHook(() => useElementClick({ scrollSmooth: false }));

    await act(async () => {
      await result.current.handleElementClick({
        nextStepIndex: 0,
        onAdvance: jest.fn(),
      });
    });

    expect(result.current.processingRef.current).toBe(false);
  });

  it('scrolls smoothly before click when scrollSmooth is true', async () => {
    createTarget('smooth-target');
    const scrollIntoViewMock = jest.fn();
    HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

    const origObserver = window.IntersectionObserver;
    // @ts-expect-error intentional for fallback path
    window.IntersectionObserver = undefined;
    const { result } = renderHook(() => useElementClick({ scrollSmooth: true }));

    const promise = result.current.handleElementClick({
      elementSelector: '#smooth-target',
      nextStepIndex: 1,
      hideTour: jest.fn(),
      onAdvance: jest.fn(),
    });
    await act(async () => {
      await promise;
      await flushMicrotasks();
    });

    expect(scrollIntoViewMock).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'smooth' })
    );
    window.IntersectionObserver = origObserver;
  });
});
