import type { StorageType } from './tourState';

const STORAGE_PREFIX = 'guideloop_onboarding_';

export interface OnboardingState {
  version: number;
  completedIds: string[];
  lastUpdated: number;
}

function getStorage(type: StorageType): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    return type === 'localStorage' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function normalizeIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];

  return ids.reduce<string[]>((result, id) => {
    if (typeof id === 'string' && !result.includes(id)) {
      result.push(id);
    }
    return result;
  }, []);
}

export function saveOnboardingState(
  key: string,
  completedIds: string[],
  type: StorageType = 'localStorage'
): void {
  try {
    const storage = getStorage(type);
    if (!storage) return;

    const state: OnboardingState = {
      version: 1,
      completedIds: normalizeIds(completedIds),
      lastUpdated: Date.now(),
    };

    storage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(state));
  } catch (error) {
    console.warn('GuideLoop: Failed to save onboarding state', error);
  }
}

export function loadOnboardingState(
  key: string,
  type: StorageType = 'localStorage'
): OnboardingState | null {
  try {
    const storage = getStorage(type);
    if (!storage) return null;

    const saved = storage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!saved) return null;

    const parsed = JSON.parse(saved) as Partial<OnboardingState>;
    if (!Array.isArray(parsed.completedIds)) return null;

    return {
      version: typeof parsed.version === 'number' ? parsed.version : 1,
      completedIds: normalizeIds(parsed.completedIds),
      lastUpdated: typeof parsed.lastUpdated === 'number' ? parsed.lastUpdated : 0,
    };
  } catch {
    return null;
  }
}

export function clearOnboardingState(
  key: string,
  type: StorageType = 'localStorage'
): void {
  try {
    const storage = getStorage(type);
    if (!storage) return;
    storage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch {
    // Storage access can be unavailable in privacy or server-rendered contexts.
  }
}
