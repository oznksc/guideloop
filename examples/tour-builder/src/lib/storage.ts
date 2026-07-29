import type { BuilderStep } from './types';
import { STORAGE_KEY, createEmptyStep, isValidPlacement, isValidShape } from './types';

export interface BuilderDraft {
  version: 1;
  steps: BuilderStep[];
  selectedId: string | null;
  updatedAt: number;
}

export function loadDraft(): BuilderDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<BuilderDraft>;
    if (!Array.isArray(data.steps)) return null;
    const steps = data.steps.map((s) =>
      createEmptyStep({
        ...s,
        placement: isValidPlacement(s.placement) ? s.placement : 'bottom',
        spotlightShape: isValidShape(s.spotlightShape)
          ? s.spotlightShape
          : 'rect',
        additionalTargets: Array.isArray(s.additionalTargets)
          ? s.additionalTargets
          : [],
      })
    );
    return {
      version: 1,
      steps,
      selectedId:
        typeof data.selectedId === 'string' || data.selectedId === null
          ? data.selectedId
          : null,
      updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function saveDraft(
  steps: BuilderStep[],
  selectedId: string | null
): void {
  try {
    const draft: BuilderDraft = {
      version: 1,
      steps,
      selectedId,
      updatedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // quota / private mode
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
