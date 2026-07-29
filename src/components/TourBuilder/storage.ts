import type { BuilderStep } from './types';
import {
  createEmptyStep,
  isValidPlacement,
  isValidShape,
} from './types';

export interface BuilderDraft {
  version: 1;
  steps: BuilderStep[];
  selectedId: string | null;
  updatedAt: number;
}

export function loadDraft(storageKey: string): BuilderDraft | null {
  try {
    const raw = localStorage.getItem(storageKey);
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
  storageKey: string,
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
    localStorage.setItem(storageKey, JSON.stringify(draft));
  } catch {
    // ignore
  }
}

export function clearDraft(storageKey: string): void {
  try {
    localStorage.removeItem(storageKey);
  } catch {
    // ignore
  }
}
