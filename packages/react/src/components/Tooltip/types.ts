import { CSSProperties } from 'react';
import type { Theme, ThemeConfig, AnimationConfig } from '@guideloop/core';
import type { Step, ButtonLabels } from '../GuideLoop/types';

export interface TooltipProps {
  step: Step;
  theme: Theme;
  customTheme?: Partial<ThemeConfig>;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  isFirst: boolean;
  isLast: boolean;
  currentStep: number;
  totalSteps: number;
  animation?: AnimationConfig['tooltip'];
  defaultButtonLabels?: ButtonLabels;
  style?: CSSProperties;
}
