export { GuideLoop } from './components/GuideLoop';
export type {
  Step,
  GuideLoopProps,
  ButtonLabels,
  StepStatus,
  StepTrigger,
  ShowButtons,
  ImageContent,
  WaitForTargetConfig,
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

export { Progress } from './components/Progress';
export type { ProgressProps } from './components/Progress/types';

export type { TooltipProps } from './components/Tooltip/types';
export type { MaskedOverlayProps, TargetRect } from './components/MaskedOverlay/types';

export type { Theme, ThemeConfig } from './themes/types';
export type { AnimationConfig, AnimationSettings } from './utils/animation';
export type { PersistConfig, TourState } from './utils/tourState';
export { loadTourState, clearTourState, saveTourState } from './utils/tourState';
export type { OnboardingState } from './utils/onboardingState';
export {
  loadOnboardingState,
  clearOnboardingState,
  saveOnboardingState,
} from './utils/onboardingState';
