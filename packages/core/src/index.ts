// @guideloop/core
// Framework-agnostic guided tour core logic

export * from './types';

// State Management
export { createStepManager } from './state/step-manager';
export type { StepManager, StepManagerConfig } from './state/step-manager';

// Theme
export { getTheme, mergeTheme, themes } from './themes';

// DOM Utilities
export {
  querySelectorAsHTMLElement,
  getElementRect,
  isHTMLElement,
} from './dom/query';

export { isBrowser, isDevelopmentEnv } from './dom/env';
export { calculateSpotlightHoles } from './dom/spotlight';
export { scrollIntoView } from './dom/scroll';
export { waitForElement } from './dom/wait';
export type { WaitForElementOptions } from './dom/wait';
export { injectKeyframes, getAnimationStyle } from './dom/animation';
export { createRestartEvent, GUIDE_RESTART_EVENT, RESTART_DELAY } from './dom/events';

// Persistence
export { saveTourState, loadTourState, clearTourState } from './state/tour-persist';
export type { TourState, StorageType, PersistConfig } from './state/tour-persist';
export { saveOnboardingState, loadOnboardingState, clearOnboardingState } from './state/onboarding-persist';
export type { OnboardingState } from './state/onboarding-persist';

// Geometry
export { applyPadding } from './geometry/padding';
export {
  resolveSpotlightShape,
  isValidHole,
  getShapeName,
  calculatePolygonPoints,
} from './geometry/shapes';
export type {
  SpotlightShape,
  SpotlightShapeName,
  SpotlightPolygonShape,
  SpotlightRect,
  ResolvedSpotlightShape,
  AdditionalSpotlightTarget as GeometryAdditionalSpotlightTarget,
} from './geometry/spotlightShape';

// TourBuilder
export { buildSelector, isBuilderChrome, resolvePickTarget, validateSelector } from './dom/selectors';
export type { SelectorStatus } from './dom/selectors';
export { exportAsJson, exportAsTypeScript, copyToClipboard, importFromJson, toExportSteps } from './dom/export';
export { loadDraft, saveDraft, clearDraft } from './dom/storage';
export { injectTourBuilderStyles } from './dom/styles';
export { createEmptyStep, isValidPlacement, isValidShape, resolveBuilderEnabled } from './dom/types';
export type { BuilderStep, BuilderMode, PickIntent, TourBuilderProps } from './dom/types';
export { PLACEMENTS, SHAPES, TRIGGERS, DEFAULT_STORAGE_KEY } from './dom/types';

// Onboarding
export { injectOnboardingStyles } from './dom/onboarding-styles';

// Debug
export { buildTargetDebugInfo } from './debug/targets';
export type { TargetDebugInfo } from './debug/targets';
