import { ReactNode } from 'react';
import { Theme, ThemeConfig } from '../../themes/types';
import { AnimationConfig } from '../../utils/animation';

export interface Step {
  target: string;
  title: string;
  content: string | ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  spotlightPadding?: number;
  beforeStep?: () => Promise<void> | void;
  afterStep?: () => Promise<void> | void;
  condition?: () => boolean;
  buttons?: {
    next?: ReactNode;
    prev?: ReactNode;
    close?: ReactNode;
  };
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
}