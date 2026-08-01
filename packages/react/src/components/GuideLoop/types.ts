import { ReactNode, type ErrorInfo } from 'react';
import type { Theme, ThemeConfig, AnimationConfig, PersistConfig, StepTrigger, WaitForTargetConfig, AdditionalSpotlightTarget, SpotlightShape } from '@guideloop/core';
import type { Placement } from '@popperjs/core';

export type {
  SpotlightShape,
  SpotlightShapeName,
  SpotlightPolygonShape,
  AdditionalSpotlightTarget,
  SpotlightHole,
  StepTrigger,
  StepStatus,
  WaitForTargetConfig,
} from '@guideloop/core';

export type ImageContent = {
  type: 'image';
  src: string;
  alt?: string;
  width?: number;
  height?: number;
} | {
  type: 'svg';
  component: ReactNode;
  width?: number;
  height?: number;
};

export interface ButtonLabels {
  next?: string;
  prev?: string;
  skip?: string;
  finish?: string;
}

export interface ShowButtons {
  next?: boolean;
  previous?: boolean;
  close?: boolean;
}

export interface StepActions {
  nextButtonClickElementId?: string;
  prevButtonClickElementId?: string;
  skipButtonClickElementId?: string;
  nextButtonOnClick?: () => void;
  prevButtonOnClick?: () => void;
  skipButtonOnClick?: () => void;
  nextDelay?: number;
  prevDelay?: number;
  skipDelay?: number;
}

export interface StepUI {
  buttonLabels?: ButtonLabels;
  buttons?: {
    next?: ReactNode;
    prev?: ReactNode;
    close?: ReactNode;
  };
  image?: ImageContent;
  icon?: ReactNode;
  showButtons?: ShowButtons;
  spotlightPadding?: number;
  spotlightShape?: SpotlightShape;
  additionalTargets?: Array<string | AdditionalSpotlightTarget>;
}

export interface StepHooks {
  beforeStep?: () => Promise<void> | void;
  afterStep?: () => Promise<void> | void;
  condition?: () => boolean;
  branch?: () => number | Promise<number>;
}

export interface StepTriggers {
  trigger?: StepTrigger;
  waitForTarget?: boolean | WaitForTargetConfig;
}

export interface Step extends StepActions, StepUI, StepHooks, StepTriggers {
  target: string;
  title: string;
  content: string | ReactNode;
  placement?: Placement;
}


export interface GuideLoopProps {
  steps: Step[];
  isOpen: boolean;
  onClose: () => void;
  theme?: Theme;
  customTheme?: Partial<ThemeConfig>;
  initialStep?: number;
  overlay?: boolean;
  keyboard?: boolean;
  scrollSmooth?: boolean;
  spotlightPadding?: number;
  animations?: AnimationConfig;
  onStepChange?: (step: number) => void;
  onComplete?: () => void;
  onSkip?: () => void;
  zIndex?: number;
  defaultButtonLabels?: ButtonLabels;
  persist?: PersistConfig;
  debug?: boolean | 'auto';
  onError?: (error: Error, info: ErrorInfo) => void;
  fallback?: ReactNode;
}
