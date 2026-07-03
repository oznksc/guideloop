import type { Step } from '../Walkthrough';

export interface BaseTooltipProps {
  currentStep: number;
  totalSteps: number;
  currentStepData: Step;
  defaultShowButtons: {
    next: boolean;
    previous: boolean;
    close: boolean;
  };
  position: {
    top?: number;
    left?: number;
  };
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

export type TooltipVariant = 'antDesign' | 'tailwind' | 'custom';
