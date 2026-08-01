export { GuideLoop, GuideLoopErrorBoundary } from './components/GuideLoop';
export type { GuideLoopErrorBoundaryProps } from './components/GuideLoop';
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

export { OnboardingChecklist } from './components/OnboardingChecklist';
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
} from './components/OnboardingChecklist';

export { Spotlight } from './components/Spotlight';
export type { SpotlightProps } from './components/Spotlight/types';

export { DebugHUD } from './components/DebugHUD';
export type {
  DebugHUDProps,
  DebugSnapshot,
  DebugEvent,
  DebugEventType,
  TargetDebugInfo,
} from './components/DebugHUD/types';

export { Progress } from './components/Progress';
export type { ProgressProps } from './components/Progress/types';

export type { TooltipProps } from './components/Tooltip/types';
export type { MaskedOverlayProps, TargetRect } from './components/MaskedOverlay/types';

export type { Theme, ThemeConfig, AnimationConfig, AnimationSettings, PersistConfig, TourState, OnboardingState } from '@guideloop/core';
export { loadTourState, clearTourState, saveTourState } from '@guideloop/core';
export {
  loadOnboardingState,
  clearOnboardingState,
  saveOnboardingState,
} from '@guideloop/core';
