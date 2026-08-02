/**
 * Public types for @guideloop/vanilla
 */

import type { Theme, ThemeConfig, AnimationConfig, PersistConfig, StepTrigger, WaitForTargetConfig, AdditionalSpotlightTarget, SpotlightShape } from '@guideloop/core';

export type {
  Theme,
  ThemeConfig,
  AnimationConfig,
  PersistConfig,
  StepTrigger,
  WaitForTargetConfig,
  AdditionalSpotlightTarget,
  SpotlightShape,
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
    next?: string | HTMLElement;
    prev?: string | HTMLElement;
    close?: string | HTMLElement;
  };
  image?: {
    type: 'image';
    src: string;
    alt?: string;
    width?: number;
    height?: number;
  } | {
    type: 'svg';
    component: string | HTMLElement;
    width?: number;
    height?: number;
  };
  icon?: string | HTMLElement;
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
  title?: string;
  content?: string | HTMLElement;
  placement?: string;
}

export interface GuideLoopOptions {
  steps: Step[];
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
  onClose?: () => void;
  zIndex?: number;
  defaultButtonLabels?: ButtonLabels;
  persist?: PersistConfig;
  debug?: boolean | 'auto';
}

export type DebugEventType =
  | 'open'
  | 'close'
  | 'next'
  | 'prev'
  | 'skip'
  | 'trigger'
  | 'step-change'
  | 'target-missing'
  | 'target-found'
  | 'wait'
  | 'error'
  | 'info';

export interface DebugEvent {
  id: number;
  ts: number;
  type: DebugEventType;
  message: string;
  stepIndex?: number;
}

export interface TargetDebugInfo {
  selector: string;
  found: boolean;
  role: 'primary' | 'additional';
  rect?: { top: number; left: number; width: number; height: number };
  shape?: string;
}

export interface DebugSnapshot {
  currentStep: number;
  totalSteps: number;
  stepTitle: string | undefined;
  stepStatus: string;
  targetReady: boolean;
  targetWaiting: boolean;
  tourVisible: boolean;
  targets: TargetDebugInfo[];
  trigger?: StepTrigger;
  waitForTarget?: boolean | WaitForTargetConfig;
  stepEnteredAt: number;
  events: DebugEvent[];
  persistKey?: string;
}

// ─── Onboarding Checklist Types ───

export interface OnboardingActionContext {
  itemId: string;
  isComplete: boolean;
  setCompleted: (completed: boolean) => void;
  complete: () => void;
  uncomplete: () => void;
  close: () => void;
}

export interface OnboardingModalAction {
  type: 'modal';
  title?: string;
  content: string | HTMLElement | ((context: OnboardingActionContext) => string | HTMLElement);
  primaryLabel?: string;
  secondaryLabel?: string;
  completeOnPrimary?: boolean;
  closeOnPrimary?: boolean;
  onPrimary?: (context: OnboardingActionContext) => boolean | void | Promise<boolean | void>;
  onSecondary?: (context: OnboardingActionContext) => void;
  onClose?: (context: OnboardingActionContext) => void;
}

export interface OnboardingTourAction {
  type: 'tour';
  steps: Step[];
  guideOptions?: Omit<GuideLoopOptions, 'steps' | 'onClose' | 'onComplete' | 'onSkip'>;
  completeOnSkip?: boolean;
  onComplete?: (context: OnboardingActionContext) => void;
  onSkip?: (context: OnboardingActionContext) => void;
  onClose?: (context: OnboardingActionContext) => void;
}

export interface OnboardingLinkAction {
  type: 'link';
  href: string;
  target?: string;
  rel?: string;
  completeOnClick?: boolean;
  onNavigate?: (context: OnboardingActionContext) => void;
}

export interface OnboardingCustomAction {
  type: 'custom';
  onAction: (context: OnboardingActionContext) => void | Promise<void>;
  completeOnResolve?: boolean;
}

export type OnboardingItemAction =
  | OnboardingModalAction
  | OnboardingTourAction
  | OnboardingLinkAction
  | OnboardingCustomAction;

export interface OnboardingItem {
  id: string;
  title: string | HTMLElement;
  description?: string | HTMLElement;
  icon?: string | HTMLElement;
  action?: OnboardingItemAction;
  disabled?: boolean;
}

export interface OnboardingProgress {
  completed: number;
  total: number;
  percentage: number;
  completedIds: string[];
}

export interface OnboardingLabels {
  progress: (completed: number, total: number) => string;
  completed: string;
  loading: string;
  error: string;
  done: string;
  close: string;
  collapse: string;
  expand: string;
}

export interface OnboardingPersistConfig {
  key: string;
  type?: 'localStorage' | 'sessionStorage';
}

export interface OnboardingChecklistOptions {
  items: OnboardingItem[];
  title?: string;
  description?: string;
  completedIds?: string[];
  defaultCompletedIds?: string[];
  onCompletedIdsChange?: (completedIds: string[]) => void;
  onProgressChange?: (progress: OnboardingProgress) => void;
  onComplete?: (progress: OnboardingProgress) => void;
  onItemAction?: (item: OnboardingItem) => void;
  onActionError?: (error: unknown, item: OnboardingItem) => void;
  persist?: OnboardingPersistConfig;
  theme?: Theme;
  customTheme?: Partial<ThemeConfig>;
  labels?: Partial<OnboardingLabels>;
  collapsible?: boolean;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  showProgressBar?: boolean;
  emptyState?: string;
  ariaLabel?: string;
  className?: string;
  zIndex?: number;
}
