import { ReactNode } from 'react';
import { Theme, ThemeConfig } from '../../themes/types';
import { AnimationConfig } from '../../utils/animation';
import { PersistConfig } from '../../utils/tourState';
import { Placement } from '@popperjs/core';
import type { SpotlightShape, AdditionalSpotlightTarget } from '../../utils/spotlightShape';

export type {
  SpotlightShape,
  SpotlightShapeName,
  SpotlightPolygonShape,
  AdditionalSpotlightTarget,
  SpotlightHole,
} from '../../utils/spotlightShape';

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
  /**
   * Shape of the primary spotlight / overlay cutout.
   * @default 'rect'
   */
  spotlightShape?: SpotlightShape;
  /**
   * Additional elements to highlight in the same step (multi-spotlight).
   * Tooltip, scroll, triggers, and waitForTarget still use the primary `target`.
   * Each entry may be a CSS selector string or a full config object.
   */
  additionalTargets?: Array<string | AdditionalSpotlightTarget>;
}

export interface StepHooks {
  beforeStep?: () => Promise<void> | void;
  afterStep?: () => Promise<void> | void;
  condition?: () => boolean;
  branch?: () => number | Promise<number>;
}

export type StepStatus = 'idle' | 'pending' | 'success' | 'error';

export type StepTrigger = 'click' | 'change' | 'blur' | 'hover' | 'drag';

export interface WaitForTargetConfig {
  timeout?: number;
  root?: HTMLElement;
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
  /**
   * Interactive debug HUD (step stats, target status, event history).
   * - `true` — always show when the tour is open
   * - `false` — never show
   * - `'auto'` / omitted — show only when `process.env.NODE_ENV === 'development'`
   */
  debug?: boolean | 'auto';
}