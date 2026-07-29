/**
 * RSC-safe entry: types and pure helpers only.
 *
 * Server Components may import from `guideloop/types` without pulling client
 * components or creating a client boundary. Do not add React components here.
 *
 * @example
 * ```ts
 * // app/tour-steps.ts  (Server Component / shared module)
 * import type { Step } from 'guideloop/types';
 *
 * export const steps: Step[] = [
 *   { target: '#cta', title: 'Hello', content: '…' },
 * ];
 * ```
 */

export type {
  Step,
  GuideLoopProps,
  ButtonLabels,
  StepStatus,
  StepTrigger,
  ShowButtons,
  ImageContent,
  WaitForTargetConfig,
  SpotlightShape,
  SpotlightShapeName,
  SpotlightPolygonShape,
  AdditionalSpotlightTarget,
  SpotlightHole,
} from './components/GuideLoop/types';

export type {
  OnboardingActionContext,
  OnboardingChecklistProps,
  OnboardingCustomAction,
  OnboardingItem,
  OnboardingItemAction,
  OnboardingLabels,
  OnboardingLinkAction,
  OnboardingModalAction,
  OnboardingPersistConfig,
  OnboardingProgress,
  OnboardingTourAction,
} from './components/OnboardingChecklist/types';

export type { Theme, ThemeConfig } from './themes/types';
export type { AnimationConfig, AnimationSettings } from './utils/animation';
export type { PersistConfig, TourState, StorageType } from './utils/tourState';
export type { OnboardingState } from './utils/onboardingState';

// Storage helpers are SSR-safe (no-op when `window` is missing).
export { loadTourState, clearTourState, saveTourState } from './utils/tourState';
export {
  loadOnboardingState,
  clearOnboardingState,
  saveOnboardingState,
} from './utils/onboardingState';
