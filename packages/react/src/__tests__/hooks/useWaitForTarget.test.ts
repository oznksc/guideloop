import { renderHook, act } from '@testing-library/react';
import { useWaitForTarget } from '../../hooks/useWaitForTarget';
import { waitForElement } from '@guideloop/core';

jest.mock('@guideloop/core', () => ({
  ...jest.requireActual('@guideloop/core'),
  waitForElement: jest.fn(),
}));

const mockWaitForElement = waitForElement as jest.Mock;

describe('useWaitForTarget', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  it('returns ready=true when enabled is false', () => {
    const { result } = renderHook(() => useWaitForTarget({
      targetSelector: '#test',
      enabled: false,
      config: true,
    }));

    expect(result.current.isReady).toBe(true);
    expect(result.current.isWaiting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('returns ready=true when config is false', () => {
    const { result } = renderHook(() => useWaitForTarget({
      targetSelector: '#test',
      enabled: true,
      config: false,
    }));

    expect(result.current.isReady).toBe(true);
    expect(result.current.isWaiting).toBe(false);
  });

  it('returns ready=true when config is undefined', () => {
    const { result } = renderHook(() => useWaitForTarget({
      targetSelector: '#test',
      enabled: true,
    }));

    expect(result.current.isReady).toBe(true);
    expect(result.current.isWaiting).toBe(false);
  });

  it('returns ready=true when element exists immediately', () => {
    const el = document.createElement('div');
    el.id = 'existing';
    document.body.appendChild(el);

    const { result } = renderHook(() => useWaitForTarget({
      targetSelector: '#existing',
      enabled: true,
      config: true,
    }));

    expect(result.current.isReady).toBe(true);
    expect(result.current.isWaiting).toBe(false);
    expect(mockWaitForElement).not.toHaveBeenCalled();
  });

  it('waits for element and resolves', async () => {
    mockWaitForElement.mockResolvedValue(document.createElement('div'));

    const { result } = renderHook(() => useWaitForTarget({
      targetSelector: '#lazy',
      enabled: true,
      config: true,
    }));

    expect(result.current.isWaiting).toBe(true);
    expect(result.current.isReady).toBe(false);

    await act(async () => {
      await mockWaitForElement.mock.results[0]?.value;
    });

    expect(result.current.isReady).toBe(true);
    expect(result.current.isWaiting).toBe(false);
  });

  it('handles wait error', async () => {
    mockWaitForElement.mockRejectedValue(new Error('Timeout: element not found'));

    const { result } = renderHook(() => useWaitForTarget({
      targetSelector: '#never',
      enabled: true,
      config: true,
    }));

    await act(async () => {
      try {
        await mockWaitForElement.mock.results[0]?.value;
      } catch { /* expected */ }
    });

    expect(result.current.isReady).toBe(false);
    expect(result.current.isWaiting).toBe(false);
    expect(result.current.error).toBe('Timeout: element not found');
  });

  it('passes timeout and root from config object', () => {
    const root = document.createElement('div');
    mockWaitForElement.mockResolvedValue(document.createElement('div'));

    renderHook(() => useWaitForTarget({
      targetSelector: '#with-config',
      enabled: true,
      config: { timeout: 5000, root },
    }));

    expect(mockWaitForElement).toHaveBeenCalledWith(
      '#with-config',
      expect.objectContaining({ timeout: 5000, root })
    );
  });

  it('does not mutate state after unmount', async () => {
    mockWaitForElement.mockResolvedValue(document.createElement('div'));

    const { result, unmount } = renderHook(() => useWaitForTarget({
      targetSelector: '#unmount',
      enabled: true,
      config: true,
    }));

    unmount();

    await act(async () => {
      await mockWaitForElement.mock.results[0]?.value;
    });

    expect(result.current.isReady).toBe(false);
    expect(result.current.isWaiting).toBe(true);
  });

  it('does not set error state after unmount', async () => {
    mockWaitForElement.mockRejectedValue(new Error('Timeout'));

    const { result, unmount } = renderHook(() => useWaitForTarget({
      targetSelector: '#unmount-err',
      enabled: true,
      config: true,
    }));

    unmount();

    await act(async () => {
      try { await mockWaitForElement.mock.results[0]?.value; } catch { /* expected */ }
    });

    expect(result.current.error).toBeNull();
  });

  it('handles invalid selector without crashing', () => {
    mockWaitForElement.mockRejectedValue(new Error('Invalid selector'));

    const { result } = renderHook(() => useWaitForTarget({
      targetSelector: '',
      enabled: true,
      config: true,
    }));

    expect(result.current.isWaiting).toBe(true);
  });
});
