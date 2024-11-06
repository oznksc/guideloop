import { ReactNode } from 'react';
import { Theme, ThemeConfig } from '../../themes/types';
import { AnimationConfig } from '../../utils/animation';
import { Placement } from '@popperjs/core';

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
}

export interface StepHooks {
  beforeStep?: () => Promise<void> | void;
  afterStep?: () => Promise<void> | void;
  condition?: () => boolean;
}

export interface Step extends StepActions, StepUI, StepHooks {
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
}