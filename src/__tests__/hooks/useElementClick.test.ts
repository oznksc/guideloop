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
    const setCurrentStep = jest.fn();
    const setCurrentStepIndex = jest.fn();
    const setTourVisible = jest.fn();
    const dispatchSpy = jest.spyOn(document, 'dispatchEvent');

    const { result } = renderHook(() => useElementClick({ scrollSmooth: false }));

    await act(async () => {
      await result.current.handleElementClick(
        '#btn', 0, undefined, 1, setCurrentStep, setCurrentStepIndex, setTourVisible
      );
      await flushMicrotasks();
    });

    expect(setTourVisible).toHaveBeenCalledWith(false);
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'guideRestart', detail: { nextStep: 1 } })
    );
    dispatchSpy.mockRestore();
  });

  it('warns and advances when element is not found', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    const setCurrentStep = jest.fn();
    const setCurrentStepIndex = jest.fn();
    const setTourVisible = jest.fn();

    const { result } = renderHook(() => useElementClick({ scrollSmooth: false }));

    await act(async () => {
      await result.current.handleElementClick(
        '#nonexistent', 0, undefined, 1, setCurrentStep, setCurrentStepIndex, setTourVisible
      );
    });

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('not found'));
    expect(setCurrentStep).toHaveBeenCalledWith(1);
    expect(setCurrentStepIndex).toHaveBeenCalledWith(1);
    expect(setTourVisible).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('skips processing if already processing', async () => {
    const { result } = renderHook(() => useElementClick({ scrollSmooth: false }));
    result.current.processingRef.current = true;

    const handler = jest.fn();
    await act(async () => {
      await result.current.handleElementClick(
        undefined, 0, handler, 0, jest.fn(), jest.fn(), jest.fn()
      );
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it('calls onClick callback when provided', async () => {
    const onClick = jest.fn();
    const { result } = renderHook(() => useElementClick({ scrollSmooth: false }));

    await act(async () => {
      await result.current.handleElementClick(
        undefined, 0, onClick, undefined, undefined, undefined, undefined
      );
    });

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('advances step index without elementId', async () => {
    const setCurrentStep = jest.fn();
    const setCurrentStepIndex = jest.fn();

    const { result } = renderHook(() => useElementClick({ scrollSmooth: false }));

    await act(async () => {
      await result.current.handleElementClick(
        undefined, 0, undefined, 2, setCurrentStep, setCurrentStepIndex, jest.fn()
      );
    });

    expect(setCurrentStep).toHaveBeenCalledWith(2);
    expect(setCurrentStepIndex).toHaveBeenCalledWith(2);
  });

  it('handles errors gracefully and advances step', async () => {
    const onClick = jest.fn(() => { throw new Error('Click error'); });
    const setCurrentStep = jest.fn();
    const setCurrentStepIndex = jest.fn();
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useElementClick({ scrollSmooth: false }));

    await act(async () => {
      await result.current.handleElementClick(
        undefined, 0, onClick, 3, setCurrentStep, setCurrentStepIndex, jest.fn()
      );
    });

    expect(errorSpy).toHaveBeenCalledWith('Error during element click:', expect.any(Error));
    expect(setCurrentStep).toHaveBeenCalledWith(3);
    errorSpy.mockRestore();
  });

  it('advances step on non-HTMLElement via dispatchEvent', async () => {
    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEl.id = 'svg-element';
    document.body.appendChild(svgEl);

    const clickSpy = jest.spyOn(svgEl, 'dispatchEvent');
    const { result } = renderHook(() => useElementClick({ scrollSmooth: false }));

    await act(async () => {
      await result.current.handleElementClick(
        '#svg-element', 0, undefined, 1, jest.fn(), jest.fn(), jest.fn()
      );
      await flushMicrotasks();
    });

    expect(clickSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'click' }));
    clickSpy.mockRestore();
  });

  it('sets processingRef back to false after completion', async () => {
    const { result } = renderHook(() => useElementClick({ scrollSmooth: false }));

    await act(async () => {
      await result.current.handleElementClick(
        undefined, 0, undefined, 0, jest.fn(), jest.fn(), jest.fn()
      );
    });

    expect(result.current.processingRef.current).toBe(false);
  });

  it('scrolls smoothly before click when scrollSmooth is true', async () => {
    createTarget('smooth-target');
    const scrollIntoViewMock = jest.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;

    const origObserver = window.IntersectionObserver;
    (window as any).IntersectionObserver = undefined;
    const { result } = renderHook(() => useElementClick({ scrollSmooth: true }));

    const promise = result.current.handleElementClick(
      '#smooth-target', 0, undefined, 1, jest.fn(), jest.fn(), jest.fn()
    );
    await act(async () => { await promise; await flushMicrotasks(); });

    expect(scrollIntoViewMock).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'smooth' })
    );
    (window as any).IntersectionObserver = origObserver;
  });
});
