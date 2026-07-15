const STORAGE_PREFIX = 'guideloop_';

export interface TourState {
  currentStepIndex: number;
  isActive: boolean;
  lastUpdated: number;
}

export type StorageType = 'localStorage' | 'sessionStorage';

export interface PersistConfig {
  key: string;
  type?: StorageType;
  autoRestore?: boolean;
}

function getStorage(type: StorageType): Storage | null {
  try {
    return type === 'localStorage' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function saveTourState(
  key: string,
  state: Partial<TourState>,
  type: StorageType = 'localStorage'
): void {
  try {
    const storage = getStorage(type);
    if (!storage) return;

    const fullKey = `${STORAGE_PREFIX}${key}`;
    const existing: TourState = loadTourState(key, type) ?? {
      currentStepIndex: 0,
      isActive: false,
      lastUpdated: Date.now(),
    };
    const merged: TourState = {
      ...existing,
      ...state,
      lastUpdated: Date.now(),
    };
    storage.setItem(fullKey, JSON.stringify(merged));
  } catch (e) {
    console.warn('GuideLoop: Failed to save tour state', e);
  }
}

export function loadTourState(
  key: string,
  type: StorageType = 'localStorage'
): TourState | null {
  try {
    const storage = getStorage(type);
    if (!storage) return null;

    const fullKey = `${STORAGE_PREFIX}${key}`;
    const saved = storage.getItem(fullKey);
    if (!saved) return null;
    return JSON.parse(saved) as TourState;
  } catch {
    return null;
  }
}

export function clearTourState(
  key: string,
  type: StorageType = 'localStorage'
): void {
  try {
    const storage = getStorage(type);
    if (!storage) return;

    const fullKey = `${STORAGE_PREFIX}${key}`;
    storage.removeItem(fullKey);
  } catch {
    // silent
  }
}
