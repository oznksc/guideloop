import { Step } from '../GuideLoop/types';
import { Theme } from '../../themes';
import { AnimationConfig } from '../../utils/animation';

export interface TooltipProps {
  step: Step;
  position: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  theme: Theme;
  customTheme?: Record<string, any>;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  isFirst: boolean;
  isLast: boolean;
  currentStep: number;
  totalSteps: number;
  animation?: AnimationConfig;
}