import { CSSProperties } from 'react';
import { Theme, ThemeConfig } from '../../themes';
import { AnimationConfig } from '../../utils/animation';
import { Step, ButtonLabels } from '../GuideLoop/types';

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