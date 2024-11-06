import { ReactNode } from 'react';
import { Theme, ThemeConfig } from '../../themes/types';
import { AnimationConfig } from '../../utils/animation';

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

export interface Step {
  target: string;
  title: string;
  content: string | ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  image?: ImageContent;
  spotlightPadding?: number;
  beforeStep?: () => Promise<void> | void;
  afterStep?: () => Promise<void> | void;
  condition?: () => boolean;
  buttonLabels?: ButtonLabels;
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
  defaultButtonLabels?: ButtonLabels;
}