import type { Step } from '../Walkthrough';
import { AntDesignTooltip } from './AntDesignTooltip';
import { CustomTooltip } from './CustomTooltip';
import { MaterialTooltip } from './MaterialTooltip';
import { TailwindTooltip } from './TailwindTooltip';

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

export interface TooltipVariants {
  antDesign: typeof AntDesignTooltip;
  mui: typeof MaterialTooltip;
  tailwind: typeof TailwindTooltip;
  custom: typeof CustomTooltip;
}

export type TooltipVariant = keyof TooltipVariants;
