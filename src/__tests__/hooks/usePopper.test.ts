import { renderHook } from '@testing-library/react';
import { usePopper } from '../../hooks/usePopper';

jest.mock('@popperjs/core', () => ({
  createPopper: jest.fn(() => ({
    state: {},
    destroy: jest.fn(),
    forceUpdate: jest.fn(),
    update: jest.fn().mockResolvedValue(undefined),
    setOptions: jest.fn(),
  })),
}));

import { createPopper } from '@popperjs/core';

describe('usePopper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates popper instance when both elements exist', () => {
    const ref = document.createElement('div');
    const tooltip = document.createElement('div');

    const { result } = renderHook(() => usePopper({
      referenceElement: ref,
      tooltipElement: tooltip,
    }));

    expect(createPopper).toHaveBeenCalledWith(ref, tooltip, expect.objectContaining({
      placement: 'bottom',
      strategy: 'fixed',
    }));
    expect(result.current.update).toBeDefined();
  });

  it('does not create popper when referenceElement is null', () => {
    renderHook(() => usePopper({
      referenceElement: null,
      tooltipElement: document.createElement('div'),
    }));

    expect(createPopper).not.toHaveBeenCalled();
  });

  it('does not create popper when tooltipElement is null', () => {
    renderHook(() => usePopper({
      referenceElement: document.createElement('div'),
      tooltipElement: null,
    }));

    expect(createPopper).not.toHaveBeenCalled();
  });

  it('does not create popper when both elements are null', () => {
    renderHook(() => usePopper({
      referenceElement: null,
      tooltipElement: null,
    }));

    expect(createPopper).not.toHaveBeenCalled();
  });

  it('destroys popper instance on unmount', () => {
    const ref = document.createElement('div');
    const tooltip = document.createElement('div');
    const mockDestroy = jest.fn();

    (createPopper as jest.Mock).mockReturnValueOnce({
      state: {},
      destroy: mockDestroy,
      forceUpdate: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
      setOptions: jest.fn(),
    });

    const { unmount } = renderHook(() => usePopper({
      referenceElement: ref,
      tooltipElement: tooltip,
    }));

    unmount();
    expect(mockDestroy).toHaveBeenCalledTimes(1);
  });

  it('accepts custom placement', () => {
    const ref = document.createElement('div');
    const tooltip = document.createElement('div');

    renderHook(() => usePopper({
      referenceElement: ref,
      tooltipElement: tooltip,
      placement: 'top',
    }));

    expect(createPopper).toHaveBeenCalledWith(
      ref, tooltip,
      expect.objectContaining({ placement: 'top' })
    );
  });

  it('provides update function that returns undefined when no instance', () => {
    const { result } = renderHook(() => usePopper({
      referenceElement: null,
      tooltipElement: null,
    }));

    expect(result.current.update).toBeDefined();
  });
});
