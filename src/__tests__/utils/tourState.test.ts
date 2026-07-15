import {
  saveTourState,
  loadTourState,
  clearTourState,
} from '../../utils/tourState';

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
});
