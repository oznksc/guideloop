/**
 * @guideloop/angular
 *
 * Standalone Angular components for GuideLoop tours & onboarding.
 * Tour engine is powered by @guideloop/vanilla (+ @guideloop/core).
 */

export { GuideLoopComponent } from './guide-loop.component';
export { OnboardingChecklistComponent } from './onboarding-checklist.component';
export { ProgressComponent } from './progress.component';

export type {
  AnimationConfig,
  ButtonLabels,
  GuideLoopOptions,
  OnboardingActionContext,
  OnboardingChecklistOptions,
  OnboardingCustomAction,
  OnboardingItem,
  OnboardingItemAction,
  OnboardingLabels,
  OnboardingLinkAction,
  OnboardingModalAction,
  OnboardingPersistConfig,
  OnboardingProgress,
  OnboardingTourAction,
  PersistConfig,
  SpotlightShape,
  Step,
  StepTrigger,
  Theme,
  ThemeConfig,
  WaitForTargetConfig,
  AdditionalSpotlightTarget,
} from './types';

export {
  loadTourState,
  clearTourState,
  saveTourState,
  loadOnboardingState,
  clearOnboardingState,
  saveOnboardingState,
} from '@guideloop/core';
