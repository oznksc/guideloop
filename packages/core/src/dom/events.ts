export const GUIDE_RESTART_EVENT = 'guideRestart';
export const RESTART_DELAY = 100;

/** Dispatch to remeasure spotlight/tooltip geometry (zoom, layout, canvas pan). */
export const GUIDE_REFRESH_EVENT = 'guideloop:refresh';

export type GuideRestartEvent = CustomEvent<{ nextStep: number }>;

export const createRestartEvent = (nextStep: number) =>
  new CustomEvent(GUIDE_RESTART_EVENT, {
    detail: { nextStep }
  });

/**
 * Ask every mounted tour to re-read target bounding boxes.
 * Safe to call from non-browser environments (no-op).
 */
export function dispatchTargetRefresh(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(GUIDE_REFRESH_EVENT));
}
