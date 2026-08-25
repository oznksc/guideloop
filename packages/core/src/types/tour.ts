export type PersistType = 'localStorage' | 'sessionStorage';

export interface TourState {
  currentStepIndex: number;
  isActive: boolean;
}

export interface PersistConfig {
  key: string;
  type?: PersistType;
  autoRestore?: boolean;
}

/**
 * Why a tour ended. Passed to `onClose` so consumers do not have to infer
 * skip vs complete vs dismiss from a generic close callback.
 *
 * - `close` — overlay click, Escape, or an explicit close control
 * - `skip` — Skip button (any step)
 * - `complete` — Finish / Next on the last step
 */
export type TourEndReason = 'close' | 'skip' | 'complete';

/** Fired when a step's primary or additional target is not in the DOM. */
export interface TargetMissingInfo {
  selector: string;
  stepIndex: number;
  role: 'primary' | 'additional';
}
