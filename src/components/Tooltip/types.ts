import { Step } from '../GuideLoop/types';
import { Theme, ThemeConfig } from '../../themes';
import { AnimationConfig } from '../../utils/animation';
import { ElementPosition } from '../../utils/position';

export interface TooltipProps {
  step: Step;
  position: ElementPosition;
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
}