import type {
  AnimationConfig,
  ButtonLabels,
  GuideLoopOptions,
  OnboardingChecklistOptions,
  OnboardingItem,
  OnboardingProgress,
  PersistConfig,
  Step,
  Theme,
  ThemeConfig,
} from '@guideloop/vanilla';

export type {
  AnimationConfig,
  ButtonLabels,
  GuideLoopOptions,
  OnboardingChecklistOptions,
  OnboardingItem,
  OnboardingProgress,
  PersistConfig,
  Step,
  Theme,
  ThemeConfig,
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
