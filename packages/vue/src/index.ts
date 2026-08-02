/**
 * @guideloop/vue
 *
 * Idiomatic Vue 3 bindings for GuideLoop.
 * Tour engine is powered by @guideloop/vanilla (+ @guideloop/core).
 *
 * Usage:
 *   import { GuideLoop } from '@guideloop/vue';
 *
 *   <GuideLoop :steps="steps" v-model:is-open="open" theme="tailwind" @complete="..." />
 */

export { GuideLoop } from './GuideLoop';
export { OnboardingChecklist } from './OnboardingChecklist';
export { Progress } from './Progress';

export type {
  GuideLoopProps,
  ProgressProps,
  GuideLoopOptions,
  Step,
  ButtonLabels,
  Theme,
  ThemeConfig,
  AnimationConfig,
  PersistConfig,
  OnboardingChecklistOptions,
  OnboardingItem,
  OnboardingProgress,
  StepTrigger,
  WaitForTargetConfig,
  AdditionalSpotlightTarget,
  SpotlightShape,
  OnboardingActionContext,
  OnboardingModalAction,
  OnboardingTourAction,
  OnboardingLinkAction,
  OnboardingCustomAction,
  OnboardingItemAction,
  OnboardingLabels,
  OnboardingPersistConfig,
} from './types';

export {
  loadTourState,
  clearTourState,
  saveTourState,
  loadOnboardingState,
  clearOnboardingState,
  saveOnboardingState,
} from '@guideloop/core';
