/**
 * @guideloop/vanilla
 *
 * Framework-agnostic guided tour library with imperative API.
 * Powered by @guideloop/core.
 *
 * Usage:
 *   import { GuideLoop } from '@guideloop/vanilla';
 *
 *   const tour = new GuideLoop({
 *     steps: [
 *       { target: '#btn', title: 'Click here', content: 'This is the button' },
 *     ],
 *     theme: 'tailwind',
 *   });
 *   tour.start();
 */

// Main class
export { GuideLoop } from './core/GuideLoop';

// Sub-components (for advanced usage / composition)
export { createTooltip } from './components/Tooltip';
export { createSpotlight } from './components/Spotlight';
export { createMaskedOverlay } from './components/MaskedOverlay';
export { createProgress } from './components/Progress';
export { createDebugHUD } from './components/DebugHUD';
export type { DebugSnapshot } from './components/DebugHUD';

// Onboarding Checklist
export { createOnboardingChecklist } from './core/OnboardingChecklist';
export type { OnboardingChecklistInstance } from './core/OnboardingChecklist';

// Utilities
export {
  createPortalElement,
  destroyPortalElement,
  getOrCreatePortalRoot,
  removePortalRoot,
} from './core/Portal';
export { getViewportSize, subscribeViewport } from './core/ViewportTracker';
export { enableKeyboard, disableKeyboard } from './core/KeyboardHandler';
export { createFocusTrap } from './core/FocusTrap';
export { createElementTrigger } from './core/ElementTrigger';
export { handleElementClick } from './core/ElementClick';
export { createSpotlightTracker } from './core/SpotlightTracker';
export type { SpotlightTargetInput } from './core/SpotlightTracker';
export { createDebugLogger, resolveDebugEnabled } from './core/DebugLogger';
export type { DebugEvent, DebugEventType } from './core/DebugLogger';
export { createPopperManager } from './core/PopperManager';

// Core re-exports (types & persistence)
export {
  loadTourState,
  clearTourState,
  saveTourState,
  loadOnboardingState,
  clearOnboardingState,
  saveOnboardingState,
} from '@guideloop/core';

// All types
export type {
  GuideLoopOptions,
  Step,
  ButtonLabels,
  ShowButtons,
  StepActions,
  StepUI,
  StepHooks,
  StepTriggers,
  Theme,
  ThemeConfig,
  AnimationConfig,
  PersistConfig,
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
  OnboardingItem,
  OnboardingProgress,
  OnboardingLabels,
  OnboardingPersistConfig,
  OnboardingChecklistOptions,
} from './core/types';
