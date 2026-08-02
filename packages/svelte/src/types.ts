import type {
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
} from '@guideloop/vanilla';

export type {
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
};

export type {
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
} from '@guideloop/vanilla';

export interface GuideLoopProps {
  steps: Step[];
  isOpen?: boolean;
  theme?: Theme;
  customTheme?: Partial<ThemeConfig>;
  initialStep?: number;
  overlay?: boolean;
  keyboard?: boolean;
  scrollSmooth?: boolean;
  spotlightPadding?: number;
  animations?: AnimationConfig;
  zIndex?: number;
  defaultButtonLabels?: ButtonLabels;
  persist?: PersistConfig;
  debug?: boolean | 'auto';
}

export interface ProgressProps {
  current: number;
  total: number;
  theme?: Theme;
  customTheme?: Partial<ThemeConfig>;
}
