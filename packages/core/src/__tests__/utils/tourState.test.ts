import {
  saveTourState,
  loadTourState,
  clearTourState,
} from '../../state/tour-persist';

const STORAGE_PREFIX = 'guideloop_';

describe('tourState', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('saves and loads tour state from localStorage', () => {
    saveTourState('test-tour', { currentStepIndex: 3, isActive: true });
    const loaded = loadTourState('test-tour');
    expect(loaded).toEqual({
      currentStepIndex: 3,
      isActive: true,
      lastUpdated: expect.any(Number),
    });
  });

  it('saves and loads tour state from sessionStorage', () => {
    saveTourState('test-tour', { currentStepIndex: 1, isActive: false }, 'sessionStorage');
    const loaded = loadTourState('test-tour', 'sessionStorage');
    expect(loaded).toEqual({
      currentStepIndex: 1,
      isActive: false,
      lastUpdated: expect.any(Number),
    });
  });

  it('merges with existing state', () => {
    saveTourState('test-tour', { currentStepIndex: 2, isActive: true });
    saveTourState('test-tour', { isActive: false });
    const loaded = loadTourState('test-tour');
    expect(loaded?.currentStepIndex).toBe(2);
    expect(loaded?.isActive).toBe(false);
  });

  it('clears tour state', () => {
    saveTourState('test-tour', { currentStepIndex: 0, isActive: true });
    clearTourState('test-tour');
    expect(loadTourState('test-tour')).toBeNull();
  });

  it('returns null for non-existent state', () => {
    expect(loadTourState('nonexistent')).toBeNull();
  });

  it('uses correct storage prefix', () => {
    saveTourState('my-key', { currentStepIndex: 0, isActive: true });
    const raw = localStorage.getItem(`${STORAGE_PREFIX}my-key`);
    expect(raw).not.toBeNull();
  });

  it('separates keys correctly', () => {
    saveTourState('tour-a', { currentStepIndex: 1, isActive: true });
    saveTourState('tour-b', { currentStepIndex: 5, isActive: false });
    expect(loadTourState('tour-a')?.currentStepIndex).toBe(1);
    expect(loadTourState('tour-b')?.currentStepIndex).toBe(5);
  });

  it('does not throw when storage is unavailable', () => {
    const mock = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage full');
    });
    expect(() => saveTourState('test', { currentStepIndex: 0, isActive: true })).not.toThrow();
    mock.mockRestore();
  });

  it('does not throw on load when storage is unavailable', () => {
    const mock = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage denied');
    });
    expect(() => loadTourState('test')).not.toThrow();
    expect(loadTourState('test')).toBeNull();
    mock.mockRestore();
  });

  it('does not throw on clear when storage is unavailable', () => {
    const mock = jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('Storage denied');
    });
    expect(() => clearTourState('test')).not.toThrow();
    mock.mockRestore();
  });

  it('returns null for corrupt JSON', () => {
    localStorage.setItem('guideloop_corrupt', '{not valid json');
    expect(loadTourState('corrupt')).toBeNull();
  });

  it('returns null when getStorage returns null', () => {
    const mock = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new TypeError('window.localStorage is not an object');
    });
    expect(loadTourState('test')).toBeNull();
    mock.mockRestore();
  });

  it('returns null when getStorage fails on save', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    const mock = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    saveTourState('test', { currentStepIndex: 0, isActive: true });
    expect(warn).toHaveBeenCalledWith('GuideLoop: Failed to save tour state', expect.any(Error));
    mock.mockRestore();
    warn.mockRestore();
  });

  it('uses default type localStorage when not specified', () => {
    saveTourState('default-type', { currentStepIndex: 0, isActive: true });
    expect(localStorage.getItem('guideloop_default-type')).not.toBeNull();
    expect(sessionStorage.getItem('guideloop_default-type')).toBeNull();
  });

  it('loads with default type localStorage', () => {
    saveTourState('load-default', { currentStepIndex: 2, isActive: false });
    const loaded = loadTourState('load-default');
    expect(loaded?.currentStepIndex).toBe(2);
  });

  it('properly removes stored state on clear', () => {
    saveTourState('clear-me', { currentStepIndex: 0, isActive: true });
    expect(loadTourState('clear-me')).not.toBeNull();
    clearTourState('clear-me');
    expect(localStorage.getItem('guideloop_clear-me')).toBeNull();
  });

  it('does not clear unrelated keys', () => {
    saveTourState('keep-me', { currentStepIndex: 0, isActive: true });
    saveTourState('delete-me', { currentStepIndex: 0, isActive: true });
    clearTourState('delete-me');
    expect(loadTourState('keep-me')).not.toBeNull();
    expect(loadTourState('delete-me')).toBeNull();
  });
});
