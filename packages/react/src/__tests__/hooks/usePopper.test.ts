import { renderHook, waitFor, act } from '@testing-library/react';
import { usePopper } from '../../hooks/usePopper';

const mockDestroy = jest.fn();
const mockUpdate = jest.fn().mockResolvedValue(undefined);
const mockCreatePopper = jest.fn(() => ({
  state: {},
  destroy: mockDestroy,
  forceUpdate: jest.fn(),
  update: mockUpdate,
  setOptions: jest.fn(),
}));

jest.mock('@popperjs/core', () => ({
  createPopper: mockCreatePopper,
}));

describe('usePopper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates popper instance when both elements exist', async () => {
    const ref = document.createElement('div');
    const tooltip = document.createElement('div');

    const { result } = renderHook(() =>
      usePopper({
        referenceElement: ref,
        tooltipElement: tooltip,
      })
    );

    await waitFor(() => {
      expect(mockCreatePopper).toHaveBeenCalledWith(
        ref,
        tooltip,
        expect.objectContaining({
          placement: 'bottom',
          strategy: 'fixed',
        })
      );
    });
    expect(result.current.update).toBeDefined();
  });

  it('does not create popper when referenceElement is null', async () => {
    renderHook(() =>
      usePopper({
        referenceElement: null,
        tooltipElement: document.createElement('div'),
      })
    );

    await act(async () => {
      await Promise.resolve();
    });
    expect(mockCreatePopper).not.toHaveBeenCalled();
  });

  it('does not create popper when tooltipElement is null', async () => {
    renderHook(() =>
      usePopper({
        referenceElement: document.createElement('div'),
        tooltipElement: null,
      })
    );

    await act(async () => {
      await Promise.resolve();
    });
    expect(mockCreatePopper).not.toHaveBeenCalled();
  });

  it('does not create popper when both elements are null', async () => {
    renderHook(() =>
      usePopper({
        referenceElement: null,
        tooltipElement: null,
      })
    );

    await act(async () => {
      await Promise.resolve();
    });
    expect(mockCreatePopper).not.toHaveBeenCalled();
  });

  it('destroys popper instance on unmount', async () => {
    const ref = document.createElement('div');
    const tooltip = document.createElement('div');

    const { unmount } = renderHook(() =>
      usePopper({
        referenceElement: ref,
        tooltipElement: tooltip,
      })
    );

    await waitFor(() => {
      expect(mockCreatePopper).toHaveBeenCalled();
    });

    unmount();
    expect(mockDestroy).toHaveBeenCalledTimes(1);
  });

  it('accepts custom placement', async () => {
    const ref = document.createElement('div');
    const tooltip = document.createElement('div');

    renderHook(() =>
      usePopper({
        referenceElement: ref,
        tooltipElement: tooltip,
        placement: 'top',
      })
    );

    await waitFor(() => {
      expect(mockCreatePopper).toHaveBeenCalledWith(
        ref,
        tooltip,
        expect.objectContaining({ placement: 'top' })
      );
    });
  });

  it('provides update function when no instance', () => {
    const { result } = renderHook(() =>
      usePopper({
        referenceElement: null,
        tooltipElement: null,
      })
    );

    expect(result.current.update).toBeDefined();
    expect(() => result.current.update()).not.toThrow();
  });
});
