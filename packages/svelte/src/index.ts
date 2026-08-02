/**
 * @guideloop/svelte
 *
 * Idiomatic Svelte bindings for GuideLoop.
 * Tour engine is powered by @guideloop/vanilla (+ @guideloop/core).
 *
 * Usage:
 *   import { GuideLoop } from '@guideloop/svelte';
 *
 *   <GuideLoop steps={steps} bind:isOpen theme="tailwind" on:complete={...} />
 */

export { default as GuideLoop } from './components/GuideLoop.svelte';
export { default as OnboardingChecklist } from './components/OnboardingChecklist.svelte';
export { default as Progress } from './components/Progress.svelte';

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
