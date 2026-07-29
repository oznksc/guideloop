import type { BuilderStep } from './types';

export interface HistorySnapshot {
  steps: BuilderStep[];
  selectedId: string | null;
}

const MAX = 50;

export function pushHistory(
  stack: HistorySnapshot[],
  snapshot: HistorySnapshot
): HistorySnapshot[] {
  const next = [...stack, cloneSnapshot(snapshot)];
  return next.length > MAX ? next.slice(next.length - MAX) : next;
}

export function cloneSnapshot(snapshot: HistorySnapshot): HistorySnapshot {
  return {
    steps: snapshot.steps.map((s) => ({
      ...s,
      additionalTargets: [...(s.additionalTargets ?? [])],
    })),
    selectedId: snapshot.selectedId,
  };
}
