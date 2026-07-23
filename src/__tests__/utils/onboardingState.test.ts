import {
  clearOnboardingState,
  loadOnboardingState,
  saveOnboardingState,
} from '../../utils/onboardingState';

const STORAGE_PREFIX = 'guideloop_onboarding_';

describe('onboardingState', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('saves normalized progress to localStorage and loads it', () => {
    saveOnboardingState('setup', ['profile', 'profile', 'security']);

    expect(loadOnboardingState('setup')).toEqual({
      version: 1,
      completedIds: ['profile', 'security'],
      lastUpdated: expect.any(Number),
    });

    const raw = localStorage.getItem(`${STORAGE_PREFIX}setup`);
    expect(raw).not.toBeNull();
    expect(raw ? JSON.parse(raw) : null).toEqual({
      version: 1,
      completedIds: ['profile', 'security'],
      lastUpdated: expect.any(Number),
    });
  });

  it('keeps localStorage and sessionStorage progress isolated', () => {
    saveOnboardingState('setup', ['local-step']);
    saveOnboardingState('setup', ['session-step'], 'sessionStorage');

    expect(loadOnboardingState('setup')?.completedIds).toEqual(['local-step']);
    expect(loadOnboardingState('setup', 'sessionStorage')?.completedIds).toEqual([
      'session-step',
    ]);
  });

  it('returns null for missing, malformed, or invalid stored state', () => {
    expect(loadOnboardingState('missing')).toBeNull();

    localStorage.setItem(`${STORAGE_PREFIX}malformed`, '{');
    expect(loadOnboardingState('malformed')).toBeNull();

    localStorage.setItem(
      `${STORAGE_PREFIX}invalid`,
      JSON.stringify({ completedIds: 'profile' })
    );
    expect(loadOnboardingState('invalid')).toBeNull();
  });

  it('normalizes loaded ids and tolerates a missing timestamp', () => {
    localStorage.setItem(
      `${STORAGE_PREFIX}legacy`,
      JSON.stringify({ completedIds: ['profile', 42, 'profile'] })
    );

    expect(loadOnboardingState('legacy')).toEqual({
      version: 1,
      completedIds: ['profile'],
      lastUpdated: 0,
    });
  });

  it('clears only the configured storage entry', () => {
    saveOnboardingState('setup', ['local-step']);
    saveOnboardingState('setup', ['session-step'], 'sessionStorage');

    clearOnboardingState('setup', 'sessionStorage');

    expect(loadOnboardingState('setup')?.completedIds).toEqual(['local-step']);
    expect(loadOnboardingState('setup', 'sessionStorage')).toBeNull();
  });

  it('does not throw when storage operations are unavailable', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    const setItem = jest
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('Storage full');
      });

    expect(() => saveOnboardingState('setup', ['profile'])).not.toThrow();
    expect(warn).toHaveBeenCalledWith(
      'GuideLoop: Failed to save onboarding state',
      expect.any(Error)
    );
    setItem.mockRestore();

    const getItem = jest
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('Storage denied');
      });

    expect(loadOnboardingState('setup')).toBeNull();
    getItem.mockRestore();

    const removeItem = jest
      .spyOn(Storage.prototype, 'removeItem')
      .mockImplementation(() => {
        throw new Error('Storage denied');
      });

    expect(() => clearOnboardingState('setup')).not.toThrow();
    removeItem.mockRestore();
  });
});
